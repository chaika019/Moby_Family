package by.chaika19.mobyfamily.service;

import static by.chaika19.mobyfamily.service.CommandBus.Context;

import by.chaika19.mobyfamily.api.*;
import by.chaika19.mobyfamily.domain.*;
import by.chaika19.mobyfamily.security.*;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
public class StateService {
  private final DomainSupport s;
  private final AuthService auth;
  private final GamificationService game;
  private final ObjectMapper json;
  private final boolean demo;

  public StateService(
      DomainSupport s,
      AuthService auth,
      GamificationService game,
      ObjectMapper json,
      @Value("${app.demo:false}") boolean demo) {
    this.s = s;
    this.auth = auth;
    this.game = game;
    this.json = json;
    this.demo = demo;
  }

  @Transactional
  public Api.FamilyState state() {
    var a = auth.actor();
    var f = s.db.lock(FamilyAccount.class, a.familyId());
    var fv =
        new Api.FamilyView(
            f.id,
            f.familyName,
            a.isParent() ? f.parentMainBalance : null,
            a.isParent() ? f.heldBalance : null,
            a.isParent() ? f.parentMainBalance.subtract(f.heldBalance) : null,
            f.subscriptionActive,
            f.subscriptionFee,
            f.cashbackAccumulated,
            f.insuranceActive,
            f.nextSubscriptionDate);
    var profiles =
        a.isParent()
            ? s.db.find(ChildProfile.class, "e.familyId=?1", f.id)
            : s.db.find(ChildProfile.class, "e.id=?1", a.childId());
    profiles.sort(Comparator.comparing(p -> p.firstName));
    return new Api.FamilyState(
        fv,
        profiles.stream().map(p -> childState(a, p)).toList(),
        benefits(),
        presets(),
        s.clock.instant(),
        demo);
  }

  private Api.ChildState childState(Actor a, ChildProfile p) {
    s.resetSpending(p);
    int age = s.age(p);
    var profile =
        new Api.ChildView(
            p.id,
            p.firstName,
            age,
            age < 14 ? "KIDS_7_13" : "TEEN_14_17",
            age < 14 ? "PARENT_SUBACCOUNT" : "PERSONAL_ACCOUNT",
            p.cardBalance,
            p.mobyCoins,
            p.cardFrozen,
            p.privacyMode,
            p.activeMascotSkin,
            p.activePaySound,
            p.activeCardSkin,
            p.dailyLimit,
            p.monthlyLimit,
            p.spentToday,
            p.spentMonth,
            p.onlinePaymentsAllowed,
            p.belarusOnly,
            p.transfersAllowed,
            p.notificationsEnabled,
            p.cardType,
            p.cardLastFour);
    var rules =
        s.db.find(SpendingRule.class, "e.childId=?1", p.id).stream()
            .map(r -> new Api.RuleView(r.id, p.id, r.categoryCode, r.blocked))
            .toList();
    var sos =
        s.db.find(SosCheckoutRequest.class, "e.childId=?1", p.id).stream()
            .map(
                r -> {
                  var t = s.required(TransactionRecord.class, r.transactionId);
                  boolean hidden = hidden(a, p, t);
                  return new Api.SosView(
                      r.id,
                      p.id,
                      t.id,
                      hidden ? null : t.merchantName,
                      t.amount,
                      r.missingAmount,
                      r.status,
                      r.createdAt,
                      r.expiresAt);
                })
            .toList();
    var chores =
        s.db.find(ChoreTask.class, "e.childId=?1", p.id).stream()
            .map(
                t ->
                    new Api.ChoreView(
                        t.id, p.id, t.title, t.rewardByn, t.rewardCoins, t.status, t.photoProofUrl))
            .toList();
    var piggies =
        s.db.find(PiggyBank.class, "e.childId=?1", p.id).stream()
            .map(
                g ->
                    new Api.PiggyView(
                        g.id,
                        p.id,
                        g.title,
                        g.targetAmount,
                        g.currentAmount,
                        g.parentMatchPercent,
                        g.battle,
                        g.opponentName,
                        g.opponentProgress))
            .toList();
    var deposit =
        s.db
            .first(LongTermDeposit.class, "e.childId=?1", p.id)
            .map(
                d ->
                    new Api.DepositView(
                        d.id,
                        p.id,
                        d.planType,
                        d.initialDeposit,
                        d.currentBalance,
                        d.bufferBalance,
                        d.monthlyAutoPayParent1,
                        d.monthlyAutoPayParent2,
                        d.interestRate,
                        d.maturityDate,
                        d.nextRolloverDate,
                        d.projectedFinalAmount,
                        d.consecutiveMonths,
                        d.grantEligible,
                        d.grantPaid,
                        d.status,
                        "/api/v1/public/gifts/" + d.giftToken))
            .orElse(null);
    var splits =
        s.db.find(SplitBill.class, "e.childId=?1 or e.payerChildId=?1", p.id).stream()
            .map(
                b ->
                    new Api.SplitView(
                        b.id,
                        b.childId,
                        b.payerChildId,
                        b.friendName,
                        b.itemTitle,
                        b.shareAmount,
                        b.paid,
                        b.debtorMemeBadge))
            .toList();
    var transactions = transactionsFor(a, p, 0, 100);
    var owned =
        s.db.find(RewardOwnership.class, "e.childId=?1", p.id).stream()
            .map(o -> o.itemId)
            .collect(java.util.stream.Collectors.toSet());
    var shop =
        s.db.find(RewardShopItem.class, "e.familyId is null or e.familyId=?1", p.familyId).stream()
            .map(
                i ->
                    new Api.ShopView(
                        i.id,
                        i.itemType,
                        i.title,
                        i.assetCode,
                        i.costCoins,
                        i.rarity,
                        owned.contains(i.id)))
            .toList();
    var allowances =
        s.db.find(AllowanceSchedule.class, "e.childId=?1", p.id).stream()
            .map(
                b ->
                    new Api.AllowanceView(
                        b.id,
                        p.id,
                        b.amount,
                        b.dayOfMonth,
                        b.nextPaymentDate,
                        b.active,
                        b.lastStatus))
            .toList();
    return new Api.ChildState(
        profile,
        rules,
        sos,
        chores,
        piggies,
        deposit,
        splits,
        transactions,
        shop,
        allowances,
        game.academy(p));
  }

