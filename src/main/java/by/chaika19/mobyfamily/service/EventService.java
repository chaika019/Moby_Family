package by.chaika19.mobyfamily.service;

import by.chaika19.mobyfamily.domain.*;
import by.chaika19.mobyfamily.security.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventService {
  public record Event(long sequence, UUID childId, String type, java.time.Instant createdAt) {}

  private final Store db;

  public EventService(Store db) {
    this.db = db;
  }

  @Transactional(readOnly = true)
  public long latest(Actor a) {
    return db.get(FamilyAccount.class, a.familyId()).eventSequence;
  }

  @Transactional(readOnly = true)
  public List<Event> after(Actor a, long sequence) {
    String scope = a.isParent() ? "" : " and (e.childId is null or e.childId=?3)";
    Object[] args =
        a.isParent()
            ? new Object[] {a.familyId(), sequence}
            : new Object[] {a.familyId(), sequence, a.childId()};
    return db
        .page(
            FamilyEvent.class,
            "e.familyId=?1 and e.eventSequence>?2" + scope,
            "e.eventSequence",
            0,
            100,
            args)
        .stream()
        .map(e -> new Event(e.eventSequence, e.childId, e.eventType, e.createdAt))
        .toList();
  }
}
