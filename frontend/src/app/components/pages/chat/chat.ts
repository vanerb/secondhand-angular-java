import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Container } from '../../general/container/container';
import { AuthService } from '../../../services/auth-service';
import { ChatWebSocketService } from '../../../services/chat-web-socket-service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { getImage } from '../../../services/utilities-service';
import { ChatService, Payment, PriceOffer } from '../../../services/chat-service';

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
  payment = signal<Payment | null>(null);
  paymentMethod = signal<'CARD' | 'CASH' | null>(null);

  cardNumber = '';
  cardHolder = '';
  cardExpiry = '';
  cardCvv = '';
  paymentProcessing = signal(false);

  messageText = '';
  conversationQuery = '';

  selectedConversation = signal<any | null>(null);
  userId = signal<number | null>(null);

  showOfferForm = signal(false);
  offerAmount: number | null = null;
  counterOfferId = signal<number | null>(null);
  counterOfferAmount: number | null = null;

  private messageSubscription?: Subscription;
  private paymentRefreshTimer?: ReturnType<typeof setInterval>;

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
    this.payment.set(null);
    this.paymentMethod.set(null);
    this.resetCardForm();
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
    this.loadPayment(conversation.id);
    this.startPaymentPolling();
  }

  closeConversation(): void {
    this.stopPaymentPolling();
    this.selectedConversation.set(null);
    this.messages.set([]);
    this.offers.set([]);
    this.payment.set(null);
    this.paymentMethod.set(null);
    this.resetCardForm();
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
              productAvailability: 'RESERVED',
            });

            this.conversations.update((conversations) =>
              conversations.map((item) =>
                item.productId === conversation.productId
                  ? { ...item, productAvailability: 'RESERVED' }
                  : item,
              ),
            );

            this.loadPayment(conversation.id);
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
    return this.selectedConversation()?.productAvailability === 'SOLD';
  }

  isProductReserved(): boolean {
    return this.selectedConversation()?.productAvailability === 'RESERVED'
      || this.payment()?.status === 'PENDING'
      || this.payment()?.status === 'CASH_AWAITING_CONFIRMATION';
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


  // ==========================================
  // PAGO
  // ==========================================


  startPaymentPolling(): void {
    this.stopPaymentPolling();

    this.paymentRefreshTimer = setInterval(() => {
      const conversation = this.selectedConversation();

      if (!conversation) {
        this.stopPaymentPolling();
        return;
      }

      const currentPayment = this.payment();

      if (currentPayment?.status === 'PAID') {
        this.stopPaymentPolling();
        return;
      }

      this.loadPayment(conversation.id);
    }, 4000);
  }

  stopPaymentPolling(): void {
    if (this.paymentRefreshTimer) {
      clearInterval(this.paymentRefreshTimer);
      this.paymentRefreshTimer = undefined;
    }
  }

  loadPayment(conversationId: number): void {
    const currentUserId = this.userId();

    if (currentUserId === null) {
      return;
    }

    this.chatService.getPayment(conversationId, currentUserId).subscribe({
      next: (payment) => {
        this.payment.set(
          payment?.status === 'CANCELLED' ? null : payment,
        );

        if (!payment || payment.status === 'CANCELLED') {
          this.paymentMethod.set(null);
        }
      },
      error: (error) => {
        console.error('Error cargando el pago:', error);
        this.payment.set(null);
      },
    });
  }

  selectPaymentMethod(method: 'CARD' | 'CASH'): void {
    const payment = this.payment();

    if (!payment || payment.status !== 'PENDING') {
      return;
    }

    this.paymentMethod.set(method);
  }

  isPaymentBuyer(): boolean {
    return this.payment()?.buyerId === this.userId();
  }

  isPaymentSeller(): boolean {
    return this.payment()?.sellerId === this.userId();
  }

  pay(): void {
    const payment = this.payment();
    const currentUserId = this.userId();
    const method = this.paymentMethod();

    if (
      !payment ||
      currentUserId === null ||
      method === null ||
      payment.status !== 'PENDING' ||
      !this.isPaymentBuyer()
    ) {
      return;
    }

    if (method === 'CARD') {
      const cardNumber = this.cardNumber.replace(/\s/g, '');

      if (
        !/^\d{16}$/.test(cardNumber) ||
        !/^\d{2}\/\d{2}$/.test(this.cardExpiry) ||
        !/^\d{3,4}$/.test(this.cardCvv) ||
        this.cardHolder.trim().length < 2
      ) {
        window.alert('Revisa los datos de la tarjeta.');
        return;
      }

      this.paymentProcessing.set(true);

      this.chatService
        .completePayment(
          payment.id,
          currentUserId,
          'CARD',
          cardNumber.slice(-4),
        )
        .subscribe({
          next: (updatedPayment) => {
            this.paymentProcessing.set(false);
            this.payment.set(updatedPayment);
            this.markConversationAsSold();
            this.resetCardForm();
          },
          error: (error) => {
            this.paymentProcessing.set(false);
            window.alert(
              this.getErrorMessage(error, 'No se pudo completar el pago.'),
            );
          },
        });

      return;
    }

    this.paymentProcessing.set(true);

    this.chatService
      .completePayment(payment.id, currentUserId, 'CASH')
      .subscribe({
        next: (updatedPayment) => {
          this.paymentProcessing.set(false);
          this.payment.set(updatedPayment);
        },
        error: (error) => {
          this.paymentProcessing.set(false);
          window.alert(
            this.getErrorMessage(
              error,
              'No se pudo registrar el pago en efectivo.',
            ),
          );
        },
      });
  }

  confirmarPagoEnEfectivo(): void {
    const payment = this.payment();
    const currentUserId = this.userId();

    if (
      !payment ||
      currentUserId === null ||
      payment.status !== 'CASH_AWAITING_CONFIRMATION' ||
      !this.isPaymentSeller()
    ) {
      return;
    }

    this.paymentProcessing.set(true);

    this.chatService
      .confirmCashPayment(payment.id, currentUserId)
      .subscribe({
        next: (updatedPayment) => {
          this.paymentProcessing.set(false);
          this.payment.set(updatedPayment);
          this.markConversationAsSold();
        },
        error: (error) => {
          this.paymentProcessing.set(false);
          window.alert(
            this.getErrorMessage(
              error,
              'No se pudo confirmar el pago en efectivo.',
            ),
          );
        },
      });
  }

  cancelarPago(): void {
    const payment = this.payment();
    const currentUserId = this.userId();

    if (
      !payment ||
      currentUserId === null ||
      payment.status === 'PAID'
    ) {
      return;
    }

    if (!window.confirm('¿Seguro que quieres cancelar la operación? El producto volverá a estar disponible.')) {
      return;
    }

    this.paymentProcessing.set(true);

    this.chatService
      .cancelPayment(payment.id, currentUserId)
      .subscribe({
        next: () => {
          this.paymentProcessing.set(false);

          const conversation = this.selectedConversation();

          if (conversation) {
            this.selectedConversation.set({
              ...conversation,
              productAvailability: 'AVAILABLE',
            });

            this.conversations.update((conversations) =>
              conversations.map((item) =>
                item.productId === conversation.productId
                  ? { ...item, productAvailability: 'AVAILABLE' }
                  : item,
              ),
            );

            this.loadOffers(conversation.id);
            this.loadPayment(conversation.id);
          }

          this.payment.set(null);
          this.paymentMethod.set(null);
          this.resetCardForm();
        },
        error: (error) => {
          this.paymentProcessing.set(false);
          window.alert(
            this.getErrorMessage(error, 'No se pudo cancelar la operación.'),
          );
        },
      });
  }

  markConversationAsSold(): void {
    const conversation = this.selectedConversation();

    if (!conversation) {
      return;
    }

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

    this.closeOfferForm();
  }

  resetCardForm(): void {
    this.cardNumber = '';
    this.cardHolder = '';
    this.cardExpiry = '';
    this.cardCvv = '';
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
    this.stopPaymentPolling();
    this.messageSubscription?.unsubscribe();
    this.chatWebSocketService.disconnect();
  }
}
