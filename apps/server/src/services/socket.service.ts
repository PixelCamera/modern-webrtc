import { Server } from 'socket.io';

export class SocketService {
  constructor(private io: Server) {}

  initialize() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
}
