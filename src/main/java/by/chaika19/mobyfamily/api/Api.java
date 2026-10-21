package by.chaika19.mobyfamily.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

public final class Api {
  private Api() {}

  public record Register(
      @NotBlank @Email @Size(max = 200) String email,
      @NotBlank @Size(min = 10, max = 100) String password,
      @NotBlank @Size(max = 100) String familyName) {}

  public record Login(@NotBlank @Email String email, @NotBlank String password) {}

  public record QrLogin(@NotBlank @Size(max = 100) String qrAuthToken) {}

  public record Token(
      String accessToken,
      String tokenType,
      Instant expiresAt,
      String role,
      UUID familyId,
      UUID childId) {}

  public record Onboard(
      @NotBlank @Size(max = 80) String firstName,
      @Min(7) @Max(17) int age,
      LocalDate birthDate,
      @Size(max = 1400000) String birthCertScanBase64) {}

  public record Onboarded(
      UUID childId, String qrAuthToken, Instant expiresAt, String accountType) {}

  public record ReceiptItem(
      @NotBlank @Size(max = 150) String title,
      @Min(1) @Max(1000) int quantity,
      @NotNull @DecimalMin("0.01") @Digits(integer = 7, fraction = 2) BigDecimal unitPrice) {}

  public record QrPayment(
      @NotNull UUID childId,
      @NotBlank @Size(max = 150) String merchantName,
      @NotBlank @Pattern(regexp = "[0-9]{4}") String mccCategory,
      @NotNull @DecimalMin("0.01") @Digits(integer = 7, fraction = 2) BigDecimal amount,
      @NotNull @Size(max = 100) List<@Valid ReceiptItem> receiptItems,
      Boolean secretGiftMode,
      @Pattern(regexp = "[A-Z]{2}") String countryCode,
      Boolean online) {}

  public record Rule(
      @NotNull UUID childId,
      @NotBlank @Pattern(regexp = "GAMING_7994|FASTFOOD_5814|CASH_6011|ADULT_18_PLUS|NIGHT_SPEND|SCHOOL_5812|BOOKS_5942|TRANSPORT_4111|SPORT_5941")
          String categoryCode,
      boolean blocked) {}

  public record Freeze(@NotNull UUID childId, boolean frozen) {}

  public record Limits(
      @NotNull UUID childId,
      @NotNull @DecimalMin("0.00") @Digits(integer = 7, fraction = 2) BigDecimal dailyLimit,
      @NotNull @DecimalMin("0.00") @Digits(integer = 7, fraction = 2) BigDecimal monthlyLimit) {}

  public record Safety(
      @NotNull UUID childId,
      boolean onlinePaymentsAllowed,
      boolean belarusOnly,
      boolean transfersAllowed,
      boolean notificationsEnabled) {}

  public record Privacy(@NotNull UUID childId, boolean privacyMode) {}

  public record ChildId(@NotNull UUID childId) {}

  public record Money(
      @NotNull @DecimalMin("0.01") @Digits(integer = 7, fraction = 2) BigDecimal amount) {}

  public record Transfer(
      @NotNull UUID childId,
      @NotNull @DecimalMin("0.01") @Digits(integer = 7, fraction = 2) BigDecimal amount) {}

  public record Chore(
      @NotNull UUID childId,
      @NotBlank @Size(max = 200) String title,
      @NotNull @DecimalMin("0.00") @Digits(integer = 7, fraction = 2) BigDecimal rewardByn,
      @Min(0) @Max(value = 100, message = "Награда — не более 100 Moby Coins") int rewardCoins) {}

  public record Proof(@Size(max = 500) @Pattern(regexp = "https://[^\\s]+") String photoProofUrl) {}

  public record Piggy(
      @NotNull UUID childId,
      @NotBlank @Size(max = 100) String title,
      @NotNull @DecimalMin("0.01") @Digits(integer = 7, fraction = 2) BigDecimal targetAmount,
      @Min(0) @Max(100) int parentMatchPercent,
      @Size(max = 100) String opponentName) {}

  public record DepositPlan(
      @NotNull UUID childId,
      @NotBlank @Pattern(regexp = "LUMP_SUM_2000|MONTHLY_500_PLUS_50") String planType,
      @NotNull @DecimalMin("0.00") @Digits(integer = 7, fraction = 2) BigDecimal initialAmount,
      @NotNull @DecimalMin("0.00") @Digits(integer = 7, fraction = 2) BigDecimal parent1Monthly,
      @NotNull @DecimalMin("0.00") @Digits(integer = 7, fraction = 2) BigDecimal parent2Monthly) {}

  public record Split(
      @NotNull UUID childId,
      UUID payerChildId,
      @NotBlank @Size(max = 100) String friendName,
      @NotBlank @Size(max = 150) String itemTitle,
      @NotNull @DecimalMin("0.01") @Digits(integer = 7, fraction = 2) BigDecimal shareAmount) {}

  public record QuizAttempt(
      @NotNull UUID childId,
      @NotBlank String quizId,
      @NotNull @Size(min = 1, max = 20) List<@Min(0) @Max(3) Integer> answers,
      Integer score) {}

  public record ShopAction(@NotNull UUID childId) {}

  public record CustomReward(
      @NotBlank @Size(max = 100) String title, @Min(1) @Max(100000) int costCoins) {}

