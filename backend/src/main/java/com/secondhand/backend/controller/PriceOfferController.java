package com.secondhand.backend.controller;

import com.secondhand.backend.dto.CreatePriceOfferDTO;
import com.secondhand.backend.dto.PriceOfferDTO;
import com.secondhand.backend.service.PriceOfferService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class PriceOfferController {

    private final PriceOfferService priceOfferService;

    public PriceOfferController(PriceOfferService priceOfferService) {
        this.priceOfferService = priceOfferService;
    }

    @GetMapping("/conversation/{conversationId}/offers")
    public List<PriceOfferDTO> getOffers(
            @PathVariable Long conversationId,
            @RequestParam Long userId) {

        return priceOfferService.getOffers(conversationId, userId);
    }

    @PostMapping("/conversation/{conversationId}/offers")
    public PriceOfferDTO createOffer(
            @PathVariable Long conversationId,
            @RequestBody CreatePriceOfferDTO request) {

        return priceOfferService.createOffer(conversationId, request);
    }

    @PostMapping("/offers/{offerId}/accept")
    public PriceOfferDTO acceptOffer(
            @PathVariable Long offerId,
            @RequestParam Long userId) {

        return priceOfferService.acceptOffer(offerId, userId);
    }

    @PostMapping("/offers/{offerId}/reject")
    public PriceOfferDTO rejectOffer(
            @PathVariable Long offerId,
            @RequestParam Long userId) {

        return priceOfferService.rejectOffer(offerId, userId);
    }

    @PostMapping("/offers/{offerId}/counter")
    public PriceOfferDTO counterOffer(
            @PathVariable Long offerId,
            @RequestBody CreatePriceOfferDTO request) {

        return priceOfferService.counterOffer(offerId, request);
    }
}
