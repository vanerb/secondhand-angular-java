package com.secondhand.backend.dto;

import com.secondhand.backend.entity.Payment;
import com.secondhand.backend.entity.PaymentMethod;
import com.secondhand.backend.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDTO {

    private Long id;
    private Long conversationId;
    private Long productId;
    private Long offerId;
    private Long buyerId;
    private Long sellerId;
    private String buyerUsername;
    private String sellerUsername;
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime cancelledAt;
    private String cardLast4;

    public PaymentDTO() {
    }

    public PaymentDTO(Payment payment) {
        this.id = payment.getId();
        this.conversationId = payment.getConversation().getId();
        this.productId = payment.getProduct().getId();
        this.offerId = payment.getPriceOffer().getId();
        this.buyerId = payment.getBuyer().getId();
        this.sellerId = payment.getSeller().getId();
        this.buyerUsername = payment.getBuyer().getUsername();
        this.sellerUsername = payment.getSeller().getUsername();
        this.amount = payment.getAmount();
        this.method = payment.getMethod();
        this.status = payment.getStatus();
        this.createdAt = payment.getCreatedAt();
        this.paidAt = payment.getPaidAt();
        this.cancelledAt = payment.getCancelledAt();
        this.cardLast4 = payment.getCardLast4();
    }

    public Long getId() {
        return id;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public Long getProductId() {
        return productId;
    }

    public Long getOfferId() {
        return offerId;
    }

    public Long getBuyerId() {
        return buyerId;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public String getBuyerUsername() {
        return buyerUsername;
    }

    public String getSellerUsername() {
        return sellerUsername;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public String getCardLast4() {
        return cardLast4;
    }
}
