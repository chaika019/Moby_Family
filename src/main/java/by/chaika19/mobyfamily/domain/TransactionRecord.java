package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "transaction_record")
public class TransactionRecord extends BaseEntity {
  @Column(name = "child_id", nullable = false)
  public UUID childId;

  @Column(name = "merchant_name", nullable = false)
  public String merchantName;

  @Column(name = "mcc_category", nullable = false)
  public String mccCategory;

  @Column(name = "amount", nullable = false, precision = 19, scale = 2)
  public BigDecimal amount;

  @Column(name = "cashback_earned", nullable = false, precision = 19, scale = 2)
  public BigDecimal cashbackEarned;

  @Column(name = "payment_method", nullable = false)
  public String paymentMethod;

  @Column(name = "secret_gift_mode", nullable = false)
  public boolean secretGiftMode;

  @Column(name = "receipt_items_json", nullable = false, columnDefinition = "text")
  public String receiptItemsJson;

  @Column(name = "status", nullable = false)
  public String status;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt;
}
