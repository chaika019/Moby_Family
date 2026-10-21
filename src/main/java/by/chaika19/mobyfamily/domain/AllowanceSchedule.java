package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "allowance_schedule")
public class AllowanceSchedule extends BaseEntity {
  @Column(name = "child_id", nullable = false)
  public UUID childId;

  @Column(name = "amount", nullable = false, precision = 19, scale = 2)
  public BigDecimal amount;

  @Column(name = "day_of_month", nullable = false)
  public int dayOfMonth;

  @Column(name = "next_payment_date", nullable = false)
  public LocalDate nextPaymentDate;

  @Column(name = "active", nullable = false)
  public boolean active;

  @Column(name = "last_status", nullable = false)
  public String lastStatus;
}
