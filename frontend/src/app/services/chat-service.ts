
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
    private url = 'http://localhost:8080/api/chat';

  constructor(
    private http: HttpClient,
    private authService: AuthService
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
      }
    );
  }

  // ==========================================
  // CREAR / OBTENER CONVERSACIÓN
  // ==========================================

  getOrCreateConversation(
    user1Id: number,
    user2Id: number
  ): Observable<any> {

    return this.http.post<any>(
      `${this.url}/conversation`,
      null,
      {
        params: {
          user1Id: user1Id,
          user2Id: user2Id,
        },
        headers: this.getHeaders(),
      }
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
      }
    );
  }
}
