package by.chaika19.mobyfamily.service;

import static by.chaika19.mobyfamily.service.CommandBus.Context;

import by.chaika19.mobyfamily.api.*;
import by.chaika19.mobyfamily.domain.*;
import java.math.*;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DomainSupport {
  public static final BigDecimal ZERO = new BigDecimal("0.00");
  public final Store db;
  public final Clock clock;
  public final ZoneId zone;

  public DomainSupport(Store db, Clock clock, @Value("${app.zone}") String zone) {
    this.db = db;
    this.clock = clock;
    this.zone = ZoneId.of(zone);
  }

  public LocalDate today() {
    return LocalDate.now(clock.withZone(zone));
  }

  public int age(ChildProfile child) {
    return Period.between(child.birthDate, today()).getYears();
  }

  public ChildProfile child(Context c, UUID id) {
    var p = db.get(ChildProfile.class, id);
    if (p == null || !p.familyId.equals(c.family().id)) throw ApiException.missing();
    c.actor().sees(id);
    resetSpending(p);
    return p;
  }

  public ChildProfile parentChild(Context c, UUID id) {
    c.actor().parent();
    return child(c, id);
  }

  public ChildProfile junior(Context c, UUID id) {
    c.actor().child(id);
    return child(c, id);
  }

  public void resetSpending(ChildProfile p) {
    LocalDate day = today(), month = day.withDayOfMonth(1);
    if (!day.equals(p.spendingDate)) {
      p.spentToday = ZERO;
      p.spendingDate = day;
    }
    if (!month.equals(p.spendingMonth)) {
      p.spentMonth = ZERO;
      p.spendingMonth = month;
    }
  }

  public void parentPays(FamilyAccount f, BigDecimal amount) {
    if (amount.signum() < 0 || f.parentMainBalance.subtract(f.heldBalance).compareTo(amount) < 0)
      throw ApiException.conflict(
          "INSUFFICIENT_PARENT_FUNDS", "Недостаточно доступных средств родителя");
    f.parentMainBalance = f.parentMainBalance.subtract(amount);
  }

  public void childPays(ChildProfile p, BigDecimal amount) {
    if (amount.signum() <= 0 || p.cardBalance.compareTo(amount) < 0)
      throw ApiException.conflict("INSUFFICIENT_CHILD_FUNDS", "Недостаточно средств ребёнка");
    p.cardBalance = p.cardBalance.subtract(amount);
  }

  public void activeChild(ChildProfile p) {
    if (age(p) < 7 || age(p) > 17)
      throw ApiException.conflict("AGE_OUT_OF_RANGE", "Детский продукт доступен с 7 до 17 лет");
  }

  public void transferable(ChildProfile p, BigDecimal amount) {
    activeChild(p);
    resetSpending(p);
    if (p.cardFrozen) throw ApiException.conflict("CARD_FROZEN", "Карта заморожена");
    if (!p.transfersAllowed)
      throw ApiException.conflict("TRANSFERS_BLOCKED", "Переводы запрещены родителем");
    if (p.spentToday.add(amount).compareTo(p.dailyLimit) > 0
        || p.spentMonth.add(amount).compareTo(p.monthlyLimit) > 0)
      throw ApiException.conflict("DECLINED_LIMIT", "Превышен лимит трат");
  }

  public void spent(ChildProfile p, BigDecimal amount) {
    p.spentToday = p.spentToday.add(amount);
    p.spentMonth = p.spentMonth.add(amount);
  }

  public TransactionRecord transaction(
      ChildProfile child,
      String merchant,
      String mcc,
      BigDecimal amount,
      String method,
      String status) {
    var t = new TransactionRecord();
    t.childId = child.id;
    t.merchantName = merchant;
    t.mccCategory = mcc;
    t.amount = amount;
    t.cashbackEarned = ZERO;
    t.paymentMethod = method;
    t.status = status;
    t.receiptItemsJson = "[]";
    t.createdAt = clock.instant();
    db.save(t);
    return t;
  }

  public void event(UUID familyId, UUID childId, String type) {
    var family = required(FamilyAccount.class, familyId);
    var e = new FamilyEvent();
    e.eventSequence = ++family.eventSequence;
    e.familyId = familyId;
    e.childId = childId;
    e.eventType = type;
    e.createdAt = clock.instant();
    db.save(e);
  }

  public <T> T required(Class<T> type, UUID id) {
    T entity = db.get(type, id);
    if (entity == null) throw ApiException.missing();
    return entity;
  }

  public static BigDecimal money(BigDecimal amount) {
    return amount.setScale(2, RoundingMode.HALF_UP);
  }
}
