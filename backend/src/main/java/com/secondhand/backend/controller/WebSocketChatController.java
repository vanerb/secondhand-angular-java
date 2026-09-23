package com.secondhand.backend.controller;

import com.secondhand.backend.dto.ChatMessageDTO;
import com.secondhand.backend.dto.MessageDTO;
import com.secondhand.backend.entity.Conversation;
import com.secondhand.backend.entity.Message;
import com.secondhand.backend.entity.User;
import com.secondhand.backend.repository.ConversationRepository;
import com.secondhand.backend.repository.MessageRepository;
import com.secondhand.backend.repository.UserRepository;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketChatController {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public WebSocketChatController(
            MessageRepository messageRepository,
            ConversationRepository conversationRepository,
            UserRepository userRepository
    ) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/chat")
    public MessageDTO sendMessage(ChatMessageDTO chatMessage) {

        Conversation conversation = conversationRepository
                .findById(chatMessage.getConversationId())
                .orElseThrow(() ->
                        new RuntimeException("Conversación no encontrada")
                );

        User sender = userRepository
                .findById(chatMessage.getSenderId())
                .orElseThrow(() ->
                        new RuntimeException("Usuario no encontrado")
                );

        Message message = new Message(
                conversation,
                sender,
                chatMessage.getContent()
        );

        Message savedMessage = messageRepository.save(message);

        return new MessageDTO(savedMessage);
    }
}