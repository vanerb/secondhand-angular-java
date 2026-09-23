package com.secondhand.backend.repository;

import com.secondhand.backend.entity.Conversation;
import com.secondhand.backend.entity.Message;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository
        extends JpaRepository<Message, Long> {

    List<Message> findByConversationOrderByCreatedAtAsc(
            Conversation conversation
    );
}
