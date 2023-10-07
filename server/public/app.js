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

const activity = document.querySelector(".activity");
const msgInput = document.querySelector("input");

function sendMessage(e) {
    e.preventDefault();

    if (msgInput.value) {
        socket.emit("message", msgInput.value);
        msgInput.value = "";
    }

    msgInput.focus();
}

document.querySelector("form").addEventListener("submit", sendMessage);

socket.on("message", (message) => {
    activity.textContent = "";
    const li = document.createElement("li");
    li.textContent = message;
    document.querySelector("ul").appendChild(li);
});

msgInput.addEventListener("keypress", () => {
    socket.emit("activity", socket.id.substring(0, 5));
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
