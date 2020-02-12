//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let port = 3000;
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect(
  'mongodb://localhost:27017/userDB',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  }
);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = new mongoose.model('User', userSchema);


app.route('/')
  .get((req, res) => {
    res.render('home');
  });

app.route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post((req, res) => {

    User.findOne({email: req.body.username},(err, foundUser) => {
      if (err) {
        res.send(err);
      } else {
        if (foundUser) {
          bcrypt.compare(req.body.password, foundUser.password, (err, result) => {
            if (result === true) {
              res.render('secrets');
            } else {
              res.send('Email and password don\'t match.');
            }
          });
        } else {
          res.send('User doesn\'t exist. Would you like to register?');
        }
      }
    });
  });

app.route('/register')
  .get((req, res) => {
    res.render('register');
  })
  .post((req, res) => {

    User.findOne({email: req.body.username}, (err, foundUser) => {
      if (err) {
        res.send(err);
      }
      else if (foundUser) {
        res.send('User with this email already exists.');
      }
      else {
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
          const newUser = new User({
            email: req.body.username,
            password: hash
          });
          newUser.save((err) => {
            if (err) {
              console.log(err);
            } else {
              res.render('secrets')
            }
          });
        });
      }
    });
  });


app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
