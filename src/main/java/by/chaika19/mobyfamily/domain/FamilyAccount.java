package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "family_account")
public class FamilyAccount extends BaseEntity {
  @Column(name = "event_sequence", nullable = false)
  public long eventSequence;

  @Column(name = "family_name", nullable = false)
  public String familyName;

  @Column(name = "parent_main_balance", nullable = false, precision = 19, scale = 2)
  public BigDecimal parentMainBalance;

  @Column(name = "held_balance", nullable = false, precision = 19, scale = 2)
  public BigDecimal heldBalance;

  @Column(name = "cashback_accumulated", nullable = false, precision = 19, scale = 2)
  public BigDecimal cashbackAccumulated;

  @Column(name = "subscription_active", nullable = false)
  public boolean subscriptionActive;

  @Column(name = "subscription_fee", nullable = false, precision = 19, scale = 2)
  public BigDecimal subscriptionFee;

  @Column(name = "insurance_active", nullable = false)
  public boolean insuranceActive;

  @Column(name = "next_subscription_date", nullable = false)
  public LocalDate nextSubscriptionDate;
}
