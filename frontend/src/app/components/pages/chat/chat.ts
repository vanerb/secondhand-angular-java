import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Container } from '../../general/container/container';
import { AuthService } from '../../../services/auth-service';
import { ChatWebSocketService } from '../../../services/chat-web-socket-service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { getImage } from '../../../services/utilities-service';
import { ChatService } from '../../../services/chat-service';

@Component({
  selector: 'app-chat',
  imports: [
    Container,
    FormsModule,
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {

  messages = signal<any[]>([]);

  conversations = signal<any[]>([]);

  messageText = '';

  conversationQuery = '';

  selectedConversation = signal<any | null>(null);

  userId = signal<number | null>(null);

  private messageSubscription?: Subscription;

  constructor(
    private chatWebSocketService: ChatWebSocketService,
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  ngOnInit(): void {

    // ==========================================
    // WEBSOCKET
    // ==========================================

    this.chatWebSocketService.connect();

    this.messageSubscription =
      this.chatWebSocketService.getMessages().subscribe((message) => {

        console.log(
          '📩 Mensaje recibido en Chat:',
          message
        );

        const conversation =
          this.selectedConversation();

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

    // ==========================================
    // USUARIO
    // ==========================================

    const userObservable =
      this.authService.getUserByToken();

    if (userObservable) {

      userObservable.subscribe({

        next: (user) => {

          console.log(
            'Usuario autenticado:',
            user
          );

          this.userId.set(user.id);

          this.loadConversations();
        },

        error: (error) => {

          console.error(
            'Error obteniendo usuario:',
            error
          );

        },

      });
    }
  }

  // ==========================================
  // CONVERSACIONES FILTRADAS
  // ==========================================

  get filteredConversations(): any[] {

    const conversations =
      this.conversations();

    const query =
      this.conversationQuery
        .trim()
        .toLocaleLowerCase('es');

    if (!query) {
      return conversations;
    }

    return conversations.filter(
      (conversation) => {

        const user =
          this.getOtherUser(conversation);

        return (
          `${user.username} ${user.name} ${user.cogname}`
            .toLocaleLowerCase('es')
            .includes(query)
        );

      }
    );
  }

  // ==========================================
  // CONVERSACIONES
  // ==========================================

  loadConversations(): void {

    const currentUserId =
      this.userId();

    if (currentUserId === null) {
      return;
    }

    this.chatService
      .getConversations(currentUserId)
      .subscribe({

        next: (data) => {

          console.log(
            'Conversaciones:',
            data
          );

          this.conversations.set(data);

        },

        error: (error) => {

          console.error(
            'Error cargando conversaciones:',
            error
          );

        },

      });
  }

  getOtherUser(conversation: any): any {

    const currentUserId =
      this.userId();

    if (
      conversation.user1?.id === currentUserId
    ) {
      return conversation.user2;
    }

    return conversation.user1;
  }

  openConversation(conversation: any): void {

    this.selectedConversation.set(
      conversation
    );

    console.log(
      'Conversación seleccionada:',
      conversation
    );

    // Limpiamos los mensajes anteriores
    this.messages.set([]);

    this.chatService
      .getMessages(conversation.id)
      .subscribe({

        next: (messages) => {

          console.log(
            'Mensajes:',
            messages
          );

          this.messages.set(messages);

        },

        error: (error) => {

          console.error(
            'Error cargando mensajes:',
            error
          );

        },

      });
  }

  closeConversation(): void {

    this.selectedConversation.set(null);

  }

  // ==========================================
  // ENVIAR MENSAJE
  // ==========================================

  enviarMensaje(): void {

    const content =
      this.messageText.trim();

    if (!content) {
      return;
    }

    const conversation =
      this.selectedConversation();

    const currentUserId =
      this.userId();

    if (
      !conversation ||
      currentUserId === null
    ) {
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
  // IMAGEN
  // ==========================================

  getUserImage(
    profileImage: string | null | undefined
  ): string {

    return getImage(profileImage);

  }

  // ==========================================
  // DESTROY
  // ==========================================

  ngOnDestroy(): void {

    this.messageSubscription?.unsubscribe();

    this.chatWebSocketService.disconnect();

  }
}