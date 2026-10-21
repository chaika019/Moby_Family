package by.chaika19.mobyfamily.api;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;

@Configuration
public class OpenApiConfig {
  @Bean
  OpenAPI openApi() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Moby Kids & Family Backend")
                .version("0.1.0")
                .description(
                    "Демонстрационный семейный кошелёк. Войдите через /auth/login, передавайте JWT"
                        + " как Bearer. Для команд обязателен Idempotency-Key (8–100 символов)."
                        + " Банковский процессинг, проверка документов, страхование и такси не"
                        + " подключены."))
        .components(
            new Components()
                .addSecuritySchemes(
                    "bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")))
        .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
  }
}
