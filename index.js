// import { Server } from "http";

// implement your API here
const express = require("express");

const db = require("./data/db.js");

const server = express();

server.use(express.json());

server.get("/", (req, res) =>{
    res.send({api:"up and running..."})
});

// get users request to the path of /find
server.get(`/users`, (req, res) => {
    db.find()
    .then(users => {
        res.status(200).json(users);
    })
    .catch(error => {
        console.log("error on GET /users", error)// 500 sever error
        res.status(500).json({errorMessage:"error getting list of users from database"})//write code for humans not computer optimized for visibility useing json instead of .send()
    })
})

// addding a user
// server.post("/users", (req, res) => {
//     const userData = req.body;
//     db.insert(userData)
//     .then(user => {
//         res.status(201).json(user);
//     })
//     .catch(error => {
//         console.log("error on Post /users", error);
//         res.status(500).json({errorMessage: "error adding user"})
//     })
// })
server.post("/users", (req, res) => {
    const { name, bio } = req.body;
    if(!name || !bio) {
        res.status(400).json({ error: "you forget you name buddy, or may a bio we need those please."});
    }else {
        db
        .insert({ name, bio })
        .then(({ id }) => {
            db.findById(id).then((user) => {
                res.status(201).json(user);
            });
        })
        .catch(error => {
            console.log("error on the Post / users", error);
            res.status(500).json({
                errorMessage: "nothing got saved buddy"
            })
        })
    }
})

server.delete("/users/:id", (req, res) => {
    const id = req.params.id;
    db.remove(id)
    .then(removed => {
        if(removed) {
            res.status(404).json({message: "user deleted", removed})
        }else{
            res.status(200).json({message: "user not found"})
        }
    })
})

server.put(`/users/:id`, (req, res) => {
    const { id } = req.params;
    const { name, bio } = req.body;
    if (!name && !bio) {
        return res.status(400).json({error: "your gunna need the name and bio here."});
    }
    db.update(id, {name, bio})
    .then(updated => {
        if(updated) {
            db.findById(id)
            .then(user => res.status(200).json(user))
            .catch(error => {
                console.log(error);
                res.status(500).json({error: "we cant find the user on our end"})
            });
        }else {
            res.status(404).json({error: "there is no user with that id bud"})
        }
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({error:"we couldnt modify the user"})
    })
})

server.get("/users/:id", (req, res) => {
    const { id } =req.params;
    db.findById(id)
        .then(user => {
        console.log("user", user);
        if(user) {
            res.status(200).json(user);
        }else {
            res.status(404).json({error: "the user with that id doesnt exist"})
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: "couldn't find any info at that location"})
    })
})

const port = 5000;
server.listen(port, () => console.log(`\n API is running on port ${port}\n`)
);