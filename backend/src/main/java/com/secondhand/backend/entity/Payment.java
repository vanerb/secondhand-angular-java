package com.secondhand.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "conversation_id", nullable = false)
private Conversation conversation;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "product_id", nullable = false)
private Product product;

@OneToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "price_offer_id", nullable = false, unique = true)
private PriceOffer priceOffer;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "buyer_id", nullable = false)
private User buyer;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "seller_id", nullable = false)
private User seller;

@Column(nullable = false, precision = 10, scale = 2)
private BigDecimal amount;

@Enumerated(EnumType.STRING)
@Column(nullable = true)
private PaymentMethod method;

@Enumerated(EnumType.STRING)
@Column(nullable = false)
private PaymentStatus status;

@Column(nullable = false)
private LocalDateTime createdAt;

private LocalDateTime paidAt;

private LocalDateTime cancelledAt;

@Column(length = 4)
private String cardLast4;

public Payment() {
}

public Payment(
        Conversation conversation,
        Product product,
        PriceOffer priceOffer,
        User buyer,
        User seller,
        BigDecimal amount) {

    this.conversation = conversation;
    this.product = product;
    this.priceOffer = priceOffer;
    this.buyer = buyer;
    this.seller = seller;
    this.amount = amount;
    this.method = null;
    this.status = PaymentStatus.PENDING;
    this.createdAt = LocalDateTime.now();
}

public Long getId() {
    return id;
}

public Conversation getConversation() {
    return conversation;
}

public Product getProduct() {
    return product;
}

public PriceOffer getPriceOffer() {
    return priceOffer;
}

public User getBuyer() {
    return buyer;
}

public User getSeller() {
    return seller;
}

public BigDecimal getAmount() {
    return amount;
}

public PaymentMethod getMethod() {
    return method;
}

public void setMethod(PaymentMethod method) {
    this.method = method;
}

public PaymentStatus getStatus() {
    return status;
}

public void setStatus(PaymentStatus status) {
    this.status = status;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}

public LocalDateTime getPaidAt() {
    return paidAt;
}

public void setPaidAt(LocalDateTime paidAt) {
    this.paidAt = paidAt;
}

public LocalDateTime getCancelledAt() {
    return cancelledAt;
}

public void setCancelledAt(LocalDateTime cancelledAt) {
    this.cancelledAt = cancelledAt;
}

public String getCardLast4() {
    return cardLast4;
}

public void setCardLast4(String cardLast4) {
    this.cardLast4 = cardLast4;
}


}
