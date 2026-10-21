package by.chaika19.mobyfamily.api;

import by.chaika19.mobyfamily.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class FamilyController {
  private final CommandBus bus;
  private final FamilyService family;
  private final PaymentService pay;
  private final DepositService deposits;
  private final GamificationService game;
  private final StateService state;
  private final boolean demo;

  public FamilyController(
      CommandBus bus,
      FamilyService family,
      PaymentService pay,
      DepositService deposits,
      GamificationService game,
      StateService state,
      @Value("${app.demo:false}") boolean demo) {
    this.bus = bus;
    this.family = family;
    this.pay = pay;
    this.deposits = deposits;
    this.game = game;
    this.state = state;
    this.demo = demo;
  }

  @GetMapping("/family/state")
  Api.FamilyState state() {
    return state.state();
  }

  @GetMapping("/children/{childId}/transactions")
  List<Api.TransactionView> transactions(
      @PathVariable UUID childId,
      @RequestParam(defaultValue = "0") @Min(0) @Max(10000) int page,
      @RequestParam(defaultValue = "50") @Min(1) @Max(100) int size) {
    return state.transactions(childId, page, size);
  }

  @PostMapping("/onboarding/child")
  Api.Onboarded onboard(@Valid @RequestBody Api.Onboard r) {
    return family.onboard(r);
  }

  @PostMapping("/parent/children/{id}/login-qr")
  Api.Onboarded qr(@PathVariable UUID id) {
    return family.qr(id);
  }

  @PostMapping("/qr-payment/scan")
  Api.ActionResult scan(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.QrPayment r) {
    return bus.execute(key, "scan", r, c -> pay.scan(c, r));
  }

  @PostMapping("/sos/{id}/approve")
  Api.ActionResult approveSos(@RequestHeader("Idempotency-Key") String key, @PathVariable UUID id) {
    return bus.execute(key, "sos-approve", id, c -> pay.approveSos(c, id));
  }

  @PostMapping("/sos/{id}/reject")
  Api.ActionResult rejectSos(@RequestHeader("Idempotency-Key") String key, @PathVariable UUID id) {
    return bus.execute(key, "sos-reject", id, c -> pay.rejectSos(c, id));
  }

  @PostMapping("/parent/wallet/fund")
  Api.ActionResult fund(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.Money r) {
    return bus.execute(key, "virtual-fund", r, c -> family.fundVirtualWallet(c, r));
  }

  @PostMapping("/parent/top-up")
  Api.ActionResult topUp(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.Transfer r) {
    return bus.execute(key, "top-up", r, c -> pay.topUp(c, r));
  }

  @PatchMapping("/parent/mcc-rules")
  Api.ActionResult rule(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.Rule r) {
    return bus.execute(key, "mcc-rule", r, c -> family.rule(c, r));
  }

  @PostMapping("/parent/card-freeze")
  Api.ActionResult freeze(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.Freeze r) {
    return bus.execute(key, "freeze", r, c -> family.freeze(c, r));
  }

  @PatchMapping("/parent/limits")
  Api.ActionResult limits(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.Limits r) {
    return bus.execute(key, "limits", r, c -> family.limits(c, r));
  }

  @PatchMapping("/parent/safety-settings")
  Api.ActionResult safety(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.Safety r) {
    return bus.execute(key, "safety", r, c -> family.safety(c, r));
  }

  @PatchMapping("/children/privacy")
  Api.ActionResult privacy(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.Privacy r) {
    return bus.execute(key, "privacy", r, c -> family.privacy(c, r));
  }

  @PostMapping("/parent/cards")
  Api.ActionResult card(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.Card r) {
    return bus.execute(key, "card", r, c -> family.card(c, r));
  }

  @PostMapping("/chores")
  Api.ActionResult chore(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.Chore r) {
    return bus.execute(key, "chore", r, c -> family.createChore(c, r));
  }

  @PostMapping("/chores/{id}/submit")
  Api.ActionResult submitChore(
      @RequestHeader("Idempotency-Key") String key,
      @PathVariable UUID id,
      @Valid @RequestBody(required = false) Api.Proof r) {
    var proof = r == null ? new Api.Proof(null) : r;
    return bus.execute(key, "chore-submit:" + id, proof, c -> family.submitChore(c, id, proof));
  }

  @PostMapping("/chores/{id}/approve")
  Api.ActionResult approveChore(
      @RequestHeader("Idempotency-Key") String key, @PathVariable UUID id) {
    return bus.execute(key, "chore-approve", id, c -> family.approveChore(c, id));
  }

  @PostMapping("/chores/{id}/cancel")
  Api.ActionResult cancelChore(
      @RequestHeader("Idempotency-Key") String key, @PathVariable UUID id) {
    return bus.execute(key, "chore-cancel", id, c -> family.cancelChore(c, id));
  }

  @PostMapping("/piggy")
  Api.ActionResult piggy(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.Piggy r) {
    return bus.execute(key, "piggy-create", r, c -> family.createPiggy(c, r));
  }

  @PostMapping("/piggy/{id}/deposit")
  Api.ActionResult piggyDeposit(
      @RequestHeader("Idempotency-Key") String key,
      @PathVariable UUID id,
      @Valid @RequestBody Api.Money r) {
    return bus.execute(key, "piggy-deposit:" + id, r, c -> family.piggyDeposit(c, id, r));
  }

  @PostMapping("/deposits/capital18/configure")
  Api.ActionResult configure(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.DepositPlan r) {
    return bus.execute(key, "capital18", r, c -> deposits.configure(c, r));
  }

  @PostMapping("/deposits/capital18/{id}/gift")
  Api.ActionResult gift(
      @RequestHeader("Idempotency-Key") String key,
      @PathVariable UUID id,
      @Valid @RequestBody Api.Money r) {
    return bus.execute(key, "deposit-gift:" + id, r, c -> deposits.gift(c, id, r));
  }

  @PostMapping("/deposits/capital18/{id}/adult-package")
  Api.ActionResult adultPackage(
      @RequestHeader("Idempotency-Key") String key, @PathVariable UUID id) {
    return bus.execute(key, "adult-package", id, c -> deposits.acceptAdultPackage(c, id));
  }

  @GetMapping("/public/gifts/{token}")
  Api.GiftInfo giftInfo(@PathVariable @Size(max = 100) String token) {
    return deposits.publicGift(token, demo);
  }

  @PostMapping("/social/split-bill")
  Api.ActionResult split(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.Split r) {
    return bus.execute(key, "split", r, c -> family.split(c, r));
  }

  @PostMapping("/social/split-bill/{id}/close")
  Api.ActionResult closeSplit(@RequestHeader("Idempotency-Key") String key,@PathVariable UUID id) {
    return bus.execute(key,"split-close",id,c->family.closeSplitNote(c,id));
  }

  @PostMapping("/social/split-bill/{id}/pay")
  Api.ActionResult paySplit(@RequestHeader("Idempotency-Key") String key, @PathVariable UUID id) {
    return bus.execute(key, "split-pay", id, c -> family.paySplit(c, id));
  }

  @PostMapping("/safety/panic-ride")
  Api.ActionResult panic(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.ChildId r) {
    return bus.execute(key, "panic-ride", r, c -> pay.panic(c, r));
  }

  @PostMapping("/gamification/quiz-complete")
  Api.ActionResult quiz(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.QuizAttempt r) {
    return bus.execute(key, "quiz", r, c -> game.quiz(c, r));
  }

  @PostMapping("/gamification/shop/{id}/buy")
  Api.ActionResult buy(
      @RequestHeader("Idempotency-Key") String key,
      @PathVariable UUID id,
      @Valid @RequestBody Api.ShopAction r) {
    return bus.execute(key, "shop-buy:" + id, r, c -> game.buy(c, id, r));
  }

  @PostMapping("/gamification/shop/{id}/activate")
  Api.ActionResult activate(
      @RequestHeader("Idempotency-Key") String key,
      @PathVariable UUID id,
      @Valid @RequestBody Api.ShopAction r) {
    return bus.execute(key, "shop-activate:" + id, r, c -> game.activate(c, id, r));
  }

  @PostMapping("/parent/rewards")
  Api.ActionResult reward(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.CustomReward r) {
    return bus.execute(key, "custom-reward", r, c -> game.customReward(c, r));
  }

  @PostMapping("/parent/allowances")
  Api.ActionResult allowance(
      @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Api.Allowance r) {
    return bus.execute(key, "allowance", r, c -> family.allowance(c, r));
  }

  @PostMapping("/parent/allowances/{id}/stop")
  Api.ActionResult stopAllowance(
      @RequestHeader("Idempotency-Key") String key, @PathVariable UUID id) {
    return bus.execute(key, "allowance-stop", id, c -> family.stopAllowance(c, id));
  }

  @PostMapping("/parent/subscription/{active}")
  Api.ActionResult subscription(
      @RequestHeader("Idempotency-Key") String key, @PathVariable boolean active) {
    return bus.execute(key, "subscription", active, c -> family.subscription(c, active));
  }
}
