package com.secondhand.backend.repository;

import com.secondhand.backend.entity.Payment;
import com.secondhand.backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findFirstByConversationOrderByCreatedAtDesc(
            com.secondhand.backend.entity.Conversation conversation);

    Optional<Payment> findFirstByProductAndStatusInOrderByCreatedAtDesc(
            com.secondhand.backend.entity.Product product,
            List<PaymentStatus> statuses);

    @Modifying
    @Query("DELETE FROM Payment p WHERE p.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
