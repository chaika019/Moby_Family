package by.chaika19.mobyfamily;

import static org.junit.jupiter.api.Assertions.*;

import by.chaika19.mobyfamily.domain.*;
import by.chaika19.mobyfamily.service.*;
import java.math.BigDecimal;
import java.net.*;
import java.net.http.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Consumer;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.*;

@org.springframework.test.context.ActiveProfiles("demo")
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
      "app.scheduling.enabled=false",
      "spring.datasource.url=${TEST_DB_URL:jdbc:h2:mem:moby-integration;DB_CLOSE_DELAY=-1;MODE=PostgreSQL}",
      "spring.datasource.username=${TEST_DB_USER:sa}"
    })
class BackendIntegrationTests {
  @LocalServerPort int port;
  @Autowired ObjectMapper json;
  @Autowired Store db;
  @Autowired TransactionTemplate tx;
  @Autowired ScheduledOperations schedules;
  @Autowired DepositService deposits;
  @Autowired DomainSupport support;
  final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

  record Result(int status, JsonNode body) {}

  record Fixture(String parent, String child, UUID familyId, UUID childId) {}

  Result call(String method, String path, String token, Object body, String key) throws Exception {
    var b =
        HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1" + path))
            .timeout(Duration.ofSeconds(15));
    if (token != null) b.header("Authorization", "Bearer " + token);
    if (key != null) b.header("Idempotency-Key", key);
    if (body != null) b.header("Content-Type", "application/json");
    b.method(
        method,
        body == null
            ? HttpRequest.BodyPublishers.noBody()
            : HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)));
    var r = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
    return new Result(
        r.statusCode(), r.body().isBlank() ? json.nullNode() : json.readTree(r.body()));
  }

  JsonNode ok(String method, String path, String token, Object body) throws Exception {
    return ok(method, path, token, body, UUID.randomUUID().toString());
  }

  JsonNode ok(String method, String path, String token, Object body, String key) throws Exception {
    var r = call(method, path, token, body, key);
    assertEquals(200, r.status(), r.body().toString());
    return r.body();
  }

  Fixture fixture() throws Exception {
    return fixture(11);
  }

  Fixture fixture(int age) throws Exception {
    var parent =
        ok(
            "POST",
            "/auth/register",
            null,
            Map.of(
                "email",
                UUID.randomUUID() + "@test.local",
                "password",
                "test-password-2026!",
                "familyName",
                "Тестовая семья"));
    String token = parent.get("accessToken").asText();
    UUID familyId = UUID.fromString(parent.get("familyId").asText());
    tx.executeWithoutResult(
        t -> {
          var f = db.get(FamilyAccount.class, familyId);
          f.parentMainBalance = new BigDecimal("2000.00");
          f.subscriptionActive = true;
          f.insuranceActive = true;
        });
    var child = ok("POST", "/onboarding/child", token, Map.of("firstName", "Тест", "age", age));
    UUID id = UUID.fromString(child.get("childId").asText());
    var login =
        ok(
            "POST",
            "/auth/qr-login",
            null,
            Map.of("qrAuthToken", child.get("qrAuthToken").asText()));
    tx.executeWithoutResult(
        t -> {
          var p = db.get(ChildProfile.class, id);
          p.cardBalance = new BigDecimal("45.00");
          p.dailyLimit = new BigDecimal("100.00");
          p.monthlyLimit = new BigDecimal("500.00");
          p.mobyCoins = 450;
        });
    return new Fixture(token, login.get("accessToken").asText(), familyId, id);
  }

  JsonNode state(String token) throws Exception {
    return ok("GET", "/family/state", token, null);
  }

  JsonNode profile(Fixture f) throws Exception {
    return state(f.child()).get("children").get(0).get("profile");
  }

  void childUpdate(Fixture f, Consumer<ChildProfile> change) {
    tx.executeWithoutResult(t -> change.accept(db.get(ChildProfile.class, f.childId())));
  }

  void parentUpdate(Fixture f, Consumer<FamilyAccount> change) {
    tx.executeWithoutResult(t -> change.accept(db.get(FamilyAccount.class, f.familyId())));
  }

  void money(String expected, JsonNode actual) {
    assertEquals(0, new BigDecimal(expected).compareTo(actual.decimalValue()), actual.toString());
  }

  Map<String, Object> payment(Fixture f, String amount, String mcc) {
    return Map.of(
        "childId",
        f.childId(),
        "merchantName",
        "Магазин",
        "mccCategory",
        mcc,
        "amount",
        new BigDecimal(amount),
        "receiptItems",
        List.of(Map.of("title", "Покупка", "quantity", 1, "unitPrice", new BigDecimal(amount))));
  }

  @Test
  void paymentCashbackAndReplayAreAtomic() throws Exception {
    var f = fixture();
    var req = payment(f, "4.50", "5814");
    String key = UUID.randomUUID().toString();
    var first = ok("POST", "/qr-payment/scan", f.child(), req, key);
    assertEquals("COMPLETED", first.get("status").asText());
    assertEquals(first, ok("POST", "/qr-payment/scan", f.child(), req, key));
    money("40.50", profile(f).get("cardBalance"));
    money("4.50", profile(f).get("spentToday"));
    money("0.23", state(f.parent()).get("family").get("cashbackAccumulated"));
    assertEquals(
        409, call("POST", "/qr-payment/scan", f.child(), payment(f, "5.00", "5814"), key).status());
  }

  @Test
  void mccFreezeAndLimitsRejectWithoutMoneyMovement() throws Exception {
    var f = fixture();
    assertEquals(
        "DECLINED_MCC",
        ok("POST", "/qr-payment/scan", f.child(), payment(f, "15.00", "7994"))
            .get("status")
            .asText());
    ok("POST", "/parent/card-freeze", f.parent(), Map.of("childId", f.childId(), "frozen", true));
    assertEquals(
        "DECLINED_FROZEN",
        ok("POST", "/qr-payment/scan", f.child(), payment(f, "1.00", "5411"))
            .get("status")
            .asText());
    ok("POST", "/parent/card-freeze", f.parent(), Map.of("childId", f.childId(), "frozen", false));
    ok(
        "PATCH",
        "/parent/limits",
        f.parent(),
        Map.of("childId", f.childId(), "dailyLimit", 1, "monthlyLimit", 500));
    assertEquals(
        "DECLINED_LIMIT",
        ok("POST", "/qr-payment/scan", f.child(), payment(f, "2.00", "5411"))
            .get("status")
            .asText());
    money("45.00", profile(f).get("cardBalance"));
  }

  @Test
  void sosApprovesOriginalReceiptExactlyOnce() throws Exception {
    var f = fixture();
    parentUpdate(f, p -> p.parentMainBalance = new BigDecimal("1450.00"));
    var sos = ok("POST", "/qr-payment/scan", f.child(), payment(f, "52.00", "5411"));
    assertEquals("NEED_SOS_TOPUP", sos.get("status").asText());
    money("7.00", sos.get("missingAmount"));
    String path = "/sos/" + sos.get("id").asText() + "/approve";
    ok("POST", path, f.parent(), null);
    ok("POST", path, f.parent(), null);
    money("0.00", profile(f).get("cardBalance"));
    money("1443.00", state(f.parent()).get("family").get("parentMainBalance"));
    money("2.60", state(f.parent()).get("family").get("cashbackAccumulated"));
    money("2.60", state(f.child()).get("family").get("cashbackAccumulated"));
    money("0.00", state(f.parent()).get("children").get(0).get("profile").get("cardBalance"));
    money("52.00", profile(f).get("spentToday"));
    var records = state(f.parent()).get("children").get(0).get("transactions");
    assertEquals(
        1,
        java.util.stream.StreamSupport.stream(records.spliterator(), false)
            .filter(
                t ->
                    t.get("paymentMethod").asText().equals("QR_CODE")
                        && t.get("receiptItems").size() == 1)
            .count());
  }

  @Test
  void sosRechecksFreezeAndCurrentMissingAmount() throws Exception {
    var f = fixture();
    var sos = ok("POST", "/qr-payment/scan", f.child(), payment(f, "52.00", "5411"));
    String path = "/sos/" + sos.get("id").asText() + "/approve";
    childUpdate(f, p -> p.cardFrozen = true);
    assertEquals(409, call("POST", path, f.parent(), null, UUID.randomUUID().toString()).status());
    childUpdate(f, p -> p.cardFrozen = false);
    ok("POST", "/parent/top-up", f.parent(), Map.of("childId", f.childId(), "amount", 3));
    ok("POST", path, f.parent(), null);
    money("1993.00", state(f.parent()).get("family").get("parentMainBalance"));
    money("0.00", profile(f).get("cardBalance"));
  }

  @Test
  void insufficientParentFundsRollBackSos() throws Exception {
    var f = fixture();
    var sos = ok("POST", "/qr-payment/scan", f.child(), payment(f, "52.00", "5411"));
    parentUpdate(f, p -> p.parentMainBalance = new BigDecimal("1.00"));
    assertEquals(
        409,
        call(
                "POST",
                "/sos/" + sos.get("id").asText() + "/approve",
                f.parent(),
                null,
                UUID.randomUUID().toString())
            .status());
    money("45.00", profile(f).get("cardBalance"));
    assertEquals(
        "PENDING",
        state(f.parent()).get("children").get(0).get("sosRequests").get(0).get("status").asText());
  }

  @Test
  void choreCoinsAreCappedAtCreationAndPayout() throws Exception {
    var f = fixture();
    for (int coins : new int[] {-1, 101}) {
      assertEquals(400, call("POST", "/chores", f.parent(),
          Map.of("childId", f.childId(), "title", "Книга", "rewardByn", 3,
              "rewardCoins", coins), UUID.randomUUID().toString()).status());
    }
    money("0.00", state(f.parent()).get("family").get("heldBalance"));
    var chore = ok("POST", "/chores", f.parent(),
        Map.of("childId", f.childId(), "title", "Книга", "rewardByn", 3, "rewardCoins", 100));
    String id = chore.get("id").asText();
    ok("POST", "/chores/" + id + "/submit", f.child(), Map.of());
    tx.executeWithoutResult(t -> db.get(ChoreTask.class, UUID.fromString(id)).rewardCoins = 101);
    assertEquals(400, call("POST", "/chores/" + id + "/approve", f.parent(), null,
        UUID.randomUUID().toString()).status());
    money("45.00", profile(f).get("cardBalance"));
    money("3.00", state(f.parent()).get("family").get("heldBalance"));
    assertEquals(450, profile(f).get("mobyCoins").asInt());
    tx.executeWithoutResult(t -> db.get(ChoreTask.class, UUID.fromString(id)).rewardCoins = 100);
    ok("POST", "/chores/" + id + "/approve", f.parent(), null);
    ok("POST", "/chores/" + id + "/approve", f.parent(), null);
    assertEquals(550, profile(f).get("mobyCoins").asInt());
  }

  @Test
  void safeCategoriesBlockPaymentsAndCanBeEnabledAgain() throws Exception {
    var f = fixture();
    for (var entry : Map.of("SCHOOL_5812", "5812", "BOOKS_5942", "5943",
        "TRANSPORT_4111", "4111", "SPORT_5941", "5941").entrySet()) {
      ok("PATCH", "/parent/mcc-rules", f.parent(), Map.of("childId", f.childId(),
          "categoryCode", entry.getKey(), "blocked", true));
      assertEquals("DECLINED_MCC", ok("POST", "/qr-payment/scan", f.child(),
          payment(f, "1.00", entry.getValue())).get("status").asText());
      ok("PATCH", "/parent/mcc-rules", f.parent(), Map.of("childId", f.childId(),
          "categoryCode", entry.getKey(), "blocked", false));
      assertEquals("COMPLETED", ok("POST", "/qr-payment/scan", f.child(),
          payment(f, "1.00", entry.getValue())).get("status").asText());
    }
    money("41.00", profile(f).get("cardBalance"));
  }

  @Test
  void choresReserveFundsAndPayOnlyAfterReviewOnce() throws Exception {
    var f = fixture();
    var task =
        ok(
            "POST",
            "/chores",
            f.parent(),
            Map.of("childId", f.childId(), "title", "Уборка", "rewardByn", 3, "rewardCoins", 50));
    String id = task.get("id").asText();
    money("3.00", state(f.parent()).get("family").get("heldBalance"));
    assertEquals(
        409,
        call("POST", "/chores/" + id + "/approve", f.parent(), null, UUID.randomUUID().toString())
            .status());
    ok("POST", "/chores/" + id + "/submit", f.child(), null);
    ok("POST", "/chores/" + id + "/approve", f.parent(), null);
    ok("POST", "/chores/" + id + "/approve", f.parent(), null);
    money("48.00", profile(f).get("cardBalance"));
    assertEquals(500, profile(f).get("mobyCoins").asInt());
    money("0.00", state(f.parent()).get("family").get("heldBalance"));
  }

  @Test
  void piggyMatchingMovesBothBalancesAndRollsBackTogether() throws Exception {
    var f = fixture();
    var piggy =
        ok(
            "POST",
            "/piggy",
            f.parent(),
            Map.of(
                "childId",
                f.childId(),
                "title",
                "Велосипед",
                "targetAmount",
                300,
                "parentMatchPercent",
                50));
    String path = "/piggy/" + piggy.get("id").asText() + "/deposit";
    ok("POST", path, f.child(), Map.of("amount", 10));
    money("35.00", profile(f).get("cardBalance"));
    money("1995.00", state(f.parent()).get("family").get("parentMainBalance"));
    money(
        "15.00",
        state(f.child()).get("children").get(0).get("piggyBanks").get(0).get("currentAmount"));
    parentUpdate(f, p -> p.parentMainBalance = new BigDecimal("0.00"));
    assertEquals(
        409,
        call("POST", path, f.child(), Map.of("amount", 10), UUID.randomUUID().toString()).status());
    money("35.00", profile(f).get("cardBalance"));
  }

  @Test
  void accessIsolationAndQrTokensAreEnforced() throws Exception {
    var a = fixture();
    var b = fixture();
    assertEquals(401, call("GET", "/family/state", null, null, null).status());
    assertEquals(
        403,
        call(
                "POST",
                "/parent/top-up",
                a.child(),
                Map.of("childId", a.childId(), "amount", 1),
                UUID.randomUUID().toString())
            .status());
    assertEquals(
        404,
        call(
                "POST",
                "/parent/top-up",
                a.parent(),
                Map.of("childId", b.childId(), "amount", 1),
                UUID.randomUUID().toString())
            .status());
    var qr = ok("POST", "/parent/children/" + a.childId() + "/login-qr", a.parent(), null);
    var req = Map.of("qrAuthToken", qr.get("qrAuthToken").asText());
    ok("POST", "/auth/qr-login", null, req);
    assertEquals(401, call("POST", "/auth/qr-login", null, req, null).status());
    assertTrue(state(a.child()).get("family").get("parentMainBalance").isNull());
    assertEquals(1, state(a.child()).get("children").size());
  }

  @Test
  void privacyIsAppliedToStateAndHistory() throws Exception {
    var f = fixture(15);
    ok("POST", "/qr-payment/scan", f.child(), payment(f, "4.50", "5411"));
    var parentTransaction = state(f.parent()).get("children").get(0).get("transactions").get(0);
    assertTrue(parentTransaction.get("detailsHidden").asBoolean());
    assertTrue(parentTransaction.get("merchantName").isNull());
    assertEquals(0, parentTransaction.get("receiptItems").size());
    assertEquals(
        "Магазин",
        state(f.child())
            .get("children")
            .get(0)
            .get("transactions")
            .get(0)
            .get("merchantName")
            .asText());
    var history = ok("GET", "/children/" + f.childId() + "/transactions", f.parent(), null);
    assertTrue(history.get(0).get("mccCategory").isNull());
  }

  @Test
  void quizIsGradedOnServerAndCannotFarmCoins() throws Exception {
    var f = fixture();
    var wrong =
        Map.of("childId", f.childId(), "quizId", "intro", "answers", List.of(0), "score", 100);
    assertEquals(
        "QUIZ_FAILED",
        ok("POST", "/gamification/quiz-complete", f.child(), wrong).get("status").asText());
    assertEquals(450, profile(f).get("mobyCoins").asInt());
    var correct = Map.of("childId", f.childId(), "quizId", "intro", "answers", List.of(1));
    ok("POST", "/gamification/quiz-complete", f.child(), correct);
    ok("POST", "/gamification/quiz-complete", f.child(), correct);
    assertEquals(550, profile(f).get("mobyCoins").asInt());
  }

  @Test
  void shopPurchaseRequiresCoinsAndCannotDebitTwice() throws Exception {
    var f = fixture();
    var items = state(f.child()).get("children").get(0).get("shop");
    JsonNode item = null;
    for (var i : items) if (i.get("assetCode").asText().equals("NEON_CARD")) item = i;
    assertNotNull(item);
    String path = "/gamification/shop/" + item.get("id").asText() + "/buy";
    ok("POST", path, f.child(), Map.of("childId", f.childId()));
    ok("POST", path, f.child(), Map.of("childId", f.childId()));
    assertEquals(330, profile(f).get("mobyCoins").asInt());
    assertEquals("NEON_CARD", profile(f).get("activeCardSkin").asText());
  }

  @Test
  void depositConfigurationDoesNotReDebitInitialPrincipal() throws Exception {
    var f = fixture();
    var req =
        Map.of(
            "childId",
            f.childId(),
            "planType",
            "MONTHLY_500_PLUS_50",
            "initialAmount",
            500,
            "parent1Monthly",
            50,
            "parent2Monthly",
            50);
    var d = ok("POST", "/deposits/capital18/configure", f.parent(), req);
    ok("POST", "/deposits/capital18/configure", f.parent(), req);
    money("1500.00", state(f.parent()).get("family").get("parentMainBalance"));
    assertTrue(
        d.get("projectedFinalAmount").decimalValue().compareTo(new BigDecimal("8900.00")) > 0);
    ok(
        "POST",
        "/deposits/capital18/" + d.get("id").asText() + "/gift",
        f.parent(),
        Map.of("amount", 20));
    money("1480.00", state(f.parent()).get("family").get("parentMainBalance"));
    money("20.00", state(f.parent()).get("children").get(0).get("capital18").get("bufferBalance"));
  }

  @Test
  void schedulerChargesOnceAndResetsCounters() throws Exception {
    var f = fixture();
    var a =
        ok(
            "POST",
            "/parent/allowances",
            f.parent(),
            Map.of("childId", f.childId(), "amount", 10, "dayOfMonth", 1, "active", true));
    UUID aid = UUID.fromString(a.get("id").asText());
    tx.executeWithoutResult(
        t -> {
          var p = db.get(ChildProfile.class, f.childId());
          p.spendingDate = support.today().minusDays(1);
          p.spentToday = new BigDecimal("9.00");
          db.get(AllowanceSchedule.class, aid).nextPaymentDate = support.today();
        });
    schedules.processFamily(f.familyId());
    schedules.processFamily(f.familyId());
    money("55.00", profile(f).get("cardBalance"));
    money("1990.00", state(f.parent()).get("family").get("parentMainBalance"));
    money("0.00", profile(f).get("spentToday"));
  }

  @Test
  void simultaneousPaymentsCannotOverdraw() throws Exception {
    var f = fixture();
    childUpdate(f, p -> p.cardBalance = new BigDecimal("5.00"));
    try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
      var jobs = new ArrayList<Future<JsonNode>>();
      for (int i = 0; i < 6; i++)
        jobs.add(
            pool.submit(
                () -> ok("POST", "/qr-payment/scan", f.child(), payment(f, "4.00", "5411"))));
      int completed = 0;
      for (var job : jobs)
        if (job.get(20, TimeUnit.SECONDS).get("status").asText().equals("COMPLETED")) completed++;
      assertEquals(1, completed);
    }
    money("1.00", profile(f).get("cardBalance"));
    money("4.00", profile(f).get("spentToday"));
  }

  @Test
  void panicRideBypassesChildFreezeAndBalanceButChargesParent() throws Exception {
    var f = fixture();
    childUpdate(
        f,
        p -> {
          p.cardFrozen = true;
          p.cardBalance = BigDecimal.ZERO;
          p.dailyLimit = BigDecimal.ZERO;
        });
    ok("POST", "/safety/panic-ride", f.child(), Map.of("childId", f.childId()));
    money("1988.00", state(f.parent()).get("family").get("parentMainBalance"));
    money("0.00", profile(f).get("cardBalance"));
  }

  @Test
  void invalidAmountsAndMismatchedReceiptsAreRejected() throws Exception {
    var f = fixture();
    assertEquals(
        400,
        call(
                "POST",
                "/parent/top-up",
                f.parent(),
                Map.of("childId", f.childId(), "amount", -1),
                UUID.randomUUID().toString())
            .status());
    var req = new HashMap<>(payment(f, "4.50", "5411"));
    req.put("amount", new BigDecimal("5.00"));
    assertEquals(
        400,
        call("POST", "/qr-payment/scan", f.child(), req, UUID.randomUUID().toString()).status());
    assertEquals(
        400,
        call("POST", "/qr-payment/scan", f.child(), payment(f, "1.00", "5411"), null).status());
  }

  @Test
  void depositAccrualAndRolloverAreDurable() throws Exception {
    var f = fixture();
    var result =
        ok(
            "POST",
            "/deposits/capital18/configure",
            f.parent(),
            Map.of(
                "childId",
                f.childId(),
                "planType",
                "MONTHLY_500_PLUS_50",
                "initialAmount",
                500,
                "parent1Monthly",
                50,
                "parent2Monthly",
                50));
    UUID id = UUID.fromString(result.get("id").asText());
    tx.executeWithoutResult(
        t -> {
          var d = db.get(LongTermDeposit.class, id);
          d.nextAccrualDate = support.today();
          d.nextRolloverDate = support.today();
        });
    schedules.processFamily(f.familyId());
    schedules.processFamily(f.familyId());
    var d = state(f.parent()).get("children").get(0).get("capital18");
    money("604.79", d.get("currentBalance"));
    money("0.00", d.get("bufferBalance"));
    money("1400.00", state(f.parent()).get("family").get("parentMainBalance"));
  }

  @Test
  void safetySettingsAndMonthlyLimitAreEnforced() throws Exception {
    var f = fixture();
    ok(
        "PATCH",
        "/parent/safety-settings",
        f.parent(),
        Map.of(
            "childId",
            f.childId(),
            "onlinePaymentsAllowed",
            false,
            "belarusOnly",
            true,
            "transfersAllowed",
            false,
            "notificationsEnabled",
            true));
    var online = new HashMap<>(payment(f, "2.00", "5411"));
    online.put("online", true);
    assertEquals(
        "DECLINED_ONLINE",
        ok("POST", "/qr-payment/scan", f.child(), online).get("status").asText());
    var foreign = new HashMap<>(payment(f, "2.00", "5411"));
    foreign.put("countryCode", "PL");
    assertEquals(
        "DECLINED_COUNTRY",
        ok("POST", "/qr-payment/scan", f.child(), foreign).get("status").asText());
    childUpdate(f, p -> p.monthlyLimit = new BigDecimal("1.00"));
    assertEquals(
        "DECLINED_LIMIT",
        ok("POST", "/qr-payment/scan", f.child(), payment(f, "2.00", "5411"))
            .get("status")
            .asText());
    money("45.00", profile(f).get("cardBalance"));
  }

  @Test
  void splitBillTransfersBetweenTwoChildrenOnce() throws Exception {
    var f = fixture();
    var onboard =
        ok("POST", "/onboarding/child", f.parent(), Map.of("firstName", "Второй", "age", 12));
    UUID payer = UUID.fromString(onboard.get("childId").asText());
    var login =
        ok(
            "POST",
            "/auth/qr-login",
            null,
            Map.of("qrAuthToken", onboard.get("qrAuthToken").asText()));
    String payerToken = login.get("accessToken").asText();
    ok("POST", "/parent/top-up", f.parent(), Map.of("childId", payer, "amount", 10));
    var bill =
        ok(
            "POST",
            "/social/split-bill",
            f.child(),
            Map.of(
                "childId",
                f.childId(),
                "payerChildId",
                payer,
                "friendName",
                "Второй",
                "itemTitle",
                "Пицца",
                "shareAmount",
                3));
    String path = "/social/split-bill/" + bill.get("id").asText() + "/pay";
    ok("POST", path, payerToken, null);
    ok("POST", path, payerToken, null);
    money("48.00", profile(f).get("cardBalance"));
    money("7.00", state(payerToken).get("children").get(0).get("profile").get("cardBalance"));
  }

  @Test
  void ssePublishesCommittedPaymentWithoutReceiptData() throws Exception {
    var f = fixture();
    var req =
        HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1/family/events"))
            .header("Authorization", "Bearer " + f.parent())
            .GET()
            .build();
    var response = http.send(req, HttpResponse.BodyHandlers.ofInputStream());
    assertEquals(200, response.statusCode());
    var reader =
        new java.io.BufferedReader(
            new java.io.InputStreamReader(
                response.body(), java.nio.charset.StandardCharsets.UTF_8));
    var pool = Executors.newVirtualThreadPerTaskExecutor();
    try {
      var ready =
          pool.submit(
              () -> {
                String line;
                while ((line = reader.readLine()) != null)
                  if (line.startsWith("data:")) return line;
                return "";
              });
      assertTrue(ready.get(5, TimeUnit.SECONDS).contains("refreshState"));
      ok("POST", "/qr-payment/scan", f.child(), payment(f, "4.50", "5411"));
      var update =
          pool.submit(
              () -> {
                String line;
                while ((line = reader.readLine()) != null)
                  if (line.startsWith("data:")) return line;
                return "";
              });
      var event = update.get(8, TimeUnit.SECONDS);
      assertTrue(event.contains("PAYMENT_COMPLETED"), event);
      assertFalse(event.contains("Магазин"));
      assertFalse(event.contains("receiptItems"));
    } finally {
      response.body().close();
      pool.shutdownNow();
    }
  }

  @Test
  void standaloneWalletCanBeFundedWithoutBankAndCannotReplayCredits() throws Exception {
    var f = fixture();
    var key = UUID.randomUUID().toString();
    var result = ok("POST", "/parent/wallet/fund", f.parent(), Map.of("amount", 100), key);
    assertEquals("VIRTUAL_FUNDS_ADDED", result.get("status").asText());
    ok("POST", "/parent/wallet/fund", f.parent(), Map.of("amount", 100), key);
    money("2100.00", state(f.parent()).get("family").get("parentMainBalance"));
    assertEquals(
        403,
        call(
                "POST",
                "/parent/wallet/fund",
                f.child(),
                Map.of("amount", 100),
                UUID.randomUUID().toString())
            .status());
  }
}
