const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const app = express();
const server = require('http').createServer(app);
require('./auth');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
// db

mongoose.connect('mongodb://localhost/map', {
    useNewUrlParser: true
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
const deliveryRequestSchema = new mongoose.Schema({
  customerName: String,
  lat: Number,
  lng: Number,
  phoneNumber: String,
  deliveryDate: Date,
  status: String,
  droneNo:Number
});

const DeliveryRequest = mongoose.model('DeliveryRequest', deliveryRequestSchema);
// auth
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.use(session({
  secret: 'Delivery System',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.render("main")
});

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile']
  }));

app.get('/login/google',
  passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure'
  })
);

app.get('/protected', isLoggedIn, function(req, res) {
  res.render("index", {
    user: req.user
  });
});

app.get('/admin', (req, res) => {

  DeliveryRequest.find()
    .then(deliveryRequests => {
      res.render('admin', {
        deliveryRequests
      });
    })
    .catch(err => console.log(err));
});

app.get('/package-history', (req, res) => {
  DeliveryRequest.find({}, (err, deliveryRequests) => {
    if (err) {
      console.log(err);
    } else {
      res.render('package-history', { deliveryRequests });
    }
  });
});

app.post('/update-delivery-request', (req, res) => {
  const { id, status, droneNo} = req.body;
  console.log(req.body);

  if(req.body.approve){
    DeliveryRequest.findById(id, (err, deliveryRequest) => {
      if (err) {
        console.log(err);
      } else {
        deliveryRequest.status = status;
        deliveryRequest.droneNo= droneNo;

        deliveryRequest.save()
          .then(() => {
            res.redirect('/admin');
          })
          .catch(err => console.log(err));
      }
    });
  }
  if(req.body.Delete){
    DeliveryRequest.findByIdAndDelete(id, function (err, docs) {
      if (err){
          console.log(err)
      }
      else{
          console.log("Deleted : ", docs);

            res.redirect('/admin');

      }
  });

  }


});
app.post('/delivery-request', (req, res) => {
  const deliveryRequest = new DeliveryRequest({
    lat: req.body.latitude,
    lng: req.body.longitude,
    customerName: req.body.customerName,
    phoneNumber: req.body.phoneNumber,
    deliveryDate: req.body.deliveryDate,
    status: "Received"
  });

  deliveryRequest.save()
    .then(() => {
      res.send("Your Delivery has been recorded. Thanks for visiting");
    })
    .catch(err => console.log(err));
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
server.listen(port, () => {
  console.log("server hosted");
});
