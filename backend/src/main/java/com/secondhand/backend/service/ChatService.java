package com.secondhand.backend.service;

import com.secondhand.backend.dto.ConversationDTO;
import com.secondhand.backend.dto.MessageDTO;
import com.secondhand.backend.entity.Conversation;
import com.secondhand.backend.entity.User;
import com.secondhand.backend.repository.ConversationRepository;
import com.secondhand.backend.repository.MessageRepository;
import com.secondhand.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ChatService(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            UserRepository userRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    // Crear una conversación o devolverla si ya existe
    public ConversationDTO getOrCreateConversation(
            Long user1Id,
            Long user2Id
    ) {

        if (user1Id.equals(user2Id)) {
            throw new RuntimeException(
                    "No puedes crear una conversación contigo mismo"
            );
        }

        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Usuario no encontrado"
                        )
                );

        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Usuario no encontrado"
                        )
                );

        Conversation conversation =
                conversationRepository
                        .findConversation(user1, user2)
                        .orElseGet(() ->
                                conversationRepository.save(
                                        new Conversation(
                                                user1,
                                                user2
                                        )
                                )
                        );

        return new ConversationDTO(conversation);
    }

    // Obtener conversaciones de un usuario
    public List<ConversationDTO> getUserConversations(
            Long userId
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Usuario no encontrado"
                        )
                );

        return conversationRepository
                .findByUser1OrUser2(user, user)
                .stream()
                .map(ConversationDTO::new)
                .toList();
    }

    // Obtener mensajes
    public List<MessageDTO> getMessages(
            Long conversationId
    ) {

        Conversation conversation =
                conversationRepository
                        .findById(conversationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Conversación no encontrada"
                                )
                        );

        return messageRepository
                .findByConversationOrderByCreatedAtAsc(
                        conversation
                )
                .stream()
                .map(MessageDTO::new)
                .toList();
    }
}