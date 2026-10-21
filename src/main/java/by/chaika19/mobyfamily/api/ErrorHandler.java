package by.chaika19.mobyfamily.api;

import java.time.Instant;
import java.util.*;
import org.springframework.dao.*;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ErrorHandler {
  @ExceptionHandler(ApiException.class)
  ResponseEntity<Api.Problem> domain(ApiException e) {
    return ResponseEntity.status(e.status)
        .body(new Api.Problem(e.code, e.getMessage(), Instant.now(), Map.of()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<Api.Problem> validation(MethodArgumentNotValidException e) {
    Map<String, String> fields = new TreeMap<>();
    e.getBindingResult()
        .getFieldErrors()
        .forEach(f -> fields.put(f.getField(), f.getDefaultMessage()));
    return ResponseEntity.badRequest()
        .body(new Api.Problem("VALIDATION_ERROR", "Проверьте поля запроса", Instant.now(), fields));
  }

  @ExceptionHandler({
    HttpMessageNotReadableException.class,
    org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
    org.springframework.web.bind.MissingRequestHeaderException.class,
    org.springframework.web.method.annotation.HandlerMethodValidationException.class
  })
  ResponseEntity<Api.Problem> invalid(Exception e) {
    return ResponseEntity.badRequest()
        .body(
            new Api.Problem(
                "INVALID_REQUEST",
                "Некорректный JSON, параметр или обязательный заголовок",
                Instant.now(),
                Map.of()));
  }

  @ExceptionHandler({DataIntegrityViolationException.class, ConcurrencyFailureException.class})
  ResponseEntity<Api.Problem> conflict(Exception e) {
    return ResponseEntity.status(409)
        .body(
            new Api.Problem(
                "CONCURRENT_CHANGE",
                "Состояние изменилось; повторите запрос",
                Instant.now(),
                Map.of()));
  }
}
