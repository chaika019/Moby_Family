package by.chaika19.mobyfamily.service;

import static by.chaika19.mobyfamily.service.CommandBus.Context;
import static by.chaika19.mobyfamily.service.DomainSupport.*;

import by.chaika19.mobyfamily.api.*;
import by.chaika19.mobyfamily.domain.*;
import by.chaika19.mobyfamily.security.*;
import java.math.*;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FamilyService {
  private final DomainSupport s;
  private final AuthService auth;
  private final boolean virtualFunding;

  public FamilyService(
      DomainSupport s,
      AuthService auth,
      @org.springframework.beans.factory.annotation.Value(
              "${app.wallet.virtual-funding-enabled:false}")
          boolean virtualFunding) {
    this.s = s;
    this.auth = auth;
    this.virtualFunding = virtualFunding;
  }

  public Api.ActionResult fundVirtualWallet(Context c, Api.Money req) {
    c.actor().parent();
    if (!virtualFunding) throw ApiException.forbidden();
    c.family().parentMainBalance = c.family().parentMainBalance.add(req.amount());
    s.event(c.family().id, null, "VIRTUAL_FUNDS_ADDED");
    return new Api.ActionResult(
        c.family().id,
        "VIRTUAL_FUNDS_ADDED",
        req.amount(),
        null,
        null,
        "Виртуальное пополнение; банковского перевода нет");
  }

  @Transactional
  public Api.Onboarded onboard(Api.Onboard req) {
    var actor = auth.actor();
    actor.parent();
    s.db.lock(FamilyAccount.class, actor.familyId());
    LocalDate birth = req.birthDate() == null ? s.today().minusYears(req.age()) : req.birthDate();
    if (Period.between(birth, s.today()).getYears() != req.age())
      throw ApiException.bad("AGE_MISMATCH", "Возраст не совпадает с датой рождения");
    if (req.birthCertScanBase64() != null && !req.birthCertScanBase64().isBlank()) {
      try {
        Base64.getDecoder().decode(req.birthCertScanBase64());
      } catch (IllegalArgumentException e) {
        throw ApiException.bad("INVALID_SCAN", "Скан должен быть в Base64");
      }
    }
    // Identity verification and card issuance are simulated; do not retain document scans.
    var p = createChild(actor.familyId(), req.firstName().trim(), birth);
    s.event(actor.familyId(), p.id, "CHILD_CREATED");
    return auth.loginQr(p);
  }

  public ChildProfile createChild(UUID familyId, String firstName, LocalDate birth) {
    var p = new ChildProfile();
    p.familyId = familyId;
    p.firstName = firstName;
    p.birthDate = birth;
    p.cardBalance = ZERO;
    p.mobyCoins = 0;
    p.cardFrozen = false;
    p.privacyMode = Period.between(birth, s.today()).getYears() >= 14;
    p.activeMascotSkin = "CYBER_FOX_DEFAULT";
    p.activePaySound = "DEFAULT";
    p.activeCardSkin = "DEFAULT";
    p.dailyLimit = new BigDecimal("20.00");
    p.monthlyLimit = new BigDecimal("100.00");
    p.spentToday = ZERO;
    p.spentMonth = ZERO;
    p.spendingDate = s.today();
    p.spendingMonth = s.today().withDayOfMonth(1);
    p.onlinePaymentsAllowed = true;
    p.belarusOnly = true;
    p.transfersAllowed = true;
    p.notificationsEnabled = true;
    p.cardType = "VIRTUAL";
    p.cardLastFour = String.format("%04d", new java.security.SecureRandom().nextInt(10000));
    s.db.save(p);
    var user = new AppUser();
    user.familyId = familyId;
    user.childId = p.id;
    user.role = "CHILD";
    s.db.save(user);
    for (String code :
        List.of("GAMING_7994", "FASTFOOD_5814", "CASH_6011", "ADULT_18_PLUS", "NIGHT_SPEND",
            "SCHOOL_5812", "BOOKS_5942", "TRANSPORT_4111", "SPORT_5941")) {
      var rule = new SpendingRule();
      rule.childId = p.id;
      rule.categoryCode = code;
      rule.blocked = Set.of("GAMING_7994", "CASH_6011", "ADULT_18_PLUS").contains(code);
      s.db.save(rule);
    }
    return p;
  }

  @Transactional
  public Api.Onboarded qr(UUID childId) {
    var actor = auth.actor();
    actor.parent();
    var family = s.db.lock(FamilyAccount.class, actor.familyId());
    var child = s.parentChild(new Context(actor, family), childId);
    return auth.loginQr(child);
  }

  public Api.ActionResult rule(Context c, Api.Rule req) {
    var p = s.parentChild(c, req.childId());
    var rule =
        s.db
            .first(
                SpendingRule.class, "e.childId=?1 and e.categoryCode=?2", p.id, req.categoryCode())
            .orElseGet(() -> {
              var created = new SpendingRule();
              created.childId = p.id;
              created.categoryCode = req.categoryCode();
              created.blocked = false;
              s.db.save(created);
              return created;
            });
    rule.blocked = req.blocked();
    s.event(c.family().id, p.id, "RULES_CHANGED");
    return Api.ActionResult.of(rule.id, "UPDATED", null);
  }

  public Api.ActionResult freeze(Context c, Api.Freeze req) {
    var p = s.parentChild(c, req.childId());
    p.cardFrozen = req.frozen();
    s.event(c.family().id, p.id, "CARD_CHANGED");
    return Api.ActionResult.of(p.id, "UPDATED", null);
  }

  public Api.ActionResult limits(Context c, Api.Limits req) {
    var p = s.parentChild(c, req.childId());
    p.dailyLimit = req.dailyLimit();
    p.monthlyLimit = req.monthlyLimit();
    s.event(c.family().id, p.id, "LIMITS_CHANGED");
    return Api.ActionResult.of(p.id, "UPDATED", null);
  }

  public Api.ActionResult safety(Context c, Api.Safety req) {
    var p = s.parentChild(c, req.childId());
    p.onlinePaymentsAllowed = req.onlinePaymentsAllowed();
    p.belarusOnly = req.belarusOnly();
    p.transfersAllowed = req.transfersAllowed();
    p.notificationsEnabled = req.notificationsEnabled();
    s.event(c.family().id, p.id, "SAFETY_CHANGED");
    return Api.ActionResult.of(p.id, "UPDATED", null);
  }

  public Api.ActionResult privacy(Context c, Api.Privacy req) {
    var p = s.junior(c, req.childId());
    if (s.age(p) < 14 && req.privacyMode())
      throw ApiException.bad("PRIVACY_AGE", "Режим приватности доступен с 14 лет");
    p.privacyMode = req.privacyMode();
    s.event(c.family().id, p.id, "PRIVACY_CHANGED");
    return Api.ActionResult.of(p.id, "UPDATED", null);
  }

  public Api.ActionResult card(Context c, Api.Card req) {
    var p = s.parentChild(c, req.childId());
    p.cardType = req.cardType();
    s.event(c.family().id, p.id, "CARD_CHANGED");
    return new Api.ActionResult(
        p.id,
        "DEMO_CARD_ISSUED",
        null,
        null,
        null,
        "Демонстрационная карта, без PAN и банковского процессинга");
  }

  private void validateRewardCoins(int coins) {
    if (coins < 0 || coins > 100)
      throw ApiException.bad("INVALID_REWARD_COINS", "Награда — от 0 до 100 Moby Coins");
  }

  public Api.ActionResult createChore(Context c, Api.Chore req) {
    validateRewardCoins(req.rewardCoins());
    var p = s.parentChild(c, req.childId());
    if (c.family().parentMainBalance.subtract(c.family().heldBalance).compareTo(req.rewardByn())
        < 0)
      throw ApiException.conflict(
          "INSUFFICIENT_PARENT_FUNDS", "Недостаточно средств для холда награды");
    c.family().heldBalance = c.family().heldBalance.add(req.rewardByn());
    var chore = new ChoreTask();
    chore.childId = p.id;
    chore.title = req.title().trim();
    chore.rewardByn = req.rewardByn();
    chore.rewardCoins = req.rewardCoins();
    chore.status = "ASSIGNED";
    s.db.save(chore);
    s.event(c.family().id, p.id, "CHORE_ASSIGNED");
    return Api.ActionResult.of(chore.id, chore.status, chore.rewardByn);
  }

  public Api.ActionResult submitChore(Context c, UUID id, Api.Proof req) {
    var chore = s.required(ChoreTask.class, id);
    s.junior(c, chore.childId);
    if (!chore.status.equals("ASSIGNED"))
      throw ApiException.conflict("INVALID_CHORE_STATE", "Задание уже отправлено или закрыто");
    chore.status = "SUBMITTED_FOR_REVIEW";
    chore.photoProofUrl = req.photoProofUrl();
    s.event(c.family().id, chore.childId, "CHORE_SUBMITTED");
    return Api.ActionResult.of(chore.id, chore.status, null);
  }

  public Api.ActionResult approveChore(Context c, UUID id) {
    c.actor().parent();
    var chore = s.required(ChoreTask.class, id);
    var p = s.parentChild(c, chore.childId);
    if (chore.status.equals("COMPLETED"))
      return Api.ActionResult.of(id, "COMPLETED", chore.rewardByn);
    if (!chore.status.equals("SUBMITTED_FOR_REVIEW"))
      throw ApiException.conflict(
          "INVALID_CHORE_STATE", "Сначала ребёнок должен отправить задание");
    validateRewardCoins(chore.rewardCoins);
    c.family().heldBalance = c.family().heldBalance.subtract(chore.rewardByn);
    s.parentPays(c.family(), chore.rewardByn);
    p.cardBalance = p.cardBalance.add(chore.rewardByn);
    p.mobyCoins = Math.addExact(p.mobyCoins, chore.rewardCoins);
    chore.status = "COMPLETED";
    s.transaction(
        p, "Задание: " + chore.title, "REWARD", chore.rewardByn, "CHORE_REWARD", "COMPLETED");
    s.event(c.family().id, p.id, "CHORE_COMPLETED");
    return Api.ActionResult.of(id, "COMPLETED", chore.rewardByn);
  }

  public Api.ActionResult cancelChore(Context c, UUID id) {
    c.actor().parent();
    var chore = s.required(ChoreTask.class, id);
    s.parentChild(c, chore.childId);
    if (chore.status.equals("COMPLETED"))
      throw ApiException.conflict("INVALID_CHORE_STATE", "Задание уже оплачено");
    if (!chore.status.equals("CANCELLED")) {
      c.family().heldBalance = c.family().heldBalance.subtract(chore.rewardByn);
      chore.status = "CANCELLED";
      s.event(c.family().id, chore.childId, "CHORE_CANCELLED");
    }
    return Api.ActionResult.of(id, chore.status, null);
  }

  public Api.ActionResult createPiggy(Context c, Api.Piggy req) {
    var p = s.parentChild(c, req.childId());
    var piggy = new PiggyBank();
    piggy.childId = p.id;
    piggy.title = req.title().trim();
    piggy.targetAmount = req.targetAmount();
    piggy.currentAmount = ZERO;
    piggy.parentMatchPercent = req.parentMatchPercent();
    piggy.battle = req.opponentName() != null;
    piggy.opponentName = req.opponentName();
    piggy.opponentProgress = ZERO;
    s.db.save(piggy);
    s.event(c.family().id, p.id, "PIGGY_CREATED");
    return Api.ActionResult.of(piggy.id, "CREATED", null);
  }

  public Api.ActionResult piggyDeposit(Context c, UUID id, Api.Money req) {
    var piggy = s.required(PiggyBank.class, id);
    var p = s.junior(c, piggy.childId);
    s.activeChild(p);
    if (p.cardFrozen) throw ApiException.conflict("CARD_FROZEN", "Карта заморожена");
    BigDecimal match =
        money(
            req.amount()
                .multiply(BigDecimal.valueOf(piggy.parentMatchPercent))
                .divide(new BigDecimal("100")));
    s.parentPays(c.family(), match);
    s.childPays(p, req.amount());
    piggy.currentAmount = piggy.currentAmount.add(req.amount()).add(match);
    s.transaction(
        p, "Копилка: " + piggy.title, "SAVINGS", req.amount(), "PIGGY_DEPOSIT", "COMPLETED");
    s.event(c.family().id, p.id, "PIGGY_CHANGED");
    return new Api.ActionResult(
        id,
        "COMPLETED",
        req.amount().add(match),
        null,
        null,
        "Включая родительский матчинг " + match);
  }

  public Api.ActionResult split(Context c, Api.Split req) {
    var p = s.junior(c, req.childId());
    s.activeChild(p);
    if (!p.transfersAllowed || p.cardFrozen)
      throw ApiException.conflict("TRANSFERS_BLOCKED", "Запросы переводов недоступны");
    if (req.payerChildId() != null) {
      var payer = s.required(ChildProfile.class, req.payerChildId());
      if (!payer.familyId.equals(p.familyId) || payer.id.equals(p.id))
        throw ApiException.bad("INVALID_PAYER", "Для демо выберите другого ребёнка этой семьи");
    }
    var bill = new SplitBill();
    bill.childId = p.id;
    bill.payerChildId = req.payerChildId();
    bill.friendName = req.friendName();
    bill.itemTitle = req.itemTitle();
    bill.shareAmount = req.shareAmount();
    bill.paid = false;
    bill.debtorMemeBadge = "Должник недели";
    s.db.save(bill);
    s.event(c.family().id, p.id, "SPLIT_REQUESTED");
    return Api.ActionResult.of(bill.id, "PENDING", bill.shareAmount);
  }

  public Api.ActionResult closeSplitNote(Context c, UUID id) {
    var bill=s.required(SplitBill.class,id);
    s.junior(c,bill.childId);
    if(bill.payerChildId!=null)throw ApiException.conflict("PAYMENT_REQUIRED","Этот запрос должен оплатить указанный участник");
    if(!bill.paid){bill.paid=true;bill.debtorMemeBadge="";s.event(c.family().id,bill.childId,"SPLIT_CLOSED");}
    return Api.ActionResult.of(id,"CLOSED",null);
  }

  public Api.ActionResult paySplit(Context c, UUID id) {
    var bill = s.required(SplitBill.class, id);
    var recipient = s.required(ChildProfile.class, bill.childId);
    if (!recipient.familyId.equals(c.family().id) || bill.payerChildId == null)
      throw ApiException.missing();
    var payer = s.junior(c, bill.payerChildId);
    if (bill.paid) return Api.ActionResult.of(bill.id, "COMPLETED", bill.shareAmount);
    s.transferable(payer, bill.shareAmount);
    s.childPays(payer, bill.shareAmount);
    s.spent(payer, bill.shareAmount);
    recipient.cardBalance = recipient.cardBalance.add(bill.shareAmount);
    bill.paid = true;
    bill.debtorMemeBadge = "";
    s.transaction(
        payer,
        "Круговой буфет: " + bill.itemTitle,
        "TRANSFER",
        bill.shareAmount,
        "P2P_SPLIT",
        "COMPLETED");
    s.transaction(
        recipient,
        "Возврат доли: " + bill.itemTitle,
        "TRANSFER",
        bill.shareAmount,
        "P2P_SPLIT_IN",
        "COMPLETED");
    s.event(c.family().id, payer.id, "SPLIT_PAID");
    s.event(c.family().id, recipient.id, "SPLIT_PAID");
    return Api.ActionResult.of(id, "COMPLETED", bill.shareAmount);
  }

  public Api.ActionResult allowance(Context c, Api.Allowance req) {
    var p = s.parentChild(c, req.childId());
    var existing=s.db.find(AllowanceSchedule.class,"e.childId=?1 and e.active=true",p.id);
    var a=existing.isEmpty()?new AllowanceSchedule():existing.getFirst();
    // Editing the schedule updates its existing payment instruction.
    existing.stream().skip(1).forEach(old->old.active=false);
    a.childId = p.id;
    a.amount = req.amount();
    a.dayOfMonth = req.dayOfMonth();
    a.nextPaymentDate = s.today().withDayOfMonth(req.dayOfMonth());
    if (a.nextPaymentDate.isBefore(s.today())) a.nextPaymentDate = a.nextPaymentDate.plusMonths(1);
    a.active = req.active();
    a.lastStatus = "SCHEDULED";
    if(existing.isEmpty())s.db.save(a);
    s.event(c.family().id, p.id, "ALLOWANCE_CHANGED");
    return Api.ActionResult.of(a.id, "CREATED", a.amount);
  }

  public Api.ActionResult stopAllowance(Context c, UUID id) {
    c.actor().parent();
    var a = s.required(AllowanceSchedule.class, id);
    s.parentChild(c, a.childId);
    a.active = false;
    s.event(c.family().id, a.childId, "ALLOWANCE_CHANGED");
    return Api.ActionResult.of(id, "STOPPED", null);
  }

  public Api.ActionResult subscription(Context c, boolean active) {
    c.actor().parent();
    var f = c.family();
    if (active && !f.subscriptionActive) {
      s.parentPays(f, f.subscriptionFee);
      f.nextSubscriptionDate = s.today().plusMonths(1);
    }
    f.subscriptionActive = active;
    f.insuranceActive = active;
    s.event(f.id, null, "SUBSCRIPTION_CHANGED");
    return Api.ActionResult.of(f.id, active ? "ACTIVE" : "INACTIVE", f.subscriptionFee);
  }
}
