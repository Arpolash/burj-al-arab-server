const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const admin = require('firebase-admin');
require('dotenv').config()


const port = 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json());



var serviceAccount = require("./burj-al-arab-7ddbb-firebase-adminsdk-jdbsr-5a76ff692f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});

const password = "burjAlArab2020";

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sjfoa.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology : true  });

app.get('/', (req, res) => {
  res.send('Hello World!')
})


client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
 app.post('/addBooking', (req, res) =>{
     const newBooking = req.body;
     bookings.insertOne(newBooking)
     .then(result =>{
         res.send(result.insertedCount > 0)
     })
     
 })
 app.get('/bookings', (req,res) =>{
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
        const idToken = bearer.split(' ')[1];
        admin.auth().verifyIdToken(idToken)
            .then(function(decodedToken) {
            let tokenEmail = decodedToken.email;
            if(tokenEmail == req.query.email){
                     bookings.find({email : req.query.email})
                 .toArray((err,document) =>{
                     res.status(200).send(document)
                 })
            }
            else{
                res.status(401).send('un-authorized access')
            }
    
            }).catch(function(error) {
                res.status(401).send('un-authorized access')
            });
    }
    else{
        res.status(401).send('un-authorized access')
    }
 })
});

app.listen(process.env.PORT || port)