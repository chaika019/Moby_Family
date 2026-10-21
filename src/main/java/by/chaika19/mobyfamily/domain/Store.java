package by.chaika19.mobyfamily.domain;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.stereotype.Repository;

/**
 * Persistence stays inside the application transactions. Family row locks serialize money changes.
 */
@Repository
public class Store {
  private final EntityManager em;

  public Store(EntityManager em) {
    this.em = em;
  }

  public <T> T get(Class<T> type, UUID id) {
    return em.find(type, id);
  }

  public <T> T lock(Class<T> type, UUID id) {
    return em.find(type, id, LockModeType.PESSIMISTIC_WRITE);
  }

  public <T> T save(T entity) {
    em.persist(entity);
    return entity;
  }

  public void remove(Object entity) {
    em.remove(entity);
  }

  public <T> List<T> all(Class<T> type) {
    return find(type, "1=1");
  }

  public <T> List<T> find(Class<T> type, String where, Object... args) {
    var q = em.createQuery("select e from " + type.getSimpleName() + " e where " + where, type);
    for (int i = 0; i < args.length; i++) q.setParameter(i + 1, args[i]);
    return q.getResultList();
  }

  public <T> List<T> page(
      Class<T> type, String where, String orderBy, int offset, int limit, Object... args) {
    var q =
        em.createQuery(
            "select e from " + type.getSimpleName() + " e where " + where + " order by " + orderBy,
            type);
    for (int i = 0; i < args.length; i++) q.setParameter(i + 1, args[i]);
    return q.setFirstResult(offset).setMaxResults(limit).getResultList();
  }

  public <T> Optional<T> first(Class<T> type, String where, Object... args) {
    return find(type, where, args).stream().findFirst();
  }
}
