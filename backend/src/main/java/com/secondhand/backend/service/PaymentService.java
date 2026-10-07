package com.secondhand.backend.service;

import com.secondhand.backend.dto.CompletePaymentDTO;
import com.secondhand.backend.dto.PaymentDTO;
import com.secondhand.backend.entity.*;
import com.secondhand.backend.repository.PaymentRepository;
import com.secondhand.backend.repository.ConversationRepository;
import com.secondhand.backend.repository.PriceOfferRepository;
import com.secondhand.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PriceOfferRepository priceOfferRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            PriceOfferRepository priceOfferRepository,
            UserRepository userRepository,
            ConversationRepository conversationRepository) {
        this.paymentRepository = paymentRepository;
        this.priceOfferRepository = priceOfferRepository;
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
    }

    public PaymentDTO getPayment(Long conversationId, Long userId) {
        Payment payment = paymentRepository
                .findFirstByConversationOrderByCreatedAtDesc(
                        getConversation(conversationId))
                .orElse(null);

        if (payment == null) {
            return null;
        }

        validateParticipant(payment.getConversation(), userId);
        return new PaymentDTO(payment);
    }

    @Transactional
    public PaymentDTO createFromAcceptedOffer(PriceOffer offer) {
        Payment existing = paymentRepository
                .findFirstByProductAndStatusInOrderByCreatedAtDesc(
                        offer.getProduct(),
                        List.of(
                                PaymentStatus.PENDING,
                                PaymentStatus.CASH_AWAITING_CONFIRMATION))
                .orElse(null);

        if (existing != null) {
            return new PaymentDTO(existing);
        }

        Product product = offer.getProduct();
        User seller = product.getUser();

        User buyer;
        if (offer.getSender().getId().equals(seller.getId())) {
            buyer = offer.getReceiver();
        } else {
            buyer = offer.getSender();
        }

        if (!offer.getConversation().getUser1().getId().equals(buyer.getId())
                && !offer.getConversation().getUser2().getId().equals(buyer.getId())) {
            throw new IllegalStateException("El comprador no pertenece a la conversación");
        }

        Payment payment = new Payment(
                offer.getConversation(),
                product,
                offer,
                buyer,
                seller,
                offer.getAmount());

        return new PaymentDTO(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentDTO completePayment(
            Long paymentId,
            Long userId,
            CompletePaymentDTO request) {

        Payment payment = getPaymentEntity(paymentId);
        validateParticipant(payment.getConversation(), userId);

        if (!payment.getBuyer().getId().equals(userId)) {
            throw new IllegalStateException(
                    "Solo el comprador puede iniciar el pago");
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException(
                    "Este pago ya no está pendiente");
        }

        if (request == null || request.getMethod() == null) {
            throw new IllegalArgumentException(
                    "Debes seleccionar un método de pago");
        }

        if (request.getMethod() == PaymentMethod.CARD) {
            String last4 = request.getCardLast4();

            if (last4 == null || !last4.matches("\\d{4}")) {
                throw new IllegalArgumentException(
                        "Los datos de la tarjeta no son válidos");
            }

            payment.setMethod(PaymentMethod.CARD);
            payment.setCardLast4(last4);
            markAsPaid(payment);

        } else {
            payment.setMethod(PaymentMethod.CASH);
            payment.setStatus(PaymentStatus.CASH_AWAITING_CONFIRMATION);
        }

        return new PaymentDTO(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentDTO confirmCashPayment(Long paymentId, Long userId) {
        Payment payment = getPaymentEntity(paymentId);
        validateParticipant(payment.getConversation(), userId);

        if (!payment.getSeller().getId().equals(userId)) {
            throw new IllegalStateException(
                    "Solo el vendedor puede confirmar que ha recibido el efectivo");
        }

        if (payment.getStatus() != PaymentStatus.CASH_AWAITING_CONFIRMATION) {
            throw new IllegalStateException(
                    "El pago en efectivo no está pendiente de confirmación");
        }

        markAsPaid(payment);

        return new PaymentDTO(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentDTO cancelPayment(Long paymentId, Long userId) {
        Payment payment = getPaymentEntity(paymentId);
        validateParticipant(payment.getConversation(), userId);

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException(
                    "Una venta ya pagada no se puede cancelar desde aquí");
        }

        if (payment.getStatus() == PaymentStatus.CANCELLED) {
            return new PaymentDTO(payment);
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setCancelledAt(LocalDateTime.now());

        Product product = payment.getProduct();
        product.setAvailability(Availability.AVAILABLE);
        product.setArchived(false);

        PriceOffer offer = payment.getPriceOffer();
        if (offer.getStatus() == PriceOfferStatus.ACCEPTED) {
            offer.setStatus(PriceOfferStatus.CANCELLED);
            offer.setRespondedAt(LocalDateTime.now());
            priceOfferRepository.save(offer);
        }

        return new PaymentDTO(paymentRepository.save(payment));
    }

    private void markAsPaid(Payment payment) {
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());

        Product product = payment.getProduct();
        product.setAvailability(Availability.SOLD);
        product.setArchived(true);
    }

    private Payment getPaymentEntity(Long paymentId) {
        return paymentRepository
                .findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
    }

    private com.secondhand.backend.entity.Conversation getConversation(Long conversationId) {
        return conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new RuntimeException(
                        "Conversación no encontrada"));
    }

    private void validateParticipant(
            com.secondhand.backend.entity.Conversation conversation,
            Long userId) {

        if (!conversation.getUser1().getId().equals(userId)
                && !conversation.getUser2().getId().equals(userId)) {
            throw new IllegalStateException(
                    "No tienes permiso para acceder a esta operación");
        }
    }
}
