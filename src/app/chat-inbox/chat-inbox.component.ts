import { Component, OnInit } from '@angular/core';
import io from 'socket.io-client';
import { ContentService } from '../content.service';


const SOCKET_ENDPOINT = 'finlexchat-backend.herokuapp.com';

@Component({
  selector: 'app-chat-inbox',
  templateUrl: './chat-inbox.component.html',
  styleUrls: ['./chat-inbox.component.css']
})
export class ChatInboxComponent implements OnInit {
  message: string;
  reference: string;
  topic: string;
  private socket: any;

  constructor(private contentService: ContentService) { 
    this.socket = io('http://finlexchat-backend.herokuapp.com', { transports : ['websocket'] });
  }

  ngOnInit() { 
    this.socket.on(this.socket.id, data => {
      if (data) {
        document.getElementById('message-list')!.appendChild(this.clientElement(
          data['senderRole'] + ":" + data['content']
        ));
      }
    });
  } 

  clientElement(data)  {
    let element = document.createElement('li');
    element.innerHTML = data;
    element.style.background = 'white';
    element.style.padding =  '15px 30px';
    element.style.margin = '10px';
    element.style.textAlign = 'right';
    return element;
  }

  SendMessage() {
    if(!this.reference) return; 
    let data = {}
    data['reference'] = this.reference;
    data['content'] = this.message;
    data['senderRole'] = 'Client';
    data['sendTime'] = new Date().getTime();
    this.socket.emit('client channel', data);
    document.getElementById('message-list')!.appendChild(this.clientElement(
      data['senderRole'] + ":" + data['content']));
    this.message = '';
  }

  ConfirmRef() {
    if(!this.reference) return;
    //should do some check here, maybe OTP
    let topicData = {};
    topicData['reference'] = this.reference;
    this.socket.emit('new topic', topicData);
    this.ngOnInit();
    document.getElementById('confirmButton')!.setAttribute("disabled","disabled");
    
    // fetch full content from server
    let content = this.contentService.sendGetRequest(this.reference).subscribe(data=>{
      const displayMessage = document.getElementById('message-list');
      displayMessage!.innerHTML = '';
      data.forEach((message, id) => {
        displayMessage!.appendChild(this.clientElement(
          message['senderRole'] + ": " + message['content']
        ))
      });  
    });   
      
  }
}
