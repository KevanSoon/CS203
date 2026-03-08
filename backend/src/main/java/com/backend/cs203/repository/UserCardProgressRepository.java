package com.backend.cs203.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
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

    /** Get all completed card IDs for a user in a specific chapter */
    @Query(value = "SELECT ucp.card_id FROM user_card_progress ucp " +
                   "JOIN card c ON c.id = ucp.card_id " +
                   "WHERE ucp.user_id = :userId AND c.chapter_id = :chapterId",
           nativeQuery = true)
    List<Integer> findCompletedCardIdsByUserIdAndChapterId(@Param("userId") Integer userId,
                                                           @Param("chapterId") Integer chapterId);

    boolean existsByUserIdAndCardId(Integer userId, Integer cardId);
}
