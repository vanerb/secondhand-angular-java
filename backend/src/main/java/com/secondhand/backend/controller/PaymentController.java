package com.secondhand.backend.controller;

import com.secondhand.backend.dto.CompletePaymentDTO;
import com.secondhand.backend.dto.PaymentDTO;
import com.secondhand.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:4200")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<PaymentDTO> getPayment(
            @PathVariable Long conversationId,
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                paymentService.getPayment(conversationId, userId));
    }

    @PostMapping("/{paymentId}/pay")
    public ResponseEntity<PaymentDTO> completePayment(
            @PathVariable Long paymentId,
            @RequestParam Long userId,
            @RequestBody CompletePaymentDTO request) {

        return ResponseEntity.ok(
                paymentService.completePayment(
                        paymentId,
                        userId,
                        request));
    }

    @PostMapping("/{paymentId}/confirm-cash")
    public ResponseEntity<PaymentDTO> confirmCashPayment(
            @PathVariable Long paymentId,
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                paymentService.confirmCashPayment(
                        paymentId,
                        userId));
    }

    @PostMapping("/{paymentId}/cancel")
    public ResponseEntity<PaymentDTO> cancelPayment(
            @PathVariable Long paymentId,
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                paymentService.cancelPayment(
                        paymentId,
                        userId));
    }
}
