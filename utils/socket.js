

module.exports = (socket) => {
    console.log('connection to socket.io');

          socket.on('setup',(userData)=>{
            socket.join(userData._id);
            socket.emit('connected');
          });

          socket.on('join chat',(chatId)=>{
            socket.join(chatId);
            console.log('User joined room: ' + chatId);
          });

          socket.on('new message',(newmsg)=>{
            let chat = newmsg.chat;
            chat.users.forEach(user => {
                if(user._id===newmsg.userId) return;
                socket.in(user._id).emit('message recieved',newmsg);
            });
          });

}