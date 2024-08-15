// TODO: write code here
const url = "//localhost:7070/";

// const eventSource = new EventSource("http:" + url + "sse");

// eventSource.addEventListener("open", (e) => {
//   console.log(e);

//   console.log("sse open");
// });

// eventSource.addEventListener("error", (e) => {
//   console.log(e);

//   console.log("sse error");
// });

// const subscriptions = document.querySelector(".subscriptions");

// eventSource.addEventListener("message", (e) => {
//   console.log(e);
//   const { name, phone } = JSON.parse(e.data);

//   subscriptions.appendChild(document.createTextNode(`${name} ${phone}\n`));

//   console.log("see message");
// });

const ws = new WebSocket("ws:" + url + "ws");

const subscribe = document.querySelector(".subscribe");
const chatBlock = document.querySelector(".chat-block");
const chat = document.querySelector(".chat");
const chatMessage = document.querySelector(".chat-message");
// const chatSend = document.querySelector(".chat-send");
const onlinePerson = document.querySelector(".online-person");

let nikName = "";
let chatHistory = [];

const formatDate = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}.${month}.${year}`;
};

const logIn = (e) => {
  e.preventDefault();

  nikName = form.name.value;
  const message = {
    nik: form.name.value,
  };
  if (!message.nik) return;

  ws.send(JSON.stringify(message));
  form.name.value = "";
};

const scrollToBottom = () => {
  chat.scrollTop = chat.scrollHeight;
};

const form = document.getElementById("createTicketForm");
form.addEventListener("submit", logIn);

chatMessage.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const message = {
      chat: chatMessage.value,
      nik: nikName,
      time: formatDate(new Date()),
    };

    if (!message.chat) return;

    ws.send(JSON.stringify(message));
    chatMessage.value = "";
  }
});

ws.addEventListener("open", (e) => {
  console.log(e);

  console.log("ws open");
});

ws.addEventListener("close", (e) => {
  console.log(e);

  console.log("ws close");
});

ws.addEventListener("error", (e) => {
  console.log(e);

  console.log("ws error");
});

ws.addEventListener("message", (e) => {
  console.log(e);

  const data = JSON.parse(e.data);
  if (data.status === "nik exist") {
    return;
  } else if (data.status === "ok" && nikName) {
    subscribe.classList.add("hidden");
    chatBlock.classList.remove("hidden");
    onlinePerson.classList.remove("hidden");
    chatMessage.focus();
  }

  console.log(data);
  if (data.niks && data.niks.length > 0) {
    onlinePerson.innerHTML = "";
    data.niks.forEach((name) => {
      const personBlock = document.createElement("div");
      personBlock.className = "person-block";
      const avatar = document.createElement("div");
      avatar.className = "avatar";
      personBlock.appendChild(avatar);
      const avatarName = document.createElement("div");
      avatarName.className = "avatar-name";
      if (name === nikName) {
        avatarName.innerText = "You";
        avatarName.style.color = "red";
      } else {
        avatarName.innerText = name;
      }
      personBlock.appendChild(avatarName);
      onlinePerson.appendChild(personBlock);
    });

    // return;
  }

  if (nikName) {
    chat.innerHTML = "";

    if (Array.isArray(data)) {
      chatHistory = data;
    }

    chatHistory.forEach((dat) => {
      const { chat: message, nik, time } = dat;

      const messageBlock = document.createElement("div");
      messageBlock.className = "message-block";
      const sender = document.createElement("div");
      sender.className = "sender";
      if (nik === nikName) {
        sender.innerText = "You, " + time;
        sender.style.color = "red";
        messageBlock.classList.add("you");
      } else {
        sender.innerText = nik + ", " + time;
      }
      messageBlock.appendChild(sender);

      const mes = document.createElement("div");
      mes.className = "message";
      mes.textContent = message;
      messageBlock.appendChild(mes);
      chat.appendChild(messageBlock);

      scrollToBottom();
    });
  } else if (!data.niks && data[0].chat) {
    chatHistory = data;
  }

  console.log("ws message");
});

// window.api = new SubscroptionApi("http:" + url);
