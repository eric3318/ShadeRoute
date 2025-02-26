import { Server } from 'socket.io';

const io = new Server({
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    socket.on('subscribe', (jobId: string) => {
        socket.join(jobId);
    });

    socket.on('disconnect', () => {
        const rooms = Array.from(socket.rooms);
        rooms.forEach(room => socket.leave(room));
    });
});

export default io;
