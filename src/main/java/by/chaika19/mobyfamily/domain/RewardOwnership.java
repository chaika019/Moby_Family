package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "reward_ownership")
public class RewardOwnership extends BaseEntity {
  @Column(name = "child_id", nullable = false)
  public UUID childId;

  @Column(name = "item_id", nullable = false)
  public UUID itemId;

  @Column(name = "purchased_at", nullable = false)
  public Instant purchasedAt;
}
