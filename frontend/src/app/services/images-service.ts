import { Injectable } from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {

  constructor(private http: HttpClient) {
  }

  async getImage(fromId: string, type: string) {
    return await firstValueFrom(this.http.get<any>('http://localhost:8080/api/images/'+type+'/' + fromId))
  }
}