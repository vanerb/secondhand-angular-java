import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private url = 'http://localhost:8080/api/chat';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  // ==========================================
  // HEADERS
  // ==========================================

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // ==========================================
  // CONVERSACIONES
  // ==========================================

  getConversations(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.url}/conversations/${userId}`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  // ==========================================
  // CREAR / OBTENER CONVERSACIÓN
  // ==========================================

  getOrCreateConversation(
    user1Id: number,
    user2Id: number,
    productId: number,
  ): Observable<any> {

    return this.http.post<any>(
      `${this.url}/conversation`,
      null,
      {
        params: {
          user1Id: user1Id,
          user2Id: user2Id,
          productId: productId,
        },
        headers: this.getHeaders(),
      },
    );
  }

  // ==========================================
  // MENSAJES
  // ==========================================

  getMessages(conversationId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.url}/conversation/${conversationId}/messages`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  // ==========================================
  // ELIMINAR CONVERSACIÓN
  // ==========================================

  deleteConversation(conversationId: number) {
    return this.http.delete(
      `${this.url}/conversation/${conversationId}`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  // ==========================================
  // TOGGLE CONVERSACIÓN
  // ==========================================

  toggleConversation(
    user1Id: number,
    user2Id: number,
    productId: number,
  ): Observable<any> {

    return this.getConversations(user1Id).pipe(

      switchMap((conversations) => {

        // Buscar conversación entre los dos usuarios
        // Y además del producto concreto
        const conversation = conversations.find(
          (c) =>
            (
              (c.user1?.id === user1Id && c.user2?.id === user2Id) ||
              (c.user1?.id === user2Id && c.user2?.id === user1Id)
            ) &&
            c.productId === productId,
        );

        // ==========================================
        // SI EXISTE → ELIMINAR
        // ==========================================

        if (conversation) {

          return this.deleteConversation(conversation.id).pipe(
            map(() => ({
              action: 'deleted',
              conversation: conversation,
            })),
          );

        }

        // ==========================================
        // SI NO EXISTE → CREAR
        // ==========================================

        return this.getOrCreateConversation(
          user1Id,
          user2Id,
          productId,
        ).pipe(
          map((conversation) => ({
            action: 'created',
            conversation: conversation,
          })),
        );
      }),
    );
  }
}