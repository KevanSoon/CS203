package com.backend.cs203.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cs203.entity.Friendship;
import com.backend.cs203.entity.FriendshipId;
import com.backend.cs203.entity.FriendshipStatus;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, FriendshipId> {

    @Query("""
        SELECT f FROM Friendship f
        WHERE f.status = :status
        AND (f.user1.id = :userId OR f.user2.id = :userId)
    """)
    List<Friendship> findFriendshipsByUserId(
            @Param("userId") Integer userId,
            @Param("status") FriendshipStatus status
    );

    @Query("""
        SELECT f FROM Friendship f
        WHERE 
        (f.user1.id = :user1 AND f.user2.id = :user2)
        OR
        (f.user1.id = :user2 AND f.user2.id = :user1)
    """)
    Optional<Friendship> findExistingFriendship(
            @Param("user1") Integer user1,
            @Param("user2") Integer user2
    );

    boolean existsByUser1IdAndUser2Id(Integer user1Id, Integer user2Id);
}


