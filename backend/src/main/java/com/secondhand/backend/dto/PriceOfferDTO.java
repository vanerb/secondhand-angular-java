package com.secondhand.backend.dto;

import com.secondhand.backend.entity.PriceOffer;
import com.secondhand.backend.entity.PriceOfferStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PriceOfferDTO {

    private Long id;
    private Long conversationId;
    private Long productId;
    private UserChatDTO sender;
    private UserChatDTO receiver;
    private BigDecimal amount;
    private BigDecimal originalPrice;
    private PriceOfferStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;

    public PriceOfferDTO() {
    }

    public PriceOfferDTO(PriceOffer offer) {
        this.id = offer.getId();
        this.conversationId = offer.getConversation().getId();
        this.productId = offer.getProduct().getId();
        this.sender = new UserChatDTO(offer.getSender());
        this.receiver = new UserChatDTO(offer.getReceiver());
        this.amount = offer.getAmount();
        this.originalPrice = offer.getProduct().getPrice();
        this.status = offer.getStatus();
        this.createdAt = offer.getCreatedAt();
        this.respondedAt = offer.getRespondedAt();
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

    public UserChatDTO getSender() {
        return sender;
    }

    public UserChatDTO getReceiver() {
        return receiver;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public PriceOfferStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }
}
