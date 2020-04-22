const express = require("express");
const socketIo = require("socket.io");
const app = express();
// express.js wird mit http von NodeJS verbunden
const http = require("http").createServer(app);

// const process = require('process'); // Nicht nötig Über NodeJS direkt zugriff drauf
// https://nodejs.org/api/process.html

// socketIo greift auf dass HTTP-Modul von NodeJS zurück
const io = socketIo(http);

// const PORT = 8081;
// const HOST = "127.0.0.1";
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello");
});

let users = [];

const getUserIndexByUsername = (username) => {
  return users.findIndex((socket) => socket.username === username);
};

const getUserByUsername = (username) => {
  return users.find((socket) => socket.username === username);
};

io.on("connection", (socket) => {
  let addedUser = false;

  console.log(
    `new client (${socket.id}) connected from ${socket.conn.remoteAddress}`
  );

  socket.on("client message", (data) => {
    const { username, message } = data;
    console.log(`${username}: ${message}`);

    socket.broadcast.emit("new message", {
      username: socket.username,
      message,
    });
  });

  socket.on("add user", (username) => {
    if (addedUser) return;

    addedUser = true;
    socket.username = username;
    users.push(socket);

    socket.emit("login", {
      userCounter: users.length,
    });

    // Nachricht an alle verbundenen Sockets bzw. User
    socket.broadcast.emit("user joined", {
      username: socket.username,
      userCounter: users.length,
    });

    // Event disconnect bereits in socket.io vorhanden
    //
    socket.on("disconnect", () => {
      if (addedUser) {
        users.splice(getUserIndexByUsername(socket.username), 1);
        // https://socket.io/docs/client-api/

        socket.broadcast.emit("user left", {
          username: socket.username,
          userCounter: users.length,
        });
      }
    });
  });
});

const stdInput = process.openStdin();
stdInput.addListener("data", (data) => {
  // console.log("Meine Nachricht (Eingabe im 'Node-Terminal' Fenster: "+  data.toString());
  const message =
    data
      .toString()
      .split(/^\/(\w+)/)
      .splice(1).length > 0
      ? data
          .toString()
          .split(/^\/(\w+)/)
          .splice(1)
      : data.toString().trim();

  console.log(message);
  if (typeof message === "string") {
    io.emit("server message", message);
  } else {
    const user = getUserByUsername(message[0]);
    console.log(message[0]);
    if (user) {
      user.emit("server message", message[1]);
    }
  }

  // if ( message.match(/^\/\w+\s+/) ) {
  //   const username = message.split(/\s+/)[0].replace(/^\//,'');
  // } else {
  //   //message to all users
  // }

  //users[0].emit("server message", message);
});

// Server wird über http-Modul von NodeJs.
http.listen(PORT, () => {
  // console.log(
  //   `Server running at http://${HOST}:${PORT} ,\n Shut down with CTRL + C.`
  // );
  console.log(`Server running...`);
});