  @Transactional
  public List<Api.TransactionView> transactions(UUID childId, int page, int size) {
    var a = auth.actor();
    var f = s.db.lock(FamilyAccount.class, a.familyId());
    var p = s.child(new Context(a, f), childId);
    return transactionsFor(a, p, page, size);
  }

  private List<Api.TransactionView> transactionsFor(Actor a, ChildProfile p, int page, int size) {
    return s
        .db
        .page(
            TransactionRecord.class,
            "e.childId=?1",
            "e.createdAt desc, e.id",
            page * size,
            size,
            p.id)
        .stream()
        .map(
            t -> {
              boolean hide = hidden(a, p, t);
              List<Api.ReceiptItem> items =
                  hide
                      ? List.of()
                      : json.readValue(
                          t.receiptItemsJson, new TypeReference<List<Api.ReceiptItem>>() {});
              return new Api.TransactionView(
                  t.id,
                  p.id,
                  hide ? null : t.merchantName,
                  hide ? null : t.mccCategory,
                  t.amount,
                  t.cashbackEarned,
                  t.paymentMethod,
                  t.secretGiftMode,
                  items,
                  t.status,
                  t.createdAt,
                  hide);
            })
        .toList();
  }

  private boolean hidden(Actor a, ChildProfile p, TransactionRecord t) {
    return a.isParent() && ((s.age(p) >= 14 && p.privacyMode) || t.secretGiftMode);
  }

  public static List<Api.Benefit> benefits() {
    return List.of(
        new Api.Benefit(
            "SCHOOL_SHIELD",
            "Школьный щит 24/7",
            "Демонстрационное покрытие травм в школе и секциях",
            new BigDecimal("5000.00")),
        new Api.Benefit(
            "CYBER_SHIELD",
            "Кибер-щит",
            "Демонстрационная защита от фишинга и скама",
            new BigDecimal("300.00")),
        new Api.Benefit(
            "PHONE_CARD",
            "Экран и карта",
            "Каталог микростраховок; оформление через партнёра не подключено",
            null),
        new Api.Benefit(
            "HALVA",
            "Дополнительная рассрочка Халва",
            "Описание предложения: +2–3 месяца на школьные товары; кредитование не подключено",
            null),
        new Api.Benefit(
            "FAMILY_SUBSCRIPTIONS",
            "Семейные подписки",
            "Описание предложения: скидка до 50%; партнёрские подписки не подключены",
            null));
  }

  public static List<Api.QrPreset> presets() {
    return List.of(
        new Api.QrPreset(
            "buffet",
            "Школьный буфет (Обед)",
            "5812",
            new BigDecimal("4.50"),
            List.of(new Api.ReceiptItem("Обед", 1, new BigDecimal("4.50")))),
        new Api.QrPreset(
            "sos",
            "Супермаркет Соседи",
            "5411",
            new BigDecimal("52.00"),
            List.of(new Api.ReceiptItem("Продукты", 1, new BigDecimal("52.00")))),
        new Api.QrPreset(
            "books",
            "Книги и канцелярия",
            "5942",
            new BigDecimal("15.00"),
            List.of(new Api.ReceiptItem("Книга", 1, new BigDecimal("15.00")))));
  }
}
