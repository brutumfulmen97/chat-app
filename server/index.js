// const ws = require("ws");
// const server = new ws.Server({ port: "3000" });

// server.on("connection", (socket) => {
//     console.log("New connection");
//     socket.on("message", (message) => {
//         const b = Buffer.from(message);
//         console.log(b.toString());
//         socket.send(`${message}`);
//     });
// });

import { Server } from "socket.io";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// fix zato sto koristimo module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});

const io = new Server(expressServer, {
    cors: {
        origin:
            process.env.NODE_ENV === "production"
                ? false
                : ["http://localhost:3500", "http://127.0.0.1:5500"],
    },
});

io.on("connection", (socket) => {
    console.log("user " + socket.id + " connected");

    //upon conn - only to user
    socket.emit("message", "Welcome to the chatroom!");

    //to all users except user
    socket.broadcast.emit(
        "message",
        `${socket.id.substring(0, 5)} has joined the chat`
    );

    //listen for chat message
    socket.on("message", (data) => {
        console.log(data);
        io.emit("message", `${socket.id.substring(0, 5)}: ${data}`);
    });

    //upon disconn - to all users
    socket.on("disconnect", () => {
        socket.broadcast.emit(
            "message",
            `${socket.id.substring(0, 5)} has left the chat`
        );
    });

    //listen for activity
    socket.on("activity", (name) => {
        console.log(name);
        socket.broadcast.emit("activity", name);
    });
});
