package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "piggy_bank")
public class PiggyBank extends BaseEntity {
  @Column(name = "child_id", nullable = false)
  public UUID childId;

  @Column(name = "title", nullable = false)
  public String title;

  @Column(name = "target_amount", nullable = false, precision = 19, scale = 2)
  public BigDecimal targetAmount;

  @Column(name = "current_amount", nullable = false, precision = 19, scale = 2)
  public BigDecimal currentAmount;

  @Column(name = "parent_match_percent", nullable = false)
  public int parentMatchPercent;

  @Column(name = "battle", nullable = false)
  public boolean battle;

  @Column(name = "opponent_name", nullable = true)
  public String opponentName;

  @Column(name = "opponent_progress", nullable = false, precision = 19, scale = 2)
  public BigDecimal opponentProgress;
}
