//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
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
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

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
          if (foundUser.password === req.body.password) {
            res.render('secrets');
          } else {
            res.send('Email and password don\'t match.');
          }
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

        const newUser = new User({
          email: req.body.username,
          password: req.body.password
        });

        newUser.save((err) => {
          if (err) {
            console.log(err);
          } else {
            res.render('secrets')
          }
        });
      }
    });
  });


app.listen(3000, () => {
  console.log(`Server running on port ${port}.`);
});
