package by.chaika19.mobyfamily.service;

import by.chaika19.mobyfamily.api.*;
import by.chaika19.mobyfamily.domain.*;
import by.chaika19.mobyfamily.security.*;
import java.time.Clock;
import java.util.function.Function;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Service
public class CommandBus {
  public record Context(Actor actor, FamilyAccount family) {}

  private final Store db;
  private final AuthService auth;
  private final ObjectMapper json;
  private final Clock clock;

  public CommandBus(Store db, AuthService auth, ObjectMapper json, Clock clock) {
    this.db = db;
    this.auth = auth;
    this.json = json;
    this.clock = clock;
  }

  @Transactional
  public Api.ActionResult execute(
      String key, String operation, Object request, Function<Context, Api.ActionResult> command) {
    if (key == null || !key.matches("[A-Za-z0-9_-]{8,100}"))
      throw ApiException.bad(
          "INVALID_IDEMPOTENCY_KEY", "Idempotency-Key: от 8 до 100 букв, цифр, _ или -");
    Actor actor = auth.actor();
    FamilyAccount family = db.lock(FamilyAccount.class, actor.familyId());
    String fingerprint = AuthService.hash(operation + ":" + json.writeValueAsString(request));
    var previous =
        db.first(IdempotencyRecord.class, "e.userId=?1 and e.requestKey=?2", actor.userId(), key);
    if (previous.isPresent()) {
      var p = previous.get();
      if (!p.fingerprint.equals(fingerprint))
        throw ApiException.conflict(
            "IDEMPOTENCY_CONFLICT", "Этот ключ уже использован для другого запроса");
      return json.readValue(p.responseJson, Api.ActionResult.class);
    }
    Api.ActionResult result = command.apply(new Context(actor, family));
    var record = new IdempotencyRecord();
    record.userId = actor.userId();
    record.requestKey = key;
    record.fingerprint = fingerprint;
    record.responseJson = json.writeValueAsString(result);
    record.createdAt = clock.instant();
    db.save(record);
    return result;
  }
}
