package by.chaika19.mobyfamily.service;

import static by.chaika19.mobyfamily.service.CommandBus.Context;
import static by.chaika19.mobyfamily.service.DomainSupport.*;

import by.chaika19.mobyfamily.api.*;
import by.chaika19.mobyfamily.domain.*;
import java.math.*;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class PaymentService {
  private final DomainSupport s;
  private final ObjectMapper json;

  public PaymentService(DomainSupport s, ObjectMapper json) {
    this.s = s;
    this.json = json;
  }

  public Api.ActionResult scan(Context c, Api.QrPayment req) {
    var child = s.junior(c, req.childId());
    s.activeChild(child);
    if (!req.receiptItems().isEmpty()) {
      BigDecimal total =
          req.receiptItems().stream()
              .map(i -> i.unitPrice().multiply(BigDecimal.valueOf(i.quantity())))
              .reduce(ZERO, BigDecimal::add);
      if (total.compareTo(req.amount()) != 0)
        throw ApiException.bad(
            "RECEIPT_TOTAL_MISMATCH", "Сумма позиций не совпадает с суммой чека");
    }
    var t =
        s.transaction(child, req.merchantName(), req.mccCategory(), req.amount(), "QR_CODE", "NEW");
    t.secretGiftMode = Boolean.TRUE.equals(req.secretGiftMode());
    t.receiptItemsJson = json.writeValueAsString(req.receiptItems());
    String country = req.countryCode() == null ? "BY" : req.countryCode();
    String declined =
        restriction(child, t.amount, t.mccCategory, country, Boolean.TRUE.equals(req.online()));
    if (declined != null) {
      t.status = declined;
      s.event(c.family().id, child.id, declined);
      return Api.ActionResult.of(t.id, declined, t.amount);
    }
    if (child.cardBalance.compareTo(t.amount) >= 0) {
      complete(c.family(), child, t);
      return Api.ActionResult.of(t.id, t.status, t.amount);
    }
    var sos = new SosCheckoutRequest();
    sos.childId = child.id;
    sos.transactionId = t.id;
    sos.missingAmount = t.amount.subtract(child.cardBalance);
    sos.status = "PENDING";
    sos.createdAt = s.clock.instant();
    sos.expiresAt = sos.createdAt.plus(Duration.ofMinutes(10));
    sos.countryCode = country;
    sos.online = Boolean.TRUE.equals(req.online());
    s.db.save(sos);
    t.status = "PENDING_SOS";
    s.event(c.family().id, child.id, "SOS_REQUESTED");
    return new Api.ActionResult(
        sos.id,
        "NEED_SOS_TOPUP",
        t.amount,
        sos.missingAmount,
        null,
        "Ожидается подтверждение родителя");
  }

  public Api.ActionResult approveSos(Context c, UUID id) {
    c.actor().parent();
    var sos = s.required(SosCheckoutRequest.class, id);
    var child = s.parentChild(c, sos.childId);
    var t = s.required(TransactionRecord.class, sos.transactionId);
    if (sos.status.equals("APPROVED")) return Api.ActionResult.of(sos.id, "APPROVED", t.amount);
    if (!sos.status.equals("PENDING"))
      throw ApiException.conflict("SOS_CLOSED", "Запрос уже закрыт");
    if (!sos.expiresAt.isAfter(s.clock.instant())) {
      sos.status = "EXPIRED";
      t.status = "EXPIRED";
      return Api.ActionResult.of(sos.id, "EXPIRED", t.amount);
    }
    s.activeChild(child);
    String declined = restriction(child, t.amount, t.mccCategory, sos.countryCode, sos.online);
    if (declined != null)
      throw ApiException.conflict(declined, "Оплата больше не разрешена настройками карты");
    // Another transfer/payment may have changed the missing amount since scanning.
    BigDecimal missing = t.amount.subtract(child.cardBalance).max(ZERO);
    s.parentPays(c.family(), missing);
    child.cardBalance = child.cardBalance.add(missing);
    if (missing.signum() > 0)
      s.transaction(child, "SOS от родителя", "TRANSFER", missing, "SOS_TOPUP", "COMPLETED");
    complete(c.family(), child, t);
    sos.missingAmount = missing;
    sos.status = "APPROVED";
    s.event(c.family().id, child.id, "SOS_APPROVED");
    return Api.ActionResult.of(sos.id, "APPROVED", t.amount);
  }

  public Api.ActionResult rejectSos(Context c, UUID id) {
    c.actor().parent();
    var sos = s.required(SosCheckoutRequest.class, id);
    s.parentChild(c, sos.childId);
    if (sos.status.equals("APPROVED"))
      throw ApiException.conflict("SOS_CLOSED", "Оплата уже проведена");
    if (sos.status.equals("PENDING")) {
      sos.status = "REJECTED";
      s.required(TransactionRecord.class, sos.transactionId).status = "REJECTED";
      s.event(c.family().id, sos.childId, "SOS_REJECTED");
    }
    return Api.ActionResult.of(sos.id, sos.status, null);
  }

  private String restriction(
      ChildProfile p, BigDecimal amount, String mcc, String country, boolean online) {
    s.resetSpending(p);
    if (p.cardFrozen) return "DECLINED_FROZEN";
    if (online && !p.onlinePaymentsAllowed) return "DECLINED_ONLINE";
    if (p.belarusOnly && !country.equals("BY")) return "DECLINED_COUNTRY";
    var blocked = s.db.find(SpendingRule.class, "e.childId=?1 and e.blocked=true", p.id);
    int hour = s.clock.instant().atZone(s.zone).getHour();
    for (var rule : blocked) {
      boolean match =
          switch (rule.categoryCode) {
            case "GAMING_7994" -> Set.of("7994", "5816").contains(mcc);
            case "FASTFOOD_5814" -> mcc.equals("5814");
            case "SCHOOL_5812" -> mcc.equals("5812");
            case "BOOKS_5942" -> Set.of("5942", "5943").contains(mcc);
            case "TRANSPORT_4111" -> Set.of("4111", "4131", "4121").contains(mcc);
            case "SPORT_5941" -> Set.of("5941", "7997").contains(mcc);
            case "CASH_6011" -> Set.of("6010", "6011").contains(mcc);
            case "ADULT_18_PLUS" -> Set.of("7995", "5921", "5993", "7273").contains(mcc);
            case "NIGHT_SPEND" -> hour >= 22 || hour < 7;
            default -> false;
          };
      if (match) return "DECLINED_MCC";
    }
    if (p.spentToday.add(amount).compareTo(p.dailyLimit) > 0
        || p.spentMonth.add(amount).compareTo(p.monthlyLimit) > 0) return "DECLINED_LIMIT";
    return null;
  }

  private void complete(FamilyAccount family, ChildProfile p, TransactionRecord t) {
    s.childPays(p, t.amount);
    s.spent(p, t.amount);
    t.status = "COMPLETED";
    t.cashbackEarned =
        family.subscriptionActive ? money(t.amount.multiply(new BigDecimal("0.05"))) : ZERO;
    family.cashbackAccumulated = family.cashbackAccumulated.add(t.cashbackEarned);
    s.event(family.id, p.id, "PAYMENT_COMPLETED");
  }

  public Api.ActionResult topUp(Context c, Api.Transfer req) {
    var child = s.parentChild(c, req.childId());
    s.parentPays(c.family(), req.amount());
    child.cardBalance = child.cardBalance.add(req.amount());
    var t =
        s.transaction(
            child, "Пополнение родителем", "TRANSFER", req.amount(), "PARENT_TOPUP", "COMPLETED");
    s.event(c.family().id, child.id, "BALANCE_CHANGED");
    return Api.ActionResult.of(t.id, "COMPLETED", req.amount());
  }

  public Api.ActionResult panic(Context c, Api.ChildId req) {
    var child = s.junior(c, req.childId());
    s.activeChild(child);
    var fare = new BigDecimal("12.00");
    s.parentPays(c.family(), fare);
    var t =
        s.transaction(
            child, "Panic Ride: такси домой", "4121", fare, "PARENT_PANIC_RIDE", "COMPLETED");
    s.event(c.family().id, child.id, "PANIC_RIDE_REQUESTED");
    return new Api.ActionResult(
        t.id,
        "DEMO_RIDE_REQUESTED",
        fare,
        null,
        null,
        "Демонстрационный вызов: внешняя служба такси не подключена");
  }
}
