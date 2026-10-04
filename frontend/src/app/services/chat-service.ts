import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { AuthService } from './auth-service';

export interface PriceOffer {
  id: number;
  conversationId: number;
  productId: number;
  sender: any;
  receiver: any;
  amount: number;
  originalPrice: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  respondedAt?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private url = 'http://localhost:8080/api/chat';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getConversations(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.url}/conversations/${userId}`,
      {
        headers: this.getHeaders(),
      },
    );
  }

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

  getMessages(conversationId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.url}/conversation/${conversationId}/messages`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  deleteConversation(conversationId: number) {
    return this.http.delete(
      `${this.url}/conversation/${conversationId}`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  toggleConversation(
    user1Id: number,
    user2Id: number,
    productId: number,
  ): Observable<any> {
    return this.getConversations(user1Id).pipe(
      switchMap((conversations) => {
        const conversation = conversations.find(
          (c) =>
            (
              (c.user1?.id === user1Id && c.user2?.id === user2Id) ||
              (c.user1?.id === user2Id && c.user2?.id === user1Id)
            ) &&
            c.productId === productId,
        );

        if (conversation) {
          return this.deleteConversation(conversation.id).pipe(
            map(() => ({
              action: 'deleted',
              conversation: conversation,
            })),
          );
        }

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

  // ==========================================
  // NEGOCIACIÓN DE PRECIO
  // ==========================================

  getOffers(
    conversationId: number,
    userId: number,
  ): Observable<PriceOffer[]> {
    return this.http.get<PriceOffer[]>(
      `${this.url}/conversation/${conversationId}/offers`,
      {
        params: {
          userId: userId,
        },
        headers: this.getHeaders(),
      },
    );
  }

  createOffer(
    conversationId: number,
    senderId: number,
    amount: number,
  ): Observable<PriceOffer> {
    return this.http.post<PriceOffer>(
      `${this.url}/conversation/${conversationId}/offers`,
      {
        senderId,
        amount,
      },
      {
        headers: this.getHeaders(),
      },
    );
  }

  acceptOffer(
    offerId: number,
    userId: number,
  ): Observable<PriceOffer> {
    return this.http.post<PriceOffer>(
      `${this.url}/offers/${offerId}/accept`,
      null,
      {
        params: {
          userId,
        },
        headers: this.getHeaders(),
      },
    );
  }

  rejectOffer(
    offerId: number,
    userId: number,
  ): Observable<PriceOffer> {
    return this.http.post<PriceOffer>(
      `${this.url}/offers/${offerId}/reject`,
      null,
      {
        params: {
          userId,
        },
        headers: this.getHeaders(),
      },
    );
  }

  counterOffer(
    offerId: number,
    senderId: number,
    amount: number,
  ): Observable<PriceOffer> {
    return this.http.post<PriceOffer>(
      `${this.url}/offers/${offerId}/counter`,
      {
        senderId,
        amount,
      },
      {
        headers: this.getHeaders(),
      },
    );
  }
}
