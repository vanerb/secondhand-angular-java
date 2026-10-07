package com.secondhand.backend.service;

import com.secondhand.backend.dto.ConversationDTO;
import com.secondhand.backend.dto.MessageDTO;
import com.secondhand.backend.entity.Conversation;
import com.secondhand.backend.entity.Product;
import com.secondhand.backend.entity.User;
import com.secondhand.backend.repository.ConversationRepository;
import com.secondhand.backend.repository.MessageRepository;
import com.secondhand.backend.repository.ProductRepository;
import com.secondhand.backend.repository.PriceOfferRepository;
import com.secondhand.backend.repository.PaymentRepository;
import com.secondhand.backend.entity.Payment;
import com.secondhand.backend.entity.PaymentStatus;
import com.secondhand.backend.entity.Availability;
import com.secondhand.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PriceOfferRepository priceOfferRepository;
    private final PaymentRepository paymentRepository;

    public ChatService(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            PriceOfferRepository priceOfferRepository,
            PaymentRepository paymentRepository) {

        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.priceOfferRepository = priceOfferRepository;
        this.paymentRepository = paymentRepository;
    }

    // Crear una conversación o devolverla si ya existe
    public ConversationDTO getOrCreateConversation(
            Long user1Id,
            Long user2Id,
            Long productId) {

        if (user1Id.equals(user2Id)) {
            throw new RuntimeException(
                    "No puedes crear una conversación contigo mismo");
        }

        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException(
                        "Usuario no encontrado"));

        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException(
                        "Usuario no encontrado"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException(
                        "Producto no encontrado"));

        Conversation existingConversation = conversationRepository
                .findConversation(user1, user2, product)
                .orElse(null);

        if (existingConversation != null) {
            return new ConversationDTO(existingConversation);
        }

        if (product.isArchived() || product.getAvailability() != Availability.AVAILABLE) {
            throw new IllegalStateException(
                    "No se puede iniciar una nueva conversación sobre un producto que no está disponible");
        }

        Conversation conversation = conversationRepository.save(
                new Conversation(
                        user1,
                        user2,
                        product
                ));

        return new ConversationDTO(conversation);
    }

    // Obtener conversaciones de un usuario
    public List<ConversationDTO> getUserConversations(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Usuario no encontrado"));

        return conversationRepository
                .findByUser1OrUser2(user, user)
                .stream()
                .map(ConversationDTO::new)
                .toList();
    }

    // Obtener mensajes
    public List<MessageDTO> getMessages(Long conversationId) {

        Conversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new RuntimeException(
                        "Conversación no encontrada"));

        return messageRepository
                .findByConversationOrderByCreatedAtAsc(conversation)
                .stream()
                .map(MessageDTO::new)
                .toList();
    }

    // Eliminar conversación y sus mensajes
    @Transactional
    public void deleteConversation(Long conversationId) {

        Conversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new RuntimeException(
                        "Conversación no encontrada"));

        messageRepository.deleteByConversation(conversation);

        Payment payment = paymentRepository
                .findFirstByConversationOrderByCreatedAtDesc(conversation)
                .orElse(null);

        if (payment != null && payment.getStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException(
                    "No se puede eliminar una conversación de una venta completada");
        }

        if (payment != null) {
            payment.getProduct().setAvailability(Availability.AVAILABLE);
            payment.getProduct().setArchived(false);
            paymentRepository.delete(payment);
        }

        priceOfferRepository.deleteByConversation(conversation);

        conversationRepository.delete(conversation);
    }
}