package com.secondhand.backend.controller;

import com.secondhand.backend.dto.ConversationDTO;
import com.secondhand.backend.dto.MessageDTO;
import com.secondhand.backend.service.ChatService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/conversation")
    public ConversationDTO createConversation(
            @RequestParam Long user1Id,
            @RequestParam Long user2Id
    ) {

        return chatService.getOrCreateConversation(
                user1Id,
                user2Id
        );
    }

    @GetMapping("/conversations/{userId}")
    public List<ConversationDTO> getConversations(
            @PathVariable Long userId
    ) {

        return chatService.getUserConversations(
                userId
        );
    }

    @GetMapping("/conversation/{conversationId}/messages")
    public List<MessageDTO> getMessages(
            @PathVariable Long conversationId
    ) {

        return chatService.getMessages(
                conversationId
        );
    }
}