"use strict";

{
  const socket = io();
  socket.connect();

  const DOM = {
    btnEnter: document.querySelector(".btn-enter"),
    btnSend: document.querySelector(".btn-send"),
    inputMessage: document.querySelector("#input-message"),
    chatMessages: document.querySelector(".chat-messages"),
    inputUsername: document.querySelector("#input-username"),
    loginBox: document.querySelector(".m-login"),
    userCounter: document.querySelector("span.user-counter"),
  };

  let username = "";
  let connected = false;

  const init = () => {
    DOM.btnSend.addEventListener("click", onBtnMessageSend);
    window.addEventListener("keydown", onKeyDown);

    DOM.btnEnter.addEventListener("click", onBtnEnter);
    window.addEventListener("keyup", onKeyUp);
  };

  const onKeyUp = (event) => {
    // console.log(event);
    if (event.key.toUpperCase() === "ENTER") {
      if (DOM.inputUsername.value !== "") {
        setUsername();
      }
    }
  };

  const onBtnEnter = (event) => {
    if (DOM.inputUsername.value !== "") {
      setUsername();
    }
  };

  const setUsername = () => {
    username = DOM.inputUsername.value;
    console.log(username);
    if (username) {
      DOM.loginBox.classList.add("animated", "hinge");
      // DOM.loginBox.remove();
      DOM.loginBox.addEventListener("animationend", (event) => {
        DOM.loginBox.remove();
      });

      // Username an Server senden.
      socket.emit("add user", username);
    }
  };

  const onBtnMessageSend = (event) => {
    const message = DOM.inputMessage.value;
    DOM.inputMessage.value = "";
    DOM.chatMessages.innerHTML += `${username}: ${message} <br>`;
    console.log(message);
    socket.emit("client message", {
      username,
      message,
    }); // Eigenen Event-Trigger (Auslöser) mit dem Namen chatmessage definiert.
  };

  const onKeyDown = (event) => {
    // console.log(event);
    if (event.key.toUpperCase() === "ENTER") {
      if (DOM.inputMessage.value !== "") {
        onBtnMessageSend();
      }
    }
  };

  const showCurrentUsers = (data) => {
    const message =
      data.userCounter === 1
        ? `1 User online`
        : `${data.userCounter} Users online`;
    DOM.userCounter.textContent = message;
  };

  // Socket EVENTS ==================

  socket.on("login", (data) => {
    connected = true;
    showCurrentUsers(data);
  });

  socket.on("new message", (data) => {
    const { username, message } = data;
    DOM.chatMessages.innerHTML += `${username}: ${message} <br>`;
  });

  socket.on("server message", (message) => {
    // console.log(message);
    DOM.chatMessages.innerHTML += "SERVER: " + message + "<br>";
  });

  socket.on("user joined", (data) => {
    console.log(`${data.username} has logged in.`);
    showCurrentUsers(data);
  });

  socket.on("user left", (data) => {
    console.log(data.username + " has logged out.");
    showCurrentUsers(data);
  });

  init();
}
