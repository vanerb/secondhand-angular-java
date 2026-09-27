package com.secondhand.backend.repository;

import com.secondhand.backend.entity.Conversation;
import com.secondhand.backend.entity.Product;
import com.secondhand.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository
        extends JpaRepository<Conversation, Long> {

    @Query("""
        SELECT c
        FROM Conversation c
        WHERE (
            (c.user1 = :user1 AND c.user2 = :user2)
            OR
            (c.user1 = :user2 AND c.user2 = :user1)
        )
        AND c.product = :product
    """)
    Optional<Conversation> findConversation(
            @Param("user1") User user1,
            @Param("user2") User user2,
            @Param("product") Product product
    );

    List<Conversation> findByUser1OrUser2(
            User user1,
            User user2
    );
}