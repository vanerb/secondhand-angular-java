import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
  messages: any[] = [];

  conversations: any[] = [];

  messageText = '';
  conversationQuery = '';

  selectedConversation: any = null;

  userId!: number;

  private messageSubscription?: Subscription;

  constructor(
    private chatWebSocketService: ChatWebSocketService,
    private authService: AuthService,
    private chatService: ChatService,
   
  ) {}

  ngOnInit() {
    // Conectar WebSocket
    this.chatWebSocketService.connect();

    // Escuchar mensajes
    this.messageSubscription = this.chatWebSocketService.getMessages().subscribe((message) => {
      console.log('📩 Mensaje recibido en Chat:', message);

      if (this.selectedConversation && message.conversationId === this.selectedConversation.id) {
        this.messages.push(message);
       
      }
    });

    const userObservable = this.authService.getUserByToken();
    if (userObservable) {
      userObservable.subscribe({
        next: (user) => {
          console.log('Usuario autenticado:', user);

          this.userId = user.id;

          this.loadConversations();

      
        },

        error: (error) => {
          console.error('Error obteniendo usuario:', error);
        },
      });
    }
  }

  get filteredConversations(): any[] {
    const query = this.conversationQuery.trim().toLocaleLowerCase('es');
    if (!query) return this.conversations;
    return this.conversations.filter((conversation) => {
      const user = this.getOtherUser(conversation);
      return `${user.username} ${user.name} ${user.cogname}`.toLocaleLowerCase('es').includes(query);
    });
  }

  // ==========================================
  // CONVERSACIONES
  // ==========================================

  loadConversations(): void {
    this.chatService.getConversations(this.userId).subscribe({
      next: (data) => {
        console.log('Conversaciones:', data);

        this.conversations = data;

       
      },

      error: (error) => {
        console.error('Error cargando conversaciones:', error);
      },
    });
  }

  getOtherUser(conversation: any): any {
    if (conversation.user1.id === this.userId) {
      return conversation.user2;
    }

    return conversation.user1;
  }

  openConversation(conversation: any): void {
    this.selectedConversation = conversation;

    console.log('Conversación seleccionada:', conversation);

    this.messages = [];

  

    this.chatService.getMessages(conversation.id).subscribe({
      next: (messages) => {
        console.log('Mensajes:', messages);

        this.messages = messages;

        
      },

      error: (error) => {
        console.error('Error cargando mensajes:', error);
      },
    });
  }

  closeConversation(): void {
    this.selectedConversation = null;
  }

  // ==========================================
  // ENVIAR MENSAJE
  // ==========================================

  enviarMensaje(): void {
    const content = this.messageText.trim();

    if (!content) {
      return;
    }

    if (!this.selectedConversation) {
      return;
    }

    this.chatWebSocketService.sendMessage(
      this.selectedConversation.id,

      this.userId,

      content,
    );

    this.messageText = '';
  }

  getUserImage(profileImage: string | null | undefined): string {
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
