package by.chaika19.mobyfamily.security;

import by.chaika19.mobyfamily.api.ApiException;
import java.util.UUID;

public record Actor(UUID userId, UUID familyId, UUID childId, String role) {
  public boolean isParent() {
    return "PARENT".equals(role);
  }

  public void parent() {
    if (!isParent()) throw ApiException.forbidden();
  }

  public void child(UUID id) {
    if (isParent() || !id.equals(childId)) throw ApiException.forbidden();
  }

  public void sees(UUID id) {
    if (!isParent() && !id.equals(childId)) throw ApiException.forbidden();
  }
}
