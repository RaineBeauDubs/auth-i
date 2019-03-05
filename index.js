const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

const db = require('./data/dbConfig');
const Users = require('./helpers/users-module');

const server = express();

const sessionConfig = {
  name: 'lucifer',
  secret: 'shhhh, hush, child.',
  cookie: {
    maxAge: 1000 * 60 * 15,
    secure: false,
  },
  httpOnly: true,
  resave: false,
  saveUninitialized: false,

  store: new KnexSessionStore({
    knex: db,
    tablename: 'sessions',
    sdifrieldname: 'sid',
    createtable: true,
    clearInterval: 1000 * 60 * 60,
  }),
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

// SANITY CHECK

server.get('/', (req, res) => {
  res.send("Welcome to Auth-I!")
});



// REGISTER

server.post('/api/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 12)
  user.password = hash

  Users.add(user)
    .then(saved => {
      req.session.user = saved;
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

// LOG-IN

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res
          .status(200)
          .json({
            message: `Welcome, ${user.username}! You are now logged in!`
          });
      } else {
        res
          .status(401)
          .json({
            message: 'YOU SHALL NOT PASS!!'
          });
      }
    })
    .catch(error => {
      res
        .status(500)
        .json(error);
    });
});

// RESTRICTED MIDDLEWARE

function restricted (req, res, next) {
  if ( req.session && req.session.user ) {
    next();
  } else {
    res
      .status(401)
      .json({
        message: 'YOU SHALL NOT PASS!!'
      })
  }
}

// function restricted (req, res, next) {
//   // const { username, password } = req.headers 

//   if ( req.session && req.session.username ) {
//     Users.findBy({ username })
//       .first()
//       .then(user => {
//         if (user && bcrypt.compareSync(password, user.password)) {
//           next();
//         } else {
//           res
//             .status(401)
//             .json({
//               message: 'YOU SHALL NOT PASS!!'
//             })
//         }
//       })
//       .catch(error => {
//         res
//           .status(500)
//           .json(error)
//       })
//   } else {
//     res
//       .status(400)
//       .json({
//         message: 'Did you forget something?'
//       })
//   }
// }

// GET USERS (RESTRICTED)

server.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get('/users', restricted, async(req, res) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (error) {
    res.send(error);
  }
});

server.get('/api/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(error => {
        if (error) {
          res.send('Lol you are stuck here forever.');
        } else{
          res.send('Byeeeee!');
        }
    });
  } else {
    res.end();
  }
});



const port = 5000;
server.listen(port, () => console.log(`\n***** Running on port ${port} *****\n`));