import { Injectable } from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';

import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ImagesService {

  constructor(private http: HttpClient) {
  }

  async getImage(fromId: string, type: string) {
    return await firstValueFrom(this.http.get<any>(environment.apiUrl + '/api/images/'+type+'/' + fromId))
  }
}