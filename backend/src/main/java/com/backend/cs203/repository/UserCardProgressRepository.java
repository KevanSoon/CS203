package com.backend.cs203.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cs203.entity.UserCardProgress;
import com.backend.cs203.entity.UserCardProgressId;

@Repository
public interface UserCardProgressRepository extends JpaRepository<UserCardProgress, UserCardProgressId> {

    /** Count completed cards for a user in a specific chapter */
    @Query(value = "SELECT COUNT(*) FROM user_card_progress ucp " +
                   "JOIN card c ON c.id = ucp.card_id " +
                   "WHERE ucp.user_id = :userId AND c.chapter_id = :chapterId",
           nativeQuery = true)
    int countByUserIdAndChapterId(@Param("userId") Integer userId,
                                  @Param("chapterId") Integer chapterId);

    /**
     * Batch: count completed cards per chapter for a user across ALL chapters.
     * Returns rows of [chapter_id, count].
     */
    @Query(value = "SELECT c.chapter_id, COUNT(*) " +
                   "FROM user_card_progress ucp " +
                   "JOIN card c ON c.id = ucp.card_id " +
                   "WHERE ucp.user_id = :userId " +
                   "GROUP BY c.chapter_id",
           nativeQuery = true)
    List<Object[]> countCompletedCardsGroupedByChapter(@Param("userId") Integer userId);

    /** Get all completed card IDs for a user in a specific chapter */
    @Query(value = "SELECT ucp.card_id FROM user_card_progress ucp " +
                   "JOIN card c ON c.id = ucp.card_id " +
                   "WHERE ucp.user_id = :userId AND c.chapter_id = :chapterId",
           nativeQuery = true)
    List<Integer> findCompletedCardIdsByUserIdAndChapterId(@Param("userId") Integer userId,
                                                           @Param("chapterId") Integer chapterId);

    boolean existsByUserIdAndCardId(Integer userId, Integer cardId);

    /**
     * Insert a card progress row, silently ignoring duplicates.
     * Uses INSERT IGNORE so re-completing a card is a no-op.
     * clearAutomatically evicts stale L1 cache after the native INSERT
     * so subsequent queries don't trigger a conflicting flush.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "INSERT IGNORE INTO user_card_progress (user_id, card_id, completed_at) " +
                   "VALUES (:userId, :cardId, NOW())",
           nativeQuery = true)
    void insertIgnore(@Param("userId") Integer userId,
                      @Param("cardId") Integer cardId);
}
