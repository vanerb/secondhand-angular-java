package com.secondhand.backend.dto;

import java.math.BigDecimal;

public class CreatePriceOfferDTO {

    private Long senderId;
    private BigDecimal amount;

    public CreatePriceOfferDTO() {
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
