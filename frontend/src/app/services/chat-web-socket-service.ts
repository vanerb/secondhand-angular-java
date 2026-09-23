import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Client,
  IMessage,
  StompSubscription
} from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatWebSocketService {

  private client: Client;

  private messageSubject =
    new Subject<any>();

  private platformId = inject(PLATFORM_ID);

  constructor() {

    this.client = new Client({

      brokerURL: 'ws://localhost:8080/ws',

      reconnectDelay: 5000,

      debug: (str) => {
        console.log('[STOMP]', str);
      },
    });

    this.client.onConnect = () => {

      console.log('✅ WebSocket conectado');

      this.subscribeToChat();
    };

    this.client.onDisconnect = () => {

      console.log('❌ WebSocket desconectado');
    };

    this.client.onStompError = (frame) => {

      console.error(
        '❌ Error STOMP:',
        frame.headers['message']
      );

      console.error(
        'Detalles:',
        frame.body
      );
    };

    this.client.onWebSocketError = (error) => {

      console.error(
        '❌ Error WebSocket:',
        error
      );
    };

    this.client.onWebSocketClose = (event) => {

      console.error(
        '❌ WebSocket cerrado:',
        event
      );
    };
  }

  connect(): void {

    // IMPORTANTE:
    // No conectar durante SSR/Node
    if (!isPlatformBrowser(this.platformId)) {

      console.log(
        '⏭️ WebSocket omitido durante SSR'
      );

      return;
    }

    if (!this.client.active) {

      console.log(
        '🔌 Conectando WebSocket...'
      );

      this.client.activate();
    }
  }

  disconnect(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.client.active) {

      this.client.deactivate();
    }
  }

  subscribeToChat():
    StompSubscription | undefined {

    if (!this.client.connected) {

      console.error(
        '❌ WebSocket todavía no está conectado'
      );

      return;
    }

    console.log(
      '📡 Suscrito a /topic/chat'
    );

    return this.client.subscribe(
      '/topic/chat',
      (message: IMessage) => {

        const data =
          JSON.parse(message.body);

        console.log(
          '📩 Mensaje recibido:',
          data
        );

        this.messageSubject.next(data);
      }
    );
  }

  sendMessage(
    conversationId: number,
    senderId: number,
    content: string
  ): void {

    if (!this.client.connected) {

      console.error(
        '❌ WebSocket no está conectado'
      );

      return;
    }

    console.log(
      '📤 Enviando mensaje:',
      content
    );

    this.client.publish({

      destination:
        '/app/chat.sendMessage',

      body: JSON.stringify({
        conversationId,
        senderId,
        content,
      }),
    });
  }

  getMessages(): Observable<any> {

    return this.messageSubject
      .asObservable();
  }
}