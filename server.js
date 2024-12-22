const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Crea il server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Imposta la cartella pubblica per il client
app.use(express.static('public'));

// Gestione della connessione WebSocket
let players = {};



const fs = require('fs');






io.on('connection', (socket) => {
  console.log('Nuovo giocatore connesso:', socket.id);

  // Invia la lista dei giocatori connessi al nuovo giocatore
  socket.emit('currentPlayers', players);

  // Aggiungi il nuovo giocatore
  players[socket.id] = { x: 400, y: 300, faceImage: null };

  // Invia i dati del nuovo giocatore agli altri
  socket.broadcast.emit('newPlayer', { id: socket.id, x: 400, y: 300 });

  // Gestione delle posizioni dei giocatori
  socket.on('playerMovement', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
    }

    // Invia la posizione aggiornata a tutti gli altri giocatori
    socket.broadcast.emit('playerMoved', { id: socket.id, x: data.x, y: data.y });
     // Invia l'immagine agli altri giocatori
    image=players[socket.id].faceImage ;
    socket.broadcast.emit('playerFaceUpdated', { id: socket.id, image});
  });

  // Gestione dell'uscita di un giocatore
  socket.on('disconnect', () => {
    console.log('Giocatore disconnesso:', socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
  
  // Riceve i dati dell'immagine dal client
  socket.on('uploadFace', (data) => {
    const { image } = data;

    // Salva l'immagine sul server (opzionale)
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(`public/faces/${socket.id}.png`, base64Data, 'base64', (err) => {
      if (err) {
        console.error('Errore nel salvataggio dell\'immagine:', err);
      } else {
        console.log('Immagine salvata per il giocatore:', socket.id);
      }
    });

    // Aggiorna l'immagine del giocatore nella lista
    if (players[socket.id]) {
      players[socket.id].faceImage = image;
    }

    // Invia l'immagine agli altri giocatori
    socket.broadcast.emit('playerFaceUpdated', { id: socket.id, image });
  });
  
});

// Avvia il server sulla porta 3000
server.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
