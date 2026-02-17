package com.backend.cs203.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cs203.entity.Friendship;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    @Query("""
        SELECT f FROM Friendship f
        WHERE f.status = 'confirmed'
        AND (f.requester = :username OR f.acceptor = :username)
    """)
    
    List<Friendship> findConfirmedFriendships(
            @Param("username") String username
    );
}


