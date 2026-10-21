package by.chaika19.mobyfamily.api;

import by.chaika19.mobyfamily.security.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final AuthService auth;

  public AuthController(AuthService auth) {
    this.auth = auth;
  }

  @PostMapping("/register")
  Api.Token register(@Valid @RequestBody Api.Register req) {
    return auth.register(req);
  }

  @PostMapping("/login")
  Api.Token login(@Valid @RequestBody Api.Login req) {
    return auth.login(req);
  }

  @PostMapping("/qr-login")
  Api.Token qrLogin(@Valid @RequestBody Api.QrLogin req) {
    return auth.qrLogin(req);
  }
}
