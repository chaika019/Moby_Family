package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "split_bill")
public class SplitBill extends BaseEntity {
  @Column(name = "child_id", nullable = false)
  public UUID childId;

  @Column(name = "payer_child_id", nullable = true)
  public UUID payerChildId;

  @Column(name = "friend_name", nullable = false)
  public String friendName;

  @Column(name = "item_title", nullable = false)
  public String itemTitle;

  @Column(name = "share_amount", nullable = false, precision = 19, scale = 2)
  public BigDecimal shareAmount;

  @Column(name = "paid", nullable = false)
  public boolean paid;

  @Column(name = "debtor_meme_badge", nullable = false)
  public String debtorMemeBadge;
}
