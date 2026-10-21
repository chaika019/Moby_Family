package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "quiz_completion")
public class QuizCompletion extends BaseEntity {
  @Column(name = "child_id", nullable = false)
  public UUID childId;

  @Column(name = "quiz_id", nullable = false)
  public String quizId;

  @Column(name = "score", nullable = false)
  public int score;

  @Column(name = "completed_at", nullable = false)
  public Instant completedAt;
}
