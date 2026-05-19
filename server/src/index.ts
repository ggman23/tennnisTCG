import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { GameState, ActionType, GameAction } from './game/types';
import { createGameState, processAction } from './game/gameLogic';
import { getAvailableDecks } from './data/cardRegistry';

const app = express();
const httpServer = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = parseInt(process.env.PORT || '3001', 10);

const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());
app.use('/artworks', express.static(path.join(__dirname, '../public/artworks')));

app.get('/api/decks', (_req, res) => res.json(getAvailableDecks()));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

interface LobbyEntry {
  socketId: string;
  pseudo: string;
  deckId: string;
}

interface Room {
  state: GameState;
  sockets: Record<string, string>;
}

const lobby: LobbyEntry[] = [];
const rooms = new Map<string, Room>();
const socketToRoom = new Map<string, { roomId: string; playerId: string }>();

io.on('connection', (socket: Socket) => {
  console.log(`[+] ${socket.id}`);

  socket.on('join_lobby', (payload: { pseudo: string; deckId: string }) => {
    const pseudo = (payload.pseudo || 'Joueur').trim().slice(0, 20);
    const deckId = payload.deckId || 'legendes_terre_battue';

    const validDecks = ['legendes_terre_battue', 'aristocrates_gazon', 'champions_dur'];
    if (!validDecks.includes(deckId)) {
      socket.emit('error', { message: 'Deck invalide' });
      return;
    }

    if (lobby.length > 0) {
      const opponent = lobby.shift()!;
      const roomId = uuidv4();

      let state: GameState;
      try {
        state = createGameState(roomId, [
          { id: opponent.socketId, pseudo: opponent.pseudo, deckId: opponent.deckId },
          { id: socket.id, pseudo, deckId },
        ]);
      } catch (err) {
        console.error('Error creating game state:', err);
        socket.emit('error', { message: 'Erreur lors de la création de la partie' });
        return;
      }

      const room: Room = {
        state,
        sockets: { [opponent.socketId]: opponent.socketId, [socket.id]: socket.id },
      };
      rooms.set(roomId, room);
      socketToRoom.set(opponent.socketId, { roomId, playerId: opponent.socketId });
      socketToRoom.set(socket.id, { roomId, playerId: socket.id });

      const opponentSocket = io.sockets.sockets.get(opponent.socketId);
      if (opponentSocket) opponentSocket.join(roomId);
      socket.join(roomId);

      io.to(opponent.socketId).emit('game_start', {
        roomId,
        state: sanitize(state, opponent.socketId),
        myPlayerId: opponent.socketId,
      });
      io.to(socket.id).emit('game_start', {
        roomId,
        state: sanitize(state, socket.id),
        myPlayerId: socket.id,
      });
    } else {
      lobby.push({ socketId: socket.id, pseudo, deckId });
      socket.emit('waiting_for_opponent');
    }
  });

  socket.on('game_action', (payload: { action: string; data: Record<string, unknown> }) => {
    const info = socketToRoom.get(socket.id);
    if (!info) return;
    const room = rooms.get(info.roomId);
    if (!room) return;

    const action: GameAction = {
      type: payload.action as ActionType,
      playerId: info.playerId,
      payload: payload.data || {},
    };

    const result = processAction(room.state, action);
    if (!result.success) {
      socket.emit('action_error', { error: result.error });
      return;
    }

    room.state = result.newState!;

    for (const [pid] of Object.entries(room.sockets)) {
      io.to(pid).emit('game_state_update', { state: sanitize(room.state, pid) });
    }

    if (room.state.phase === 'GAME_OVER') {
      io.to(info.roomId).emit('game_over', {
        winnerId: room.state.winnerId,
        winnerPseudo: room.state.winnerId ? room.state.players[room.state.winnerId]?.pseudo : '?',
      });
      for (const pid of Object.keys(room.sockets)) socketToRoom.delete(pid);
      rooms.delete(info.roomId);
    }
  });

  socket.on('cancel_matchmaking', () => {
    const idx = lobby.findIndex(e => e.socketId === socket.id);
    if (idx >= 0) lobby.splice(idx, 1);
  });

  socket.on('disconnect', () => {
    console.log(`[-] ${socket.id}`);
    const idx = lobby.findIndex(e => e.socketId === socket.id);
    if (idx >= 0) lobby.splice(idx, 1);
    const info = socketToRoom.get(socket.id);
    if (info) {
      const room = rooms.get(info.roomId);
      if (room) {
        const opponentId = Object.keys(room.sockets).find(id => id !== socket.id);
        if (opponentId) io.to(opponentId).emit('opponent_disconnected');
        for (const pid of Object.keys(room.sockets)) socketToRoom.delete(pid);
        rooms.delete(info.roomId);
      }
    }
  });
});

function sanitize(state: GameState, viewerId: string): GameState {
  const s: GameState = JSON.parse(JSON.stringify(state));
  for (const [pid, player] of Object.entries(s.players)) {
    if (pid !== viewerId) {
      const hidden = {
        id: 'hidden',
        templateId: 'card_back',
        type: 'HIDDEN' as const,
        name: '?',
        artworkPath: '/artworks/card_back.webp',
      };
      player.hand = player.hand.map(() => ({ ...hidden }));
      player.deck = player.deck.map(() => ({ ...hidden }));
    }
  }
  return s;
}

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Tennis TCG Server → http://0.0.0.0:${PORT}`);
});
