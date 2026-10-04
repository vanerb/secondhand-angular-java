import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Container } from '../../general/container/container';
import { AuthService } from '../../../services/auth-service';
import { ChatWebSocketService } from '../../../services/chat-web-socket-service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { getImage } from '../../../services/utilities-service';
import { ChatService, PriceOffer } from '../../../services/chat-service';

@Component({
  selector: 'app-chat',
  imports: [
    Container,
    FormsModule,
    DecimalPipe,
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {

  messages = signal<any[]>([]);
  conversations = signal<any[]>([]);
  offers = signal<PriceOffer[]>([]);

  messageText = '';
  conversationQuery = '';

  selectedConversation = signal<any | null>(null);
  userId = signal<number | null>(null);

  showOfferForm = signal(false);
  offerAmount: number | null = null;
  counterOfferId = signal<number | null>(null);
  counterOfferAmount: number | null = null;

  private messageSubscription?: Subscription;

  constructor(
    private chatWebSocketService: ChatWebSocketService,
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  ngOnInit(): void {
    this.chatWebSocketService.connect();

    this.messageSubscription =
      this.chatWebSocketService.getMessages().subscribe((message) => {
        const conversation = this.selectedConversation();

        if (
          conversation &&
          message.conversationId === conversation.id
        ) {
          this.messages.update((messages) => [
            ...messages,
            message,
          ]);
        }
      });

    const userObservable = this.authService.getUserByToken();

    if (userObservable) {
      userObservable.subscribe({
        next: (user) => {
          this.userId.set(user.id);
          this.loadConversations();
        },
        error: (error) => {
          console.error('Error obteniendo usuario:', error);
        },
      });
    }
  }

  get filteredConversations(): any[] {
    const conversations = this.conversations();
    const query = this.conversationQuery.trim().toLocaleLowerCase('es');

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const user = this.getOtherUser(conversation);

      return `${user.username} ${user.name} ${user.cogname}`
        .toLocaleLowerCase('es')
        .includes(query);
    });
  }

  loadConversations(): void {
    const currentUserId = this.userId();

    if (currentUserId === null) {
      return;
    }

    this.chatService
      .getConversations(currentUserId)
      .subscribe({
        next: (data) => {
          this.conversations.set(data);
        },
        error: (error) => {
          console.error('Error cargando conversaciones:', error);
        },
      });
  }

  getOtherUser(conversation: any): any {
    const currentUserId = this.userId();

    if (conversation.user1?.id === currentUserId) {
      return conversation.user2;
    }

    return conversation.user1;
  }

  openConversation(conversation: any): void {
    this.selectedConversation.set(conversation);
    this.messages.set([]);
    this.offers.set([]);
    this.closeOfferForm();

    this.chatService
      .getMessages(conversation.id)
      .subscribe({
        next: (messages) => {
          this.messages.set(messages);
        },
        error: (error) => {
          console.error('Error cargando mensajes:', error);
        },
      });

    this.loadOffers(conversation.id);
  }

  closeConversation(): void {
    this.selectedConversation.set(null);
    this.messages.set([]);
    this.offers.set([]);
    this.closeOfferForm();
  }

  // ==========================================
  // MENSAJES
  // ==========================================

  enviarMensaje(): void {
    const content = this.messageText.trim();

    if (!content) {
      return;
    }

    const conversation = this.selectedConversation();
    const currentUserId = this.userId();

    if (!conversation || currentUserId === null) {
      return;
    }

    this.chatWebSocketService.sendMessage(
      conversation.id,
      currentUserId,
      content,
    );

    this.messageText = '';
  }

  // ==========================================
  // NEGOCIACIÓN
  // ==========================================

  loadOffers(conversationId: number): void {
    const currentUserId = this.userId();

    if (currentUserId === null) {
      return;
    }

    this.chatService
      .getOffers(conversationId, currentUserId)
      .subscribe({
        next: (offers) => {
          this.offers.set(offers);
        },
        error: (error) => {
          console.error('Error cargando ofertas:', error);
        },
      });
  }

  toggleOfferForm(): void {
    if (this.isProductSold()) {
      return;
    }

    if (this.showOfferForm()) {
      this.closeOfferForm();
      return;
    }

    const conversation = this.selectedConversation();

    if (!conversation) {
      return;
    }

    this.counterOfferId.set(null);
    this.counterOfferAmount = null;
    this.offerAmount = null;
    this.showOfferForm.set(true);
  }

  closeOfferForm(): void {
    this.showOfferForm.set(false);
    this.offerAmount = null;
    this.counterOfferId.set(null);
    this.counterOfferAmount = null;
  }

  enviarOferta(): void {
    const conversation = this.selectedConversation();
    const currentUserId = this.userId();
    const amount = Number(this.offerAmount);

    if (
      !conversation ||
      currentUserId === null ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return;
    }

    if (amount > Number(conversation.productPrice)) {
      window.alert('La oferta no puede ser superior al precio original.');
      return;
    }

    this.chatService
      .createOffer(conversation.id, currentUserId, amount)
      .subscribe({
        next: () => {
          this.closeOfferForm();
          this.loadOffers(conversation.id);
        },
        error: (error) => {
          console.error('Error enviando oferta:', error);
          window.alert(this.getErrorMessage(error, 'No se pudo enviar la oferta.'));
        },
      });
  }

  aceptarOferta(offer: PriceOffer): void {
    const currentUserId = this.userId();

    if (currentUserId === null) {
      return;
    }

    this.chatService
      .acceptOffer(offer.id, currentUserId)
      .subscribe({
        next: () => {
          const conversation = this.selectedConversation();

          if (conversation) {
            this.selectedConversation.set({
              ...conversation,
              productAvailability: 'SOLD',
            });

            this.conversations.update((conversations) =>
              conversations.map((item) =>
                item.productId === conversation.productId
                  ? { ...item, productAvailability: 'SOLD' }
                  : item,
              ),
            );
          }

          this.closeOfferForm();
          this.refreshOffers();
        },
        error: (error) => {
          console.error('Error aceptando oferta:', error);
          window.alert(this.getErrorMessage(error, 'No se pudo aceptar la oferta.'));
        },
      });
  }

  rechazarOferta(offer: PriceOffer): void {
    const currentUserId = this.userId();

    if (currentUserId === null) {
      return;
    }

    this.chatService
      .rejectOffer(offer.id, currentUserId)
      .subscribe({
        next: () => {
          this.refreshOffers();
        },
        error: (error) => {
          console.error('Error rechazando oferta:', error);
          window.alert(this.getErrorMessage(error, 'No se pudo rechazar la oferta.'));
        },
      });
  }

  prepararContraoferta(offer: PriceOffer): void {
    if (this.isProductSold()) {
      return;
    }

    this.showOfferForm.set(false);
    this.counterOfferId.set(offer.id);
    this.counterOfferAmount = null;
  }

  cancelarContraoferta(): void {
    this.counterOfferId.set(null);
    this.counterOfferAmount = null;
  }

  enviarContraoferta(): void {
    if (this.isProductSold()) {
      return;
    }

    const currentUserId = this.userId();
    const offerId = this.counterOfferId();
    const conversation = this.selectedConversation();
    const amount = Number(this.counterOfferAmount);

    if (
      currentUserId === null ||
      offerId === null ||
      !conversation ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return;
    }

    if (amount > Number(conversation.productPrice)) {
      window.alert('La contraoferta no puede ser superior al precio original.');
      return;
    }

    this.chatService
      .counterOffer(offerId, currentUserId, amount)
      .subscribe({
        next: () => {
          this.cancelarContraoferta();
          this.loadOffers(conversation.id);
        },
        error: (error) => {
          console.error('Error enviando contraoferta:', error);
          window.alert(this.getErrorMessage(error, 'No se pudo enviar la contraoferta.'));
        },
      });
  }

  refreshOffers(): void {
    const conversation = this.selectedConversation();

    if (conversation) {
      this.loadOffers(conversation.id);
    }
  }

  isOfferReceiver(offer: PriceOffer): boolean {
    return offer.receiver?.id === this.userId();
  }

  isOfferSender(offer: PriceOffer): boolean {
    return offer.sender?.id === this.userId();
  }

  hasAcceptedOffer(): boolean {
    return this.offers().some((offer) => offer.status === 'ACCEPTED');
  }

  isProductSold(): boolean {
    return this.selectedConversation()?.productAvailability === 'SOLD' || this.hasAcceptedOffer();
  }

  getPendingOffer(): PriceOffer | undefined {
    return [...this.offers()]
      .reverse()
      .find((offer) => offer.status === 'PENDING');
  }

  getOfferStatusText(status: PriceOffer['status']): string {
    switch (status) {
      case 'ACCEPTED':
        return 'Precio acordado';
      case 'REJECTED':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  }

  getErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || error?.error || fallback;
  }

  // ==========================================
  // IMAGEN
  // ==========================================

  getUserImage(
    profileImage: string | null | undefined,
  ): string {
    return getImage(profileImage);
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.chatWebSocketService.disconnect();
  }
}
