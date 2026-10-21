package by.chaika19.mobyfamily.service;

import by.chaika19.mobyfamily.domain.*;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScheduledOperations {
  private final DomainSupport s;
  private final DepositService deposits;

  public ScheduledOperations(DomainSupport s, DepositService deposits) {
    this.s = s;
    this.deposits = deposits;
  }

  @Transactional
  public void processFamily(UUID id) {
    var f = s.db.lock(FamilyAccount.class, id);
    if (f == null) return;
    LocalDate today = s.today();
    while (f.subscriptionActive && !f.nextSubscriptionDate.isAfter(today)) {
      if (f.parentMainBalance.subtract(f.heldBalance).compareTo(f.subscriptionFee) >= 0) {
        s.parentPays(f, f.subscriptionFee);
        f.nextSubscriptionDate = f.nextSubscriptionDate.plusMonths(1);
      } else {
        f.subscriptionActive = false;
        f.insuranceActive = false;
        s.event(f.id, null, "SUBSCRIPTION_PAYMENT_FAILED");
      }
    }
    for (var p : s.db.find(ChildProfile.class, "e.familyId=?1", id)) {
      s.resetSpending(p);
      for (var a : s.db.find(AllowanceSchedule.class, "e.childId=?1 and e.active=true", p.id)) {
        if (s.age(p) > 17) {
          a.active = false;
          a.lastStatus = "AGE_OUT_OF_RANGE";
          continue;
        }
        while (!a.nextPaymentDate.isAfter(today)) {
          if (f.parentMainBalance.subtract(f.heldBalance).compareTo(a.amount) >= 0) {
            s.parentPays(f, a.amount);
            p.cardBalance = p.cardBalance.add(a.amount);
            a.lastStatus = "COMPLETED";
            s.transaction(
                p,
                "Карманные деньги по расписанию",
                "TRANSFER",
                a.amount,
                "ALLOWANCE",
                "COMPLETED");
            s.event(f.id, p.id, "ALLOWANCE_PAID");
          } else {
            a.lastStatus = "INSUFFICIENT_PARENT_FUNDS";
            s.event(f.id, p.id, "ALLOWANCE_SKIPPED");
          }
          a.nextPaymentDate = a.nextPaymentDate.plusMonths(1);
        }
      }
      for (var d : s.db.find(LongTermDeposit.class, "e.childId=?1", p.id))
        deposits.accrue(f, d, today);
      for (var sos :
          s.db.find(SosCheckoutRequest.class, "e.childId=?1 and e.status='PENDING'", p.id)) {
        if (!sos.expiresAt.isAfter(s.clock.instant())) {
          sos.status = "EXPIRED";
          s.required(TransactionRecord.class, sos.transactionId).status = "EXPIRED";
          s.event(f.id, p.id, "SOS_EXPIRED");
        }
      }
    }
  }
}
