package by.chaika19.mobyfamily;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@org.springframework.scheduling.annotation.EnableScheduling
@SpringBootApplication
public class MobyBackendApplication {

  public static void main(String[] args) {
    SpringApplication.run(MobyBackendApplication.class, args);
  }
}
