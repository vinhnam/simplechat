const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            
   optionSuccessStatus:200,
}
app.use(cors(corsOptions));
var referenceMap ={};
var contentMap = {};

app.get('/:ref', (req, res) => {
  if(!contentMap[req.params.ref]) {res.send({}); return;}
  res.send(contentMap[req.params.ref]);
});

app.delete('/:ref', (req, res) => {
  delete contentMap[req.params.ref];
  delete referenceMap[req.params.ref];
  res.send({'deleted':req.params.ref})
});

//to debug
app.get('/', (req, res) => {
  res.send(contentMap);
});


io.on('connection', (socket) => {
  //console.log('one connection established..')
  
  socket.on('client channel', msg => {
    if(!referenceMap[msg['reference']]){
     console.log("No topic established.")
     return;
    }

    // broadcast to everyone have the same topic
    referenceMap[msg['reference']].forEach((socketId,i) => {
      socket.broadcast.emit(socketId, msg );
    });

    //broadcast to agent
    socket.broadcast.emit('agentChannel', msg );

    contentMap[msg['reference']].push(msg);

    //limit to 30 message each topic since we store everything in ram.
    //TODO: move to a backup file
    if(contentMap[msg['reference']].length == 50) {
      contentMap[msg['reference']] = contentMap[msg['reference']].slice(30);
    }
  });

  socket.on('new topic' , topic => {
    if(!referenceMap[topic['reference']]){
      referenceMap[topic['reference']] = new Set();
      contentMap[topic['reference']] = [];
    }
    referenceMap[topic['reference']].add(socket.id);
    socket.broadcast.emit('allTopics', referenceMap);
  });

  /** 
   * this should not be a http call 
   * since agent page should maintain 
   * the list of active topic instancely
   * */
  socket.on('topics' , topics => {
    socket.emit('allTopics', referenceMap );
  });
  

});
 
http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
