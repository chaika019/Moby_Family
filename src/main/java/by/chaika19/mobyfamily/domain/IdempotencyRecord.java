package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "idempotency_record")
public class IdempotencyRecord extends BaseEntity {
  @Column(name = "user_id", nullable = false)
  public UUID userId;

  @Column(name = "request_key", nullable = false)
  public String requestKey;

  @Column(name = "fingerprint", nullable = false)
  public String fingerprint;

  @Column(name = "response_json", nullable = false, columnDefinition = "text")
  public String responseJson;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt;
}
