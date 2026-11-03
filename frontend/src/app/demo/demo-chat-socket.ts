import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { demoApi } from './demo-backend.interceptor';

const AUTO_REPLIES = [
  '¡Hola! Gracias por escribir. (Respuesta automática de la demo: entra con la otra cuenta para contestar tú.)',
  'Perfecto, lo miro y te digo algo. (Respuesta automática de la demo)',
];

/**
 * Sustituto del WebSocket STOMP en la demo: guarda el mensaje en la API simulada y lo
 * reemite como haría /topic/chat. La primera vez que escribes en cada conversación,
 * el otro participante responde automáticamente para que el chat no se vea vacío.
 */
@Injectable()
export class DemoChatWebSocketService {
  private readonly messageSubject = new Subject<any>();
  private readonly replied = new Set<number>();

  connect(): void {}

  disconnect(): void {}

  subscribeToChat(): undefined {
    return undefined;
  }

  sendMessage(conversationId: number, senderId: number, content: string): void {
    const api = demoApi();
    const emit = (sender: number, text: string) => {
      try {
        this.messageSubject.next(api.sendMessage(conversationId, sender, text));
      } catch (error) {
        console.error('[demo] Error enviando mensaje:', error);
      }
    };
    setTimeout(() => emit(senderId, content), 120);

    if (this.replied.has(conversationId)) return;
    this.replied.add(conversationId);
    const conversation = api.db.find('conversations', conversationId);
    if (!conversation) return;
    const other = conversation['user1Id'] === senderId ? conversation['user2Id'] : conversation['user1Id'];
    setTimeout(() => emit(other, AUTO_REPLIES[conversationId % AUTO_REPLIES.length]), 1800);
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }
}
