package by.chaika19.mobyfamily.api;

import by.chaika19.mobyfamily.security.*;
import by.chaika19.mobyfamily.service.EventService;
import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/family")
public class EventsController {
  private static class Subscription {
    final Actor actor;
    final SseEmitter emitter;
    final Instant expires;
    long cursor;
    int ticks;

    Subscription(Actor a, SseEmitter e, Instant expires, long cursor) {
      this.actor = a;
      this.emitter = e;
      this.expires = expires;
      this.cursor = cursor;
    }
  }

  private final Map<UUID, Subscription> clients = new ConcurrentHashMap<>();
  private final AuthService auth;
  private final EventService events;
  private final Clock clock;

  public EventsController(AuthService auth, EventService events, Clock clock) {
    this.auth = auth;
    this.events = events;
    this.clock = clock;
  }

  @GetMapping(value = "/events", produces = "text/event-stream")
  SseEmitter subscribe(@RequestHeader(value = "Last-Event-ID", required = false) Long lastId)
      throws java.io.IOException {
    if (lastId != null && lastId < 0)
      throw ApiException.bad("INVALID_CURSOR", "Курсор должен быть неотрицательным");
    var a = auth.actor();
    var jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    var emitter = new SseEmitter(3600000L);
    var id = UUID.randomUUID();
    long latest = events.latest(a);
    if (lastId != null && lastId > latest)
      throw ApiException.bad("INVALID_CURSOR", "Курсор находится в будущем");
    var client = new Subscription(a, emitter, jwt.getExpiresAt(), lastId == null ? latest : lastId);
    emitter.onCompletion(() -> clients.remove(id));
    emitter.onTimeout(() -> clients.remove(id));
    emitter.onError(e -> clients.remove(id));
    // Do not give ready an SSE id: reconnect must replay events from the client-provided cursor.
    emitter.send(
        SseEmitter.event()
            .name("ready")
            .data(Map.of("cursor", client.cursor, "refreshState", true)));
    clients.put(id, client);
    return emitter;
  }

  @org.springframework.context.event.EventListener(
      org.springframework.context.event.ContextClosedEvent.class)
  public void closeConnections() {
    clients.values().forEach(client -> client.emitter.complete());
    clients.clear();
  }

  @Scheduled(fixedDelay = 1000)
  public void publish() {
    clients.forEach(
        (id, client) -> {
          try {
            if (!client.expires.isAfter(clock.instant())) {
              client.emitter.complete();
              clients.remove(id);
              return;
            }
            for (var event : events.after(client.actor, client.cursor)) {
              client.emitter.send(
                  SseEmitter.event()
                      .id(Long.toString(event.sequence()))
                      .name("family-update")
                      .data(event));
              client.cursor = event.sequence();
            }
            if (++client.ticks % 15 == 0)
              client.emitter.send(SseEmitter.event().comment("heartbeat"));
          } catch (Exception e) {
            clients.remove(id);
            client.emitter.completeWithError(e);
          }
        });
  }
}
