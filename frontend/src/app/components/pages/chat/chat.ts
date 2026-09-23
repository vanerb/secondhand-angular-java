import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Container } from '../../general/container/container';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth-service';
import { ChatWebSocketService } from '../../../services/chat-web-socket-service';
import { Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { HttpClient } from '@angular/common/http';

import { getImage, sleep } from '../../../services/utilities-service';
import { ChatService } from '../../../services/chat-service';

@Component({
  selector: 'app-chat',
  imports: [
    Container,
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    MatButtonModule,
    FormsModule,
    MatDividerModule,
    MatListModule,
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  messages: any[] = [];

  conversations: any[] = [];

  messageText = '';

  selectedConversation: any = null;

  userId!: number;

  private messageSubscription?: Subscription;

  constructor(
    private chatWebSocketService: ChatWebSocketService,
    private authService: AuthService,
    private http: HttpClient,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Conectar WebSocket
    this.chatWebSocketService.connect();

    // Escuchar mensajes
    this.messageSubscription = this.chatWebSocketService.getMessages().subscribe((message) => {
      console.log('📩 Mensaje recibido en Chat:', message);

      if (this.selectedConversation && message.conversationId === this.selectedConversation.id) {
        this.messages.push(message);
        this.cdr.detectChanges();
      }
    });

    const userObservable = this.authService.getUserByToken();
    if (userObservable) {
      userObservable.subscribe({
        next: (user) => {
          console.log('Usuario autenticado:', user);

          this.userId = user.id;

          this.loadConversations();

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Error obteniendo usuario:', error);
        },
      });
    }
  }

  // ==========================================
  // CONVERSACIONES
  // ==========================================

  loadConversations(): void {
    this.chatService.getConversations(this.userId).subscribe({
      next: (data) => {
        console.log('Conversaciones:', data);

        this.conversations = data;

        this.cdr.detectChanges();
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

    this.cdr.detectChanges();

    this.chatService.getMessages(conversation.id).subscribe({
      next: (messages) => {
        console.log('Mensajes:', messages);

        this.messages = messages;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error cargando mensajes:', error);
      },
    });
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
