import Ws from 'App/Services/Ws'
Ws.boot()

Ws.io.on('connection', socket => {
    console.log('Connection detected', socket)
    socket.emit('log', { message: 'Test message' })
    socket.on('log', data => console.log(data))
})