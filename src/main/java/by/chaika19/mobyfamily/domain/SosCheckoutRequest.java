package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "sos_checkout_request")
public class SosCheckoutRequest extends BaseEntity {
  @Column(name = "child_id", nullable = false)
  public UUID childId;

  @Column(name = "transaction_id", nullable = false)
  public UUID transactionId;

  @Column(name = "missing_amount", nullable = false, precision = 19, scale = 2)
  public BigDecimal missingAmount;

  @Column(name = "status", nullable = false)
  public String status;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt;

  @Column(name = "expires_at", nullable = false)
  public Instant expiresAt;

  @Column(name = "country_code", nullable = false)
  public String countryCode;

  @Column(name = "online", nullable = false)
  public boolean online;
}
