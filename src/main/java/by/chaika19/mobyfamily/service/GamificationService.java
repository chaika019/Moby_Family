package by.chaika19.mobyfamily.service;

import static by.chaika19.mobyfamily.service.CommandBus.Context;

import by.chaika19.mobyfamily.api.*;
import by.chaika19.mobyfamily.domain.*;
import java.util.*;
import org.springframework.stereotype.Service;

@Service
public class GamificationService {
  private final DomainSupport s;

  public GamificationService(DomainSupport s) {
    this.s = s;
  }

  private record Curriculum(
      String id,
      String title,
      String explanation,
      String prompt,
      List<String> options,
      int correct) {}

  private static final List<Curriculum> LESSONS =
      List.of(
          new Curriculum(
              "intro",
              "Введение",
              "Баланс показывает доступные деньги. Коины — игровые награды, их нельзя обменять на"
                  + " BYN.",
              "Можно ли расплатиться Moby Coins в обычном магазине?",
              List.of("Да, как рублями", "Нет, это игровые награды"),
              1),
          new Curriculum(
              "finance",
              "Финансы",
              "Сначала учитывай обязательные расходы, затем планируй покупки и накопления.",
              "У тебя 10 BYN, обед стоит 4 BYN. Сколько осталось?",
              List.of("14 BYN", "6 BYN", "10 BYN"),
              1),
          new Curriculum(
              "security",
              "Безопасность",
              "Не передавай коды из SMS и данные карты даже человеку, который представился"
                  + " сотрудником банка.",
              "Незнакомец просит код из SMS. Что делать?",
              List.of("Отправить код", "Не сообщать и обратиться к родителю"),
              1),
          new Curriculum(
              "shopping",
              "Умные покупки",
              "Сравнивай цены и отличай необходимые покупки от импульсивных.",
              "Перед покупкой дорогой вещи лучше…",
              List.of("Сравнить цены и проверить бюджет", "Купить сразу"),
              0),
          new Curriculum(
              "budget",
              "Планирование бюджета",
              "Лимит помогает распределить деньги на весь период.",
              "Есть 20 BYN на 5 дней. Равномерный дневной бюджет?",
              List.of("10 BYN", "5 BYN", "4 BYN"),
              2),
          new Curriculum(
              "goals",
              "Достижение целей",
              "Регулярные небольшие взносы помогают накопить на цель.",
              "Если откладывать 5 BYN в неделю, за 4 недели получится…",
              List.of("20 BYN", "9 BYN", "10 BYN"),
              0),
          new Curriculum(
              "extra",
              "Дополнительные уроки",
              "Проценты на накопления могут начисляться и на ранее полученные проценты.",
              "Что такое капитализация?",
              List.of("Комиссия за карту", "Добавление процентов к сумме накоплений"),
              1),
          new Curriculum(
              "final",
              "Финальный экзамен",
              "Береги персональные данные, планируй бюджет и проверяй платежи.",
              "Для безопасной покупки нужно…",
              List.of("Передать продавцу пароль", "Проверить продавца, сумму и бюджет"),
              1));

  public Api.Academy academy(ChildProfile p) {
    var completed = s.db.find(QuizCompletion.class, "e.childId=?1", p.id);
    Set<String> ids = new HashSet<>();
    completed.forEach(q -> ids.add(q.quizId));
    int consecutive = 0;
    for (var l : LESSONS) {
      if (ids.contains(l.id)) consecutive++;
      else break;
    }
    final int progress = consecutive;
    List<Api.Lesson> views = new ArrayList<>();
    for (int i = 0; i < LESSONS.size(); i++) {
      var l = LESSONS.get(i);
      views.add(
          new Api.Lesson(
              l.id,
              i + 1,
              l.title,
              l.explanation,
              List.of(new Api.Question(l.prompt, l.options)),
              i <= progress,
              ids.contains(l.id)));
    }
    var dates =
        completed.stream()
            .map(q -> q.completedAt.atZone(s.zone).toLocalDate())
            .distinct()
            .sorted(Comparator.reverseOrder())
            .toList();
    int streak = 0;
    var expected = s.today();
    if (!dates.isEmpty() && dates.getFirst().equals(expected.minusDays(1)))
      expected = expected.minusDays(1);
    for (var day : dates) {
      if (!day.equals(expected)) break;
      streak++;
      expected = expected.minusDays(1);
    }
    return new Api.Academy(
        p.id,
        Math.min(8, progress + 1),
        8,
        ids.size() * 100,
        progress == 8 ? 0 : 100,
        streak,
        views);
  }

