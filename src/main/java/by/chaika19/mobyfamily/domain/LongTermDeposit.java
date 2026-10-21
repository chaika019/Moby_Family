package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "long_term_deposit")
public class LongTermDeposit extends BaseEntity {
  @Column(name = "child_id", nullable = false)
  public UUID childId;

  @Column(name = "plan_type", nullable = false)
  public String planType;

  @Column(name = "initial_deposit", nullable = false, precision = 19, scale = 2)
  public BigDecimal initialDeposit;

  @Column(name = "current_balance", nullable = false, precision = 19, scale = 2)
  public BigDecimal currentBalance;

  @Column(name = "buffer_balance", nullable = false, precision = 19, scale = 2)
  public BigDecimal bufferBalance;

  @Column(name = "monthly_auto_pay_parent1", nullable = false, precision = 19, scale = 2)
  public BigDecimal monthlyAutoPayParent1;

  @Column(name = "monthly_auto_pay_parent2", nullable = false, precision = 19, scale = 2)
  public BigDecimal monthlyAutoPayParent2;

  @Column(name = "interest_rate", nullable = false, precision = 19, scale = 2)
  public BigDecimal interestRate;

  @Column(name = "opened_on", nullable = false)
  public LocalDate openedOn;

  @Column(name = "next_accrual_date", nullable = false)
  public LocalDate nextAccrualDate;

  @Column(name = "next_rollover_date", nullable = false)
  public LocalDate nextRolloverDate;

  @Column(name = "maturity_date", nullable = false)
  public LocalDate maturityDate;

  @Column(name = "projected_final_amount", nullable = false, precision = 19, scale = 2)
  public BigDecimal projectedFinalAmount;

  @Column(name = "consecutive_months", nullable = false)
  public int consecutiveMonths;

  @Column(name = "grant_eligible", nullable = false)
  public boolean grantEligible;

  @Column(name = "grant_paid", nullable = false)
  public boolean grantPaid;

  @Column(name = "adult_package_accepted", nullable = false)
  public boolean adultPackageAccepted;

  @Column(name = "status", nullable = false)
  public String status;

  @Column(name = "gift_token", nullable = false)
  public String giftToken;
}
