package com.secondhand.backend.dto;

import com.secondhand.backend.entity.Conversation;

import java.time.LocalDateTime;

public class ConversationDTO {

    private Long id;

    private UserChatDTO user1;

    private UserChatDTO user2;

    private LocalDateTime createdAt;

    public ConversationDTO() {
    }

    public ConversationDTO(Conversation conversation) {

        this.id = conversation.getId();

        this.user1 = new UserChatDTO(
                conversation.getUser1()
        );

        this.user2 = new UserChatDTO(
                conversation.getUser2()
        );

        this.createdAt = conversation.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public UserChatDTO getUser1() {
        return user1;
    }

    public UserChatDTO getUser2() {
        return user2;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