  public record Allowance(
      @NotNull UUID childId,
      @NotNull @DecimalMin("0.01") @Digits(integer = 7, fraction = 2) BigDecimal amount,
      @Min(1) @Max(28) int dayOfMonth,
      boolean active) {}

  public record Card(
      @NotNull UUID childId, @Pattern(regexp = "VIRTUAL|PHYSICAL") @NotNull String cardType) {}

  public record ActionResult(
      UUID id,
      String status,
      BigDecimal amount,
      BigDecimal missingAmount,
      BigDecimal projectedFinalAmount,
      String detail) {
    public static ActionResult of(UUID id, String status, BigDecimal amount) {
      return new ActionResult(id, status, amount, null, null, null);
    }
  }

  public record FamilyView(
      UUID id,
      String familyName,
      BigDecimal parentMainBalance,
      BigDecimal heldBalance,
      BigDecimal availableBalance,
      boolean subscriptionActive,
      BigDecimal subscriptionFee,
      BigDecimal cashbackAccumulated,
      boolean insuranceActive,
      LocalDate nextSubscriptionDate) {}

  public record ChildView(
      UUID id,
      String firstName,
      int age,
      String ageGroup,
      String accountType,
      BigDecimal cardBalance,
      int mobyCoins,
      boolean cardFrozen,
      boolean privacyMode,
      String activeMascotSkin,
      String activePaySound,
      String activeCardSkin,
      BigDecimal dailyLimit,
      BigDecimal monthlyLimit,
      BigDecimal spentToday,
      BigDecimal spentMonth,
      boolean onlinePaymentsAllowed,
      boolean belarusOnly,
      boolean transfersAllowed,
      boolean notificationsEnabled,
      String cardType,
      String cardLastFour) {}

  public record RuleView(UUID id, UUID childId, String categoryCode, boolean blocked) {}

  public record TransactionView(
      UUID id,
      UUID childId,
      String merchantName,
      String mccCategory,
      BigDecimal amount,
      BigDecimal cashbackEarned,
      String paymentMethod,
      boolean secretGiftMode,
      List<ReceiptItem> receiptItems,
      String status,
      Instant createdAt,
      boolean detailsHidden) {}

  public record SosView(
      UUID id,
      UUID childId,
      UUID transactionId,
      String merchantName,
      BigDecimal totalQrAmount,
      BigDecimal missingAmount,
      String status,
      Instant createdAt,
      Instant expiresAt) {}

  public record ChoreView(
      UUID id,
      UUID childId,
      String title,
      BigDecimal rewardByn,
      int rewardCoins,
      String status,
      String photoProofUrl) {}

  public record PiggyView(
      UUID id,
      UUID childId,
      String title,
      BigDecimal targetAmount,
      BigDecimal currentAmount,
      int parentMatchPercent,
      boolean battle,
      String opponentName,
      BigDecimal opponentProgress) {}

  public record DepositView(
      UUID id,
      UUID childId,
      String planType,
      BigDecimal initialDeposit,
      BigDecimal currentBalance,
      BigDecimal bufferBalance,
      BigDecimal parent1Monthly,
      BigDecimal parent2Monthly,
      BigDecimal interestRate,
      LocalDate maturityDate,
      LocalDate nextRolloverDate,
      BigDecimal projectedFinalAmount,
      int consecutiveMonths,
      boolean grantEligible,
      boolean grantPaid,
      String status,
      String giftPath) {}

  public record SplitView(
      UUID id,
      UUID childId,
      UUID payerChildId,
      String friendName,
      String itemTitle,
      BigDecimal shareAmount,
      boolean paid,
      String debtorMemeBadge) {}

  public record ShopView(
      UUID id,
      String itemType,
      String title,
      String assetCode,
      int costCoins,
      String rarity,
      boolean owned) {}

  public record AllowanceView(
      UUID id,
      UUID childId,
      BigDecimal amount,
      int dayOfMonth,
      LocalDate nextPaymentDate,
      boolean active,
      String lastStatus) {}

  public record Question(String prompt, List<String> options) {}

  public record Lesson(
      String id,
      int order,
      String title,
      String explanation,
      List<Question> questions,
      boolean unlocked,
      boolean completed) {}

  public record Academy(
      UUID childId,
      int level,
      int totalLevels,
      int xp,
      int xpToNextLevel,
      int streak,
      List<Lesson> lessons) {}

  public record ChildState(
      ChildView profile,
      List<RuleView> spendingRules,
      List<SosView> sosRequests,
      List<ChoreView> chores,
      List<PiggyView> piggyBanks,
      DepositView capital18,
      List<SplitView> splitBills,
      List<TransactionView> transactions,
      List<ShopView> shop,
      List<AllowanceView> allowances,
      Academy academy) {}

  public record Benefit(String code, String title, String description, BigDecimal coverageByn) {}

  public record QrPreset(
      String id,
      String merchantName,
      String mccCategory,
      BigDecimal amount,
      List<ReceiptItem> receiptItems) {}

  public record FamilyState(
      FamilyView family,
      List<ChildState> children,
      List<Benefit> benefits,
      List<QrPreset> qrPresets,
      Instant serverTime,
      boolean demo) {}

  public record EventView(UUID id, UUID childId, String type, Instant createdAt) {}

  public record GiftInfo(
      String childName, String title, String currency, boolean acceptsGifts, boolean demo) {}

  public record Problem(
      String code, String message, Instant timestamp, Map<String, String> fields) {}
}
