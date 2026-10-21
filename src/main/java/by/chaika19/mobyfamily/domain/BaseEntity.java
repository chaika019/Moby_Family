package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.util.UUID;

@MappedSuperclass
public abstract class BaseEntity {
  @Id public UUID id = UUID.randomUUID();
  @Version public long version;
}
