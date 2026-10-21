package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "app_user")
public class AppUser extends BaseEntity {
  @Column(name = "family_id", nullable = false)
  public UUID familyId;

  @Column(name = "child_id", nullable = true)
  public UUID childId;

  @Column(name = "email", nullable = true)
  public String email;

  @Column(name = "password_hash", nullable = true)
  public String passwordHash;

  @Column(name = "role", nullable = false)
  public String role;
}