  public Api.ActionResult quiz(Context c, Api.QuizAttempt req) {
    var p = s.junior(c, req.childId());
    s.activeChild(p);
    var lesson =
        LESSONS.stream()
            .filter(l -> l.id.equals(req.quizId()))
            .findFirst()
            .orElseThrow(() -> ApiException.bad("UNKNOWN_QUIZ", "Урок не найден"));
    if (s.db
        .first(QuizCompletion.class, "e.childId=?1 and e.quizId=?2", p.id, lesson.id)
        .isPresent()) return Api.ActionResult.of(p.id, "ALREADY_COMPLETED", null);
    int index = LESSONS.indexOf(lesson);
    if (index > 0
        && s.db
            .first(
                QuizCompletion.class,
                "e.childId=?1 and e.quizId=?2",
                p.id,
                LESSONS.get(index - 1).id)
            .isEmpty())
      throw ApiException.conflict("LESSON_LOCKED", "Сначала пройдите предыдущий урок");
    if (req.answers().size() != 1)
      throw ApiException.bad("INVALID_ANSWERS", "Укажите один ответ на вопрос");
    int score = req.answers().getFirst() == lesson.correct ? 100 : 0;
    if (score < 70)
      return new Api.ActionResult(
          p.id, "QUIZ_FAILED", null, null, null, "Результат: " + score + "%. Попробуйте ещё раз");
    var completion = new QuizCompletion();
    completion.childId = p.id;
    completion.quizId = lesson.id;
    completion.score = score;
    completion.completedAt = s.clock.instant();
    s.db.save(completion);
    p.mobyCoins = Math.addExact(p.mobyCoins, 100);
    s.event(c.family().id, p.id, "QUIZ_COMPLETED");
    return new Api.ActionResult(completion.id, "COMPLETED", null, null, null, "+100 Moby Coins");
  }

  public Api.ActionResult buy(Context c, UUID itemId, Api.ShopAction req) {
    var p = s.junior(c, req.childId());
    s.activeChild(p);
    var item = s.required(RewardShopItem.class, itemId);
    if (item.familyId != null && !item.familyId.equals(c.family().id)) throw ApiException.missing();
    if (s.db
        .first(RewardOwnership.class, "e.childId=?1 and e.itemId=?2", p.id, item.id)
        .isPresent()) return Api.ActionResult.of(item.id, "ALREADY_OWNED", null);
    if (p.mobyCoins < item.costCoins)
      throw ApiException.conflict("INSUFFICIENT_COINS", "Недостаточно Moby Coins");
    p.mobyCoins -= item.costCoins;
    var owned = new RewardOwnership();
    owned.childId = p.id;
    owned.itemId = item.id;
    owned.purchasedAt = s.clock.instant();
    s.db.save(owned);
    equip(p, item);
    s.event(c.family().id, p.id, "SHOP_PURCHASED");
    return Api.ActionResult.of(item.id, "PURCHASED", null);
  }

  public Api.ActionResult activate(Context c, UUID itemId, Api.ShopAction req) {
    var p = s.junior(c, req.childId());
    var item = s.required(RewardShopItem.class, itemId);
    if (s.db.first(RewardOwnership.class, "e.childId=?1 and e.itemId=?2", p.id, item.id).isEmpty())
      throw ApiException.forbidden();
    equip(p, item);
    s.event(c.family().id, p.id, "REWARD_ACTIVATED");
    return Api.ActionResult.of(item.id, "ACTIVE", null);
  }

  private void equip(ChildProfile p, RewardShopItem item) {
    switch (item.itemType) {
      case "MASCOT_SKIN" -> p.activeMascotSkin = item.assetCode;
      case "CARD_SKIN" -> p.activeCardSkin = item.assetCode;
      case "PAY_SOUND" -> p.activePaySound = item.assetCode;
      case "PARENT_CUSTOM_PERK" -> {
        /* Ownership is the voucher visible to the parent. */
      }
      default -> throw new IllegalStateException("Unknown shop item type");
    }
  }

  public Api.ActionResult customReward(Context c, Api.CustomReward req) {
    c.actor().parent();
    var item = new RewardShopItem();
    item.familyId = c.family().id;
    item.itemType = "PARENT_CUSTOM_PERK";
    item.title = req.title().trim();
    item.assetCode = "CUSTOM_" + item.id;
    item.costCoins = req.costCoins();
    item.rarity = "COMMON";
    s.db.save(item);
    s.event(c.family().id, null, "SHOP_CHANGED");
    return Api.ActionResult.of(item.id, "CREATED", null);
  }
}
