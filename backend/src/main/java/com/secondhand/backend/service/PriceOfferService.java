package com.secondhand.backend.service;

import com.secondhand.backend.dto.CreatePriceOfferDTO;
import com.secondhand.backend.dto.PriceOfferDTO;
import com.secondhand.backend.entity.Conversation;
import com.secondhand.backend.entity.PriceOffer;
import com.secondhand.backend.entity.PriceOfferStatus;
import com.secondhand.backend.entity.Product;
import com.secondhand.backend.entity.Availability;
import com.secondhand.backend.entity.User;
import com.secondhand.backend.repository.ConversationRepository;
import com.secondhand.backend.repository.PriceOfferRepository;
import com.secondhand.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PriceOfferService {

    private final PriceOfferRepository priceOfferRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public PriceOfferService(
            PriceOfferRepository priceOfferRepository,
            ConversationRepository conversationRepository,
            UserRepository userRepository) {
        this.priceOfferRepository = priceOfferRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
    }

    public List<PriceOfferDTO> getOffers(Long conversationId, Long userId) {
        Conversation conversation = getConversation(conversationId);
        validateParticipant(conversation, userId);

        return priceOfferRepository
                .findByConversationOrderByCreatedAtAsc(conversation)
                .stream()
                .map(PriceOfferDTO::new)
                .toList();
    }

    @Transactional
    public PriceOfferDTO createOffer(
            Long conversationId,
            CreatePriceOfferDTO request) {

        if (request == null || request.getSenderId() == null) {
            throw new IllegalArgumentException("El usuario que realiza la oferta es obligatorio");
        }

        BigDecimal amount = request.getAmount();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("La oferta debe ser mayor que 0");
        }

        Conversation conversation = getConversation(conversationId);
        User sender = getUser(request.getSenderId());
        validateParticipant(conversation, sender.getId());

        PriceOfferStatus pendingStatus = PriceOfferStatus.PENDING;

        priceOfferRepository
                .findFirstByConversationAndStatusOrderByCreatedAtDesc(
                        conversation,
                        pendingStatus)
                .ifPresent(pending -> {
                    throw new IllegalStateException(
                            "Ya existe una oferta pendiente. Debes responder a ella antes de realizar otra.");
                });

        User receiver = getOtherParticipant(conversation, sender);
        Product product = conversation.getProduct();

        if (product.getAvailability() == Availability.SOLD) {
            throw new IllegalStateException("El producto ya está vendido y no admite nuevas ofertas");
        }

        if (amount.compareTo(product.getPrice()) > 0) {
            throw new IllegalArgumentException(
                    "La oferta no puede ser superior al precio original del producto");
        }

        PriceOffer offer = new PriceOffer(
                conversation,
                product,
                sender,
                receiver,
                amount
        );

        return new PriceOfferDTO(priceOfferRepository.save(offer));
    }

    @Transactional
    public PriceOfferDTO acceptOffer(Long offerId, Long userId) {
        PriceOffer offer = getOffer(offerId);
        validateParticipant(offer.getConversation(), userId);

        if (!offer.getStatus().equals(PriceOfferStatus.PENDING)) {
            throw new IllegalStateException("Esta oferta ya no está pendiente");
        }

        if (!offer.getReceiver().getId().equals(userId)) {
            throw new IllegalStateException("Solo el destinatario puede aceptar esta oferta");
        }

        Product product = offer.getProduct();

        if (product.getAvailability() == Availability.SOLD) {
            throw new IllegalStateException("El producto ya está vendido");
        }

        offer.setStatus(PriceOfferStatus.ACCEPTED);
        offer.setRespondedAt(LocalDateTime.now());
        product.setAvailability(Availability.SOLD);

        return new PriceOfferDTO(priceOfferRepository.save(offer));
    }

    @Transactional
    public PriceOfferDTO rejectOffer(Long offerId, Long userId) {
        PriceOffer offer = getOffer(offerId);
        validateParticipant(offer.getConversation(), userId);

        if (!offer.getStatus().equals(PriceOfferStatus.PENDING)) {
            throw new IllegalStateException("Esta oferta ya no está pendiente");
        }

        if (!offer.getReceiver().getId().equals(userId)) {
            throw new IllegalStateException("Solo el destinatario puede rechazar esta oferta");
        }

        offer.setStatus(PriceOfferStatus.REJECTED);
        offer.setRespondedAt(LocalDateTime.now());

        return new PriceOfferDTO(priceOfferRepository.save(offer));
    }

    @Transactional
    public PriceOfferDTO counterOffer(
            Long offerId,
            CreatePriceOfferDTO request) {

        if (request == null || request.getSenderId() == null) {
            throw new IllegalArgumentException("El usuario que realiza la contraoferta es obligatorio");
        }

        PriceOffer previousOffer = getOffer(offerId);
        Long senderId = request.getSenderId();

        validateParticipant(previousOffer.getConversation(), senderId);

        if (!previousOffer.getStatus().equals(PriceOfferStatus.PENDING)) {
            throw new IllegalStateException("Solo puedes contraofertar una oferta pendiente");
        }

        if (!previousOffer.getReceiver().getId().equals(senderId)) {
            throw new IllegalStateException("Solo el destinatario puede realizar una contraoferta");
        }

        BigDecimal amount = request.getAmount();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("La contraoferta debe ser mayor que 0");
        }

        if (previousOffer.getProduct().getAvailability() == Availability.SOLD) {
            throw new IllegalStateException("El producto ya está vendido y no admite nuevas ofertas");
        }

        if (amount.compareTo(previousOffer.getProduct().getPrice()) > 0) {
            throw new IllegalArgumentException(
                    "La contraoferta no puede ser superior al precio original del producto");
        }

        User sender = getUser(senderId);
        User receiver = previousOffer.getSender();

        previousOffer.setStatus(PriceOfferStatus.REJECTED);
        previousOffer.setRespondedAt(LocalDateTime.now());
        priceOfferRepository.save(previousOffer);

        PriceOffer newOffer = new PriceOffer(
                previousOffer.getConversation(),
                previousOffer.getProduct(),
                sender,
                receiver,
                amount
        );

        return new PriceOfferDTO(priceOfferRepository.save(newOffer));
    }

    private Conversation getConversation(Long conversationId) {
        return conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));
    }

    private PriceOffer getOffer(Long offerId) {
        return priceOfferRepository
                .findById(offerId)
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada"));
    }

    private User getUser(Long userId) {
        return userRepository
                .findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private void validateParticipant(Conversation conversation, Long userId) {
        if (!conversation.getUser1().getId().equals(userId)
                && !conversation.getUser2().getId().equals(userId)) {
            throw new IllegalStateException(
                    "No tienes permiso para acceder a esta negociación");
        }
    }

    private User getOtherParticipant(Conversation conversation, User sender) {
        if (conversation.getUser1().getId().equals(sender.getId())) {
            return conversation.getUser2();
        }

        return conversation.getUser1();
    }
}
