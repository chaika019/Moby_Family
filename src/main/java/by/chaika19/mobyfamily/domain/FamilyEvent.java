package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "family_event")
public class FamilyEvent extends BaseEntity {
  @Column(name = "event_sequence", nullable = false)
  public long eventSequence;

  @Column(name = "family_id", nullable = false)
  public UUID familyId;

  @Column(name = "child_id", nullable = true)
  public UUID childId;

  @Column(name = "event_type", nullable = false)
  public String eventType;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt;
}
