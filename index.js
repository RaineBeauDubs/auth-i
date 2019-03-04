const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./data/dbConfig');


const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

// SANITY CHECK

server.get('/', (req, res) => {
  res.send("Welcome to Auth-I!")
});

const port = 5000;
server.listen(port, () => console.log(`\n***** Running on port ${port} *****\n`));