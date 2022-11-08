import Ws from 'App/Services/Ws'
Ws.boot()

Ws.io.on('connection', socket => {
    socket.emit('log', { message: 'Test message' })
    socket.on('other event', data => console.log(data))
})