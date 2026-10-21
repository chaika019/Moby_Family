package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "child_profile")
public class ChildProfile extends BaseEntity {
  @Column(name = "family_id", nullable = false)
  public UUID familyId;

  @Column(name = "first_name", nullable = false)
  public String firstName;

  @Column(name = "birth_date", nullable = false)
  public LocalDate birthDate;

  @Column(name = "card_balance", nullable = false, precision = 19, scale = 2)
  public BigDecimal cardBalance;

  @Column(name = "moby_coins", nullable = false)
  public int mobyCoins;

  @Column(name = "card_frozen", nullable = false)
  public boolean cardFrozen;

  @Column(name = "privacy_mode", nullable = false)
  public boolean privacyMode;

  @Column(name = "active_mascot_skin", nullable = false)
  public String activeMascotSkin;

  @Column(name = "active_pay_sound", nullable = false)
  public String activePaySound;

  @Column(name = "active_card_skin", nullable = false)
  public String activeCardSkin;

  @Column(name = "daily_limit", nullable = false, precision = 19, scale = 2)
  public BigDecimal dailyLimit;

  @Column(name = "monthly_limit", nullable = false, precision = 19, scale = 2)
  public BigDecimal monthlyLimit;

  @Column(name = "spent_today", nullable = false, precision = 19, scale = 2)
  public BigDecimal spentToday;

  @Column(name = "spent_month", nullable = false, precision = 19, scale = 2)
  public BigDecimal spentMonth;

  @Column(name = "spending_date", nullable = false)
  public LocalDate spendingDate;

  @Column(name = "spending_month", nullable = false)
  public LocalDate spendingMonth;

  @Column(name = "online_payments_allowed", nullable = false)
  public boolean onlinePaymentsAllowed;

  @Column(name = "belarus_only", nullable = false)
  public boolean belarusOnly;

  @Column(name = "transfers_allowed", nullable = false)
  public boolean transfersAllowed;

  @Column(name = "notifications_enabled", nullable = false)
  public boolean notificationsEnabled;

  @Column(name = "card_type", nullable = false)
  public String cardType;

  @Column(name = "card_last_four", nullable = false)
  public String cardLastFour;
}
