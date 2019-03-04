const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./data/dbConfig');
const Users = require('./helpers/users-module');


const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

// SANITY CHECK

server.get('/', (req, res) => {
  res.send("Welcome to Auth-I!")
});

// REGISTER

server.post('/api/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 16)
  user.password = hash

  Users.add(user)
    .then(saved => {
      res
        .status(201)
        .json(saved);
    })
    .catch(error => {
      res
        .status(500)
        .json(error);
    });
});

const port = 5000;
server.listen(port, () => console.log(`\n***** Running on port ${port} *****\n`));