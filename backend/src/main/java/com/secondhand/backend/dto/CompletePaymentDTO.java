package com.secondhand.backend.dto;

import com.secondhand.backend.entity.PaymentMethod;

public class CompletePaymentDTO {

    private PaymentMethod method;
    private String cardLast4;

    public CompletePaymentDTO() {
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public String getCardLast4() {
        return cardLast4;
    }

    public void setCardLast4(String cardLast4) {
        this.cardLast4 = cardLast4;
    }
}
