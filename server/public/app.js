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

function sendMessage(e) {
    e.preventDefault();
    const input = document.querySelector("input");
    if (input.value) {
        socket.emit("message", input.value);
        input.value = "";
    }
    input.focus();
}

document.querySelector("form").addEventListener("submit", sendMessage);

socket.on("message", (message) => {
    const li = document.createElement("li");
    li.textContent = message;
    document.querySelector("ul").appendChild(li);
});
