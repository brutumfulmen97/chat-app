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
import { get } from "http";

// fix zato sto koristimo module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;

const ADMIN = "Admin";

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});

// state for users
const UsersState = {
    users: [],
    setUsers: function (nid, name, roomewUsers) {
        this.users = newUsers;
    },
};

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
    socket.emit("message", buildMessage(ADMIN, "Welcome to chat app"));

    socket.on("enterRoom", ({ name, room }) => {
        //leave previous room
        const prevRoom = getUser(socket.id)?.room;

        if (prevRoom) {
            socket.leave(prevRoom);
            io.to(prevRoom).emit(
                "message",
                buildMessage(ADMIN, `${name} has left the room`)
            );
        }

        const user = activateUser(socket.id, name, room);

        if (prevRoom) {
            io.to(prevRoom).emit("userList", {
                users: getUsersInRoom(prevRoom),
            });
        }

        socket.join(user.room);

        //to user
        socket.emit(
            "message",
            buildMessage(ADMIN, `You have joined the ${user.room} chat room`)
        );

        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                buildMessage(ADMIN, `${user.name} has joined the chat`)
            );

        //update user list
        io.to(user.room).emit("userList", {
            users: getUsersInRoom(user.room),
        });

        //update room list
        io.emit("roomList", {
            rooms: getAllActiveRooms(),
        });
    });

    //listen for chat message
    socket.on("message", ({ name, text }) => {
        const room = getUser(socket.id)?.room;

        if (room) {
            io.to(room).emit("message", buildMessage(name, text));
        }
    });

    //upon disconnect - to all users
    socket.on("disconnect", () => {
        const user = getUser(socket.id);
        userLeavesApp(socket.id);

        if (user) {
            io.to(user.room).emit(
                "message",
                buildMessage(ADMIN, `${user.name} has left the chat`)
            );

            io.to(user.room).emit("userList", {
                users: getUsersInRoom(user.room),
            });

            io.emit("roomList", {
                rooms: getAllActiveRooms(),
            });

            console.log(`user ${socket.id} disconnected`);
        }
    });

    //listen for activity
    socket.on("activity", (name) => {
        const room = getUser(socket.id)?.room;

        if (room) {
            socket.broadcast.to(room).emit("activity", name);
        }
    });
});

function buildMessage(name, text) {
    return {
        name,
        text,
        time: new Intl.DateTimeFormat("default", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
        }).format(new Date()),
    };
}

function activateUser(id, name, room) {
    const user = { id, name, room };
    UsersState.setUsers([...UsersState.filter((u) => u.id !== id), user]);
    return user;
}

function userLeavesApp(id) {
    UsersState.setUsers(UsersState.filter((u) => u.id !== id));
}

function getUser(id) {
    return UsersState.users.find((u) => u.id === id);
}

function getUsersInRoom(room) {
    return UsersState.users.filter((u) => u.room === room);
}

function getAllActiveRooms() {
    return Array.from(new Set(UsersState.users.map((user) => user.room)));
}
