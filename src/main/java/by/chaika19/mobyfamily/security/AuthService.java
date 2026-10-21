package by.chaika19.mobyfamily.security;

import by.chaika19.mobyfamily.api.*;
import by.chaika19.mobyfamily.domain.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
  private final Store db;
  private final PasswordEncoder passwords;
  private final JwtEncoder encoder;
  private final Clock clock;
  private final Duration ttl;

  public AuthService(
      Store db,
      PasswordEncoder passwords,
      JwtEncoder encoder,
      Clock clock,
      @Value("${app.jwt.ttl}") Duration ttl) {
    this.db = db;
    this.passwords = passwords;
    this.encoder = encoder;
    this.clock = clock;
    this.ttl = ttl;
  }

  public Actor actor() {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (!(principal instanceof Jwt jwt)) throw ApiException.forbidden();
    AppUser u = db.get(AppUser.class, UUID.fromString(jwt.getSubject()));
    if (u == null) throw ApiException.forbidden();
    return new Actor(u.id, u.familyId, u.childId, u.role);
  }

  public Api.Token register(Api.Register req) {
    if (req.password().getBytes(StandardCharsets.UTF_8).length > 72)
      throw ApiException.bad("PASSWORD_LENGTH", "Пароль должен занимать не более 72 байт UTF-8");
    String email = req.email().toLowerCase(Locale.ROOT).trim();
    if (db.first(AppUser.class, "e.email=?1", email).isPresent())
      throw ApiException.conflict("EMAIL_EXISTS", "Этот email уже зарегистрирован");
    var family = new FamilyAccount();
    family.familyName = req.familyName().trim();
    family.parentMainBalance = new BigDecimal("0.00");
    family.heldBalance = new BigDecimal("0.00");
    family.cashbackAccumulated = new BigDecimal("0.00");
    family.subscriptionActive = false;
    family.subscriptionFee = new BigDecimal("6.99");
    family.insuranceActive = false;
    family.nextSubscriptionDate = LocalDate.now(clock).plusMonths(1);
    db.save(family);
    var u = new AppUser();
    u.familyId = family.id;
    u.email = email;
    u.passwordHash = passwords.encode(req.password());
    u.role = "PARENT";
    db.save(u);
    return token(u);
  }

  public Api.Token login(Api.Login req) {
    if (req.password().getBytes(StandardCharsets.UTF_8).length > 72)
      throw new ApiException(
          HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Неверный email или пароль");
    var u =
        db.first(AppUser.class, "e.email=?1", req.email().toLowerCase(Locale.ROOT).trim())
            .orElse(null);
    // Run BCrypt even for an unknown account to avoid an obvious timing oracle.
    String hash =
        u == null ? "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy" : u.passwordHash;
    boolean valid = passwords.matches(req.password(), hash);
    if (u == null || !valid)
      throw new ApiException(
          HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Неверный email или пароль");
    return token(u);
  }

  public Api.Token qrLogin(Api.QrLogin req) {
    var found =
        db.first(QrLoginToken.class, "e.tokenHash=?1", hash(req.qrAuthToken()))
            .orElseThrow(
                () -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_QR", "QR недействителен"));
    db.lock(FamilyAccount.class, db.get(ChildProfile.class, found.childId).familyId);
    var qr = db.lock(QrLoginToken.class, found.id);
    if (qr.used || !qr.expiresAt.isAfter(clock.instant()))
      throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_QR", "QR истёк или уже использован");
    qr.used = true;
    return token(db.first(AppUser.class, "e.childId=?1", qr.childId).orElseThrow());
  }

  public Api.Onboarded loginQr(ChildProfile child) {
    db.find(QrLoginToken.class, "e.childId=?1 and e.used=false", child.id)
        .forEach(q -> q.used = true);
    byte[] bytes = new byte[32];
    new SecureRandom().nextBytes(bytes);
    String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    var q = new QrLoginToken();
    q.childId = child.id;
    q.tokenHash = hash(raw);
    q.expiresAt = clock.instant().plus(Duration.ofMinutes(5));
    q.used = false;
    db.save(q);
    return new Api.Onboarded(child.id, raw, q.expiresAt, accountType(child));
  }

  public Api.Token token(AppUser u) {
    Instant now = clock.instant(), expires = now.plus(ttl);
    var claims =
        JwtClaimsSet.builder()
            .issuer("moby-backend")
            .subject(u.id.toString())
            .issuedAt(now)
            .expiresAt(expires)
            .claim("role", u.role)
            .claim("familyId", u.familyId.toString());
    if (u.childId != null) claims.claim("childId", u.childId.toString());
    String jwt =
        encoder
            .encode(
                JwtEncoderParameters.from(
                    JwsHeader.with(MacAlgorithm.HS256).build(), claims.build()))
            .getTokenValue();
    return new Api.Token(jwt, "Bearer", expires, u.role, u.familyId, u.childId);
  }

  public static String hash(String text) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }

  public static String accountType(ChildProfile child) {
    return Period.between(child.birthDate, LocalDate.now()).getYears() < 14
        ? "PARENT_SUBACCOUNT"
        : "PERSONAL_ACCOUNT";
  }
}
