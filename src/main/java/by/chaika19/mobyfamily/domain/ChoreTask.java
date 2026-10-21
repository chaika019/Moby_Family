package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "chore_task")
public class ChoreTask extends BaseEntity {
  @Column(name = "child_id", nullable = false)
  public UUID childId;

  @Column(name = "title", nullable = false)
  public String title;

  @Column(name = "reward_byn", nullable = false, precision = 19, scale = 2)
  public BigDecimal rewardByn;

  @Column(name = "reward_coins", nullable = false)
  public int rewardCoins;

  @Column(name = "status", nullable = false)
  public String status;

  @Column(name = "photo_proof_url", nullable = true)
  public String photoProofUrl;
}
