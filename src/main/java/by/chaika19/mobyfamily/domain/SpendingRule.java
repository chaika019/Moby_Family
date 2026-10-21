package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "spending_rule")
public class SpendingRule extends BaseEntity {
  @Column(name = "child_id", nullable = false)
  public UUID childId;

  @Column(name = "category_code", nullable = false)
  public String categoryCode;

  @Column(name = "blocked", nullable = false)
  public boolean blocked;
}
