package com.secondhand.backend.repository;

import com.secondhand.backend.entity.Conversation;
import com.secondhand.backend.entity.PriceOffer;
import com.secondhand.backend.entity.PriceOfferStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PriceOfferRepository extends JpaRepository<PriceOffer, Long> {

    List<PriceOffer> findByConversationOrderByCreatedAtAsc(Conversation conversation);

    Optional<PriceOffer> findFirstByConversationAndStatusOrderByCreatedAtDesc(
            Conversation conversation,
            PriceOfferStatus status
    );

    void deleteByConversation(Conversation conversation);

    @Modifying @Query("DELETE FROM PriceOffer p WHERE p.product.id = :productId") void deleteByProductId(@Param("productId") Long productId);
}
