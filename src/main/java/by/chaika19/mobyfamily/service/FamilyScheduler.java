package by.chaika19.mobyfamily.service;

import by.chaika19.mobyfamily.domain.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.scheduling.enabled", havingValue = "true", matchIfMissing = true)
public class FamilyScheduler {
  private static final Logger log = LoggerFactory.getLogger(FamilyScheduler.class);
  private final Store db;
  private final ScheduledOperations operations;

  public FamilyScheduler(Store db, ScheduledOperations operations) {
    this.db = db;
    this.operations = operations;
  }

  @Scheduled(fixedDelayString = "${app.scheduling.delay:60000}", initialDelay = 10000)
  public void run() {
    for (var f : db.all(FamilyAccount.class)) {
      try {
        operations.processFamily(f.id);
      } catch (RuntimeException e) {
        log.error("Scheduled family processing failed for {}", f.id, e);
      }
    }
  }
}
