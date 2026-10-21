package by.chaika19.mobyfamily.service;

import by.chaika19.mobyfamily.domain.*;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DemoData implements ApplicationRunner {
  private final DomainSupport s;
  private final FamilyService family;
  private final DepositService deposits;
  private final PasswordEncoder passwords;
  private final boolean demo;

  public DemoData(
      DomainSupport s,
      FamilyService family,
      DepositService deposits,
      PasswordEncoder passwords,
      @Value("${app.demo:false}") boolean demo) {
    this.s = s;
    this.family = family;
    this.deposits = deposits;
    this.passwords = passwords;
    this.demo = demo;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    if (s.db.all(RewardShopItem.class).stream().noneMatch(i -> i.familyId == null)) {
      item("MASCOT_SKIN", "Кибер-Лис в шлеме", "CYBER_FOX_DEFAULT", 100, "COMMON");
      item("MASCOT_SKIN", "Космический Лис", "SPACE_FOX", 500, "LEGENDARY");
      item("PAY_SOUND", "Монетка Mario", "MARIO_COIN", 150, "RARE");
      item("PAY_SOUND", "Космическая оплата", "SPACE_CHIME", 200, "EPIC");
      item("CARD_SKIN", "Неоновая карта", "NEON_CARD", 120, "RARE");
    }
    if (!demo || s.db.first(AppUser.class, "e.email=?1", "parent@moby.local").isPresent()) return;
    var f = new FamilyAccount();
    f.familyName = "Алексей (Родитель)";
    f.parentMainBalance = new BigDecimal("1450.00");
    f.heldBalance = new BigDecimal("8.00");
    f.cashbackAccumulated = new BigDecimal("24.50");
    f.subscriptionActive = true;
    f.subscriptionFee = new BigDecimal("6.99");
    f.insuranceActive = true;
    f.nextSubscriptionDate = s.today().plusMonths(1);
    s.db.save(f);
    var user = new AppUser();
    user.familyId = f.id;
    user.email = "parent@moby.local";
    user.passwordHash = passwords.encode("demo-parent-2026!");
    user.role = "PARENT";
    s.db.save(user);
    var nikita = family.createChild(f.id, "Никита", s.today().minusYears(11));
    nikita.cardBalance = new BigDecimal("45.00");
    nikita.mobyCoins = 450;
    nikita.dailyLimit = new BigDecimal("100.00");
    nikita.monthlyLimit = new BigDecimal("500.00");
    nikita.activePaySound = "MARIO_COIN";
    var max = family.createChild(f.id, "Макс", s.today().minusYears(15));
    max.cardBalance = new BigDecimal("30.00");
    max.mobyCoins = 350;
    chore(nikita, "Помыть посуду", "3.00", 50, "SUBMITTED_FOR_REVIEW");
    chore(nikita, "Прочитать главу книги", "5.00", 80, "ASSIGNED");
    var p = new PiggyBank();
    p.childId = nikita.id;
    p.title = "На новый велосипед";
    p.targetAmount = new BigDecimal("300.00");
    p.currentAmount = new BigDecimal("120.00");
    p.parentMatchPercent = 50;
    p.battle = true;
    p.opponentName = "Макс (Брат)";
    p.opponentProgress = new BigDecimal("95.00");
    s.db.save(p);
    var d = new LongTermDeposit();
    d.childId = nikita.id;
    d.planType = "MONTHLY_500_PLUS_50";
    d.initialDeposit = new BigDecimal("500.00");
    d.currentBalance = d.initialDeposit;
    d.bufferBalance = DomainSupport.ZERO;
    d.monthlyAutoPayParent1 = new BigDecimal("50.00");
    d.monthlyAutoPayParent2 = new BigDecimal("50.00");
    d.interestRate = new BigDecimal("11.50");
    d.openedOn = s.today();
    d.nextAccrualDate = s.today().plusMonths(1);
    d.nextRolloverDate = s.today().plusMonths(37);
    d.maturityDate = nikita.birthDate.plusYears(18);
    d.status = "ACTIVE";
    d.giftToken = UUID.randomUUID().toString() + UUID.randomUUID().toString().replace("-", "");
    d.projectedFinalAmount = deposits.project(d, s.today());
    s.db.save(d);
    var completion = new QuizCompletion();
    completion.childId = nikita.id;
    completion.quizId = "intro";
    completion.score = 100;
    completion.completedAt = s.clock.instant();
    s.db.save(completion);
    for (var i :
        s.db.find(
            RewardShopItem.class,
            "e.assetCode=?1 or e.assetCode=?2",
            "CYBER_FOX_DEFAULT",
            "MARIO_COIN")) {
      var owned = new RewardOwnership();
      owned.childId = nikita.id;
      owned.itemId = i.id;
      owned.purchasedAt = s.clock.instant();
      s.db.save(owned);
    }
    var custom = new RewardShopItem();
    custom.familyId = f.id;
    custom.itemType = "PARENT_CUSTOM_PERK";
    custom.title = "+1 час за ПК";
    custom.assetCode = "PC_HOUR";
    custom.costCoins = 200;
    custom.rarity = "COMMON";
    s.db.save(custom);
    s.event(f.id, null, "DEMO_INITIALIZED");
  }

  private void item(String type, String title, String code, int coins, String rarity) {
    var i = new RewardShopItem();
    i.itemType = type;
    i.title = title;
    i.assetCode = code;
    i.costCoins = coins;
    i.rarity = rarity;
    s.db.save(i);
  }

  private void chore(ChildProfile p, String title, String amount, int coins, String status) {
    var c = new ChoreTask();
    c.childId = p.id;
    c.title = title;
    c.rewardByn = new BigDecimal(amount);
    c.rewardCoins = coins;
    c.status = status;
    s.db.save(c);
  }
}
