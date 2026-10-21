package by.chaika19.mobyfamily.service;

import static by.chaika19.mobyfamily.service.CommandBus.Context;
import static by.chaika19.mobyfamily.service.DomainSupport.*;

import by.chaika19.mobyfamily.api.*;
import by.chaika19.mobyfamily.domain.*;
import java.math.*;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DepositService {
  private final DomainSupport s;

  public DepositService(DomainSupport s) {
    this.s = s;
  }

  public Api.ActionResult configure(Context c, Api.DepositPlan req) {
    var p = s.parentChild(c, req.childId());
    s.activeChild(p);
    var existing = s.db.first(LongTermDeposit.class, "e.childId=?1", p.id);
    BigDecimal minimum =
        req.planType().equals("LUMP_SUM_2000")
            ? new BigDecimal("2000.00")
            : new BigDecimal("500.00");
    if (req.initialAmount().compareTo(minimum) < 0)
      throw ApiException.bad("DEPOSIT_MINIMUM", "Минимальный стартовый взнос: " + minimum);
    if (req.planType().equals("LUMP_SUM_2000")
        && req.parent1Monthly().add(req.parent2Monthly()).signum() != 0)
      throw ApiException.bad(
          "INVALID_PLAN", "Для разового вклада ежемесячные взносы должны быть нулевыми");
    LongTermDeposit d;
    if (existing.isPresent()) {
      d = existing.get();
      if (!d.status.equals("ACTIVE"))
        throw ApiException.conflict("DEPOSIT_CLOSED", "Вклад уже завершён");
      if (req.initialAmount().compareTo(d.initialDeposit) != 0)
        throw ApiException.bad(
            "INITIAL_ALREADY_PAID", "Стартовый взнос уже внесён; используйте пополнение");
    } else {
      s.parentPays(c.family(), req.initialAmount());
      d = new LongTermDeposit();
      d.childId = p.id;
      d.initialDeposit = req.initialAmount();
      d.currentBalance = req.initialAmount();
      d.bufferBalance = ZERO;
      d.interestRate = new BigDecimal("11.50");
      d.openedOn = s.today();
      d.nextAccrualDate = s.today().plusMonths(1);
      d.nextRolloverDate = s.today().plusMonths(37);
      d.maturityDate = p.birthDate.plusYears(18);
      d.consecutiveMonths = 0;
      d.grantEligible = false;
      d.grantPaid = false;
      d.adultPackageAccepted = false;
      d.status = "ACTIVE";
      d.giftToken = UUID.randomUUID().toString() + UUID.randomUUID().toString().replace("-", "");
    }
    d.planType = req.planType();
    d.monthlyAutoPayParent1 = req.parent1Monthly();
    d.monthlyAutoPayParent2 = req.parent2Monthly();
    d.projectedFinalAmount = project(d, s.today());
    if (existing.isEmpty()) s.db.save(d);
    s.event(c.family().id, p.id, "DEPOSIT_CHANGED");
    return new Api.ActionResult(
        d.id,
        "ACTIVE",
        d.currentBalance,
        null,
        d.projectedFinalAmount,
        "Прогноз при неизменной ставке; грант не включён");
  }

  /** End-of-month contributions, monthly capitalization, no guarantee of future bank rates. */
  public BigDecimal project(LongTermDeposit d, LocalDate asOf) {
    int months = (int) Math.max(0, ChronoUnit.MONTHS.between(asOf, d.maturityDate));
    BigDecimal balance = d.currentBalance.add(d.bufferBalance),
        pay = d.monthlyAutoPayParent1.add(d.monthlyAutoPayParent2);
    BigDecimal factor =
        BigDecimal.ONE.add(d.interestRate.divide(new BigDecimal("1200"), 16, RoundingMode.HALF_UP));
    for (int i = 0; i < months; i++) balance = money(balance.multiply(factor)).add(pay);
    return money(balance);
  }

  public Api.ActionResult gift(Context c, UUID id, Api.Money req) {
    c.actor().parent();
    var d = s.required(LongTermDeposit.class, id);
    s.parentChild(c, d.childId);
    if (!d.status.equals("ACTIVE") || !s.today().isBefore(d.maturityDate))
      throw ApiException.conflict("DEPOSIT_CLOSED", "Вклад больше не принимает пополнения");
    s.parentPays(c.family(), req.amount());
    d.bufferBalance = d.bufferBalance.add(req.amount());
    d.projectedFinalAmount = project(d, s.today());
    s.event(c.family().id, d.childId, "DEPOSIT_GIFT");
    return Api.ActionResult.of(id, "COMPLETED", req.amount());
  }

  public Api.ActionResult acceptAdultPackage(Context c, UUID id) {
    var d = s.required(LongTermDeposit.class, id);
    s.junior(c, d.childId);
    if (s.today().isBefore(d.maturityDate))
      throw ApiException.conflict("NOT_MATURED", "Вклад доступен с 18 лет");
    d.adultPackageAccepted = true;
    if (d.status.equals("MATURED") && d.grantEligible && !d.grantPaid) {
      d.currentBalance = d.currentBalance.add(new BigDecimal("200.00"));
      d.grantPaid = true;
      s.event(c.family().id, d.childId, "DEPOSIT_GRANT");
    }
    return Api.ActionResult.of(id, d.status, d.currentBalance.add(d.bufferBalance));
  }

  @Transactional(readOnly = true)
  public Api.GiftInfo publicGift(String token, boolean demo) {
    var d =
        s.db
            .first(LongTermDeposit.class, "e.giftToken=?1", token)
            .orElseThrow(ApiException::missing);
    var p = s.required(ChildProfile.class, d.childId);
    return new Api.GiftInfo(
        p.firstName,
        "Подарок на будущее",
        "BYN",
        d.status.equals("ACTIVE") && s.today().isBefore(d.maturityDate),
        demo);
  }

  public void accrue(FamilyAccount family, LongTermDeposit d, LocalDate today) {
    while (!d.nextAccrualDate.isAfter(today)
        && !d.nextAccrualDate.isAfter(d.maturityDate)
        && d.status.equals("ACTIVE")) {
      BigDecimal factor = d.interestRate.divide(new BigDecimal("1200"), 16, RoundingMode.HALF_UP);
      d.currentBalance = d.currentBalance.add(money(d.currentBalance.multiply(factor)));
      d.bufferBalance = d.bufferBalance.add(money(d.bufferBalance.multiply(factor)));
      BigDecimal pay = d.monthlyAutoPayParent1.add(d.monthlyAutoPayParent2);
      if (pay.signum() > 0
          && family.parentMainBalance.subtract(family.heldBalance).compareTo(pay) >= 0) {
        s.parentPays(family, pay);
        d.bufferBalance = d.bufferBalance.add(pay);
        d.consecutiveMonths++;
        if (d.consecutiveMonths > 36) d.grantEligible = true;
      } else if (pay.signum() > 0) {
        d.consecutiveMonths = 0;
        s.event(family.id, d.childId, "AUTO_INVEST_SKIPPED");
      }
      if (!d.nextAccrualDate.isBefore(d.nextRolloverDate)) {
        d.currentBalance = d.currentBalance.add(d.bufferBalance);
        d.bufferBalance = ZERO;
        d.nextRolloverDate = d.nextRolloverDate.plusMonths(37);
      }
      d.nextAccrualDate = d.nextAccrualDate.plusMonths(1);
      s.event(family.id, d.childId, "DEPOSIT_ACCRUED");
    }
    if (!today.isBefore(d.maturityDate) && d.status.equals("ACTIVE")) {
      d.currentBalance = d.currentBalance.add(d.bufferBalance);
      d.bufferBalance = ZERO;
      d.status = "MATURED";
      if (d.grantEligible && d.adultPackageAccepted && !d.grantPaid) {
        d.currentBalance = d.currentBalance.add(new BigDecimal("200.00"));
        d.grantPaid = true;
      }
      s.event(family.id, d.childId, "DEPOSIT_MATURED");
    }
    d.projectedFinalAmount = project(d, today);
  }
}
