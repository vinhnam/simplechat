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
  private socket: any;
  allTopics: string[];
  message:string;
  activeTopic:string;

  constructor(private contentService: ContentService) { 

    this.socket = io('https://finlexchat-backend.herokuapp.com/', { transports : ['websocket'] });
  }

  ngOnInit() { 
    
    this.socket.on('allTopics', data => {
      if(data) {
        this.allTopics = Object.keys(data);
        this.setTopic(this.allTopics[0]);
      }
    });

    this.socket.on('agentChannel', msg =>{
      if(msg['reference'] == this.activeTopic) 
      document.getElementById('message-list')!
      .appendChild(this.BuildElement(
        msg['senderRole'] + ": " + msg['content']
      ));
    });
  } 

  ngAfterViewInit() {
    this.socket.emit('topics', "none");
  }

  BuildElement(c)  {
    let content = document.createElement('p');
    content.innerHTML = c;
    return content;
  }

  SendMessage() {
    let data = {}
    if(!this.activeTopic) return;
    data['reference'] = this.activeTopic ;
    data['content'] = this.message;
    data['senderRole'] = 'Agent';
    data['sendTime'] = new Date().getTime();
    this.socket.emit('client channel', data);
    document.getElementById('message-list')!.appendChild(this.BuildElement( 
      data['senderRole'] + ": " + data['content']
    ));
    this.message = '';
  }

  setTopic(topic){
    this.activeTopic = topic;
    
    // fetch data from server
    let content = this.contentService.sendGetRequest(topic).subscribe(data=>{
      if(data.length == 0) return;
      const displayMessage = document.getElementById('message-list');
      displayMessage!.innerHTML = '';
      Array.from(data).forEach((message, id) => {
        displayMessage!.appendChild(this.BuildElement(
          message['senderRole'] + ": " + message['content']
        ))
      });  
    }); 

  }

  terminateTopic(topic){
    let content = this.contentService.deleteTopic(topic).subscribe(data=>{
     this.socket.emit('topics', "none");  
    });
  }

}
