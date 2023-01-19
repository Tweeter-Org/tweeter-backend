module.exports = (socket) => {
    try{
        console.log('connection to socket.io');

        socket.on('setup',(userData)=>{
            socket.join(userData._id);
            console.log('user with userId ' + userData._id + ' connected');
            socket.emit('connected','user '+ userData._id +' connected');
        });

        // socket.on('join chat',(chatId)=>{
        //     socket.join(chatId);
        //     console.log('User joined room: ' + chatId);
        // });

        socket.on('new message',(newmsg)=>{
            let chat = newmsg.chat;
            chat.users.forEach(user => {
                if(user._id===newmsg.userId) return;
                socket.in(user._id).emit('message recieved',newmsg);
            });
        });


    }catch(err){
        console.log(err);
        socket.emit(err);
    }
}