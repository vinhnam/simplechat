import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  private REST_API_SERVER = "http://finlexchat-backend.herokuapp.com/";

  constructor(private httpClient: HttpClient) { }

  public sendGetRequest(reference){
    return this.httpClient.get<any[]>(this.REST_API_SERVER+reference);
  }

  public deleteTopic(reference){
    return this.httpClient.delete(this.REST_API_SERVER+reference);
  }


}