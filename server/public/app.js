// const socket = new WebSocket("ws://localhost:3000");

// function sendMessage(e) {
//     e.preventDefault();
//     const input = document.querySelector("input");
//     if (input.value) {
//         socket.send(input.value);
//         input.value = "";
//     }
//     input.focus();
// }

// document.querySelector("form").addEventListener("submit", sendMessage);

// //lisetn for messages

// socket.addEventListener("message", (message) => {
//     const li = document.createElement("li");
//     li.textContent = message.data;
//     document.querySelector("ul").appendChild(li);
// });

const socket = io("http://localhost:3500");

const nameInput = document.querySelector("#name");
const roomInput = document.querySelector("#room");
const msgInput = document.querySelector("#message");

const activity = document.querySelector(".activity");
const usersList = document.querySelector(".user");
const roomList = document.querySelector(".room");

const chatDisplay = document.querySelector(".chat-display");

function sendMessage(e) {
    e.preventDefault();

    if (nameInput.value && roomInput.value && msgInput.value) {
        socket.emit("message", {
            name: nameInput.value,
            text: msgInput.value,
        });
        msgInput.value = "";
    }

    msgInput.focus();
}

function enterRoom() {
    e.preventDefault();

    if (nameInput.value && roomInput.value) {
        socket.emit("enterRoom", {
            name: nameInput.value,
            room: roomInput.value,
        });
    }
}

document.querySelector(".form-message").addEventListener("submit", sendMessage);
document.querySelector(".form-join").addEventListener("submit", enterRoom);

msgInput.addEventListener("keypress", () => {
    socket.emit("activity", nameInput.value);
});

socket.on("message", (message) => {
    activity.textContent = "";
    const li = document.createElement("li");
    li.textContent = message;
    document.querySelector("ul").appendChild(li);
});

let activityTimer;
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing a message...`;
    //clear after 1s
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        activity.textContent = "";
    }, 1000);
});
