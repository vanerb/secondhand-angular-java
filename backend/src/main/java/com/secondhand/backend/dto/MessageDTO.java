package com.secondhand.backend.dto;

import com.secondhand.backend.entity.Message;

import java.time.LocalDateTime;

public class MessageDTO {

    private Long id;

    private Long conversationId;

    private UserChatDTO sender;

    private String content;

    private LocalDateTime createdAt;

    private boolean read;

    public MessageDTO() {
    }

    public MessageDTO(Message message) {

        this.id = message.getId();

        this.conversationId =
                message.getConversation().getId();

        this.sender =
                new UserChatDTO(message.getSender());

        this.content =
                message.getContent();

        this.createdAt =
                message.getCreatedAt();

        this.read =
                message.isRead();
    }

    public Long getId() {
        return id;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public UserChatDTO getSender() {
        return sender;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isRead() {
        return read;
    }
}
