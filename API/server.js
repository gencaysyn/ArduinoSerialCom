var express = require('express')
var bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express');

const app = express()
const port = 3000


// parse various different custom JSON types as JSON
app.use(bodyParser.json())

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

const mongoose = require('mongoose')
const DATABASE_URL = "mongodb+srv://gencay:gencay123@cluster0.beymx.mongodb.net/arddb?retryWrites=true&w=majority";
mongoose.connect(DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to database'))


var Sera = require("./model.js");


app.get('/', (req, res) => {
    res.sendFile(__dirname+'/index.html');
})


app.get('/all', (req, res) => {
    Sera.find({}, function (err, seras) {
        res.send(seras);
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


app.get('/sera/json/:seraid', function (req, res) {
    Sera.findById(req.params.seraid).then((sera)=>{
        if(sera)
            res.json({greenHouse: sera});
        else
            res.json({message: req.params.seraid+ " not found :("});
    })
})


app.get('/sera/:seraid', function (req, res) {
    Sera.findById(req.params.seraid).then((sera)=>{
        if(sera)
            res.render( "sera", {temp: sera.temperatures[sera.temperatures.length -1], name: sera.name, id: sera._id});
        else
            res.json({message: req.params.seraid+ " not found :("});
    })
    //res.sendFile(__dirname + '/sera');
})

app.post('/sera', (req, res) => {
    res.send("test selam")
})


app.put('/put/:seraid', function (req, res) {
    const body_params = req.body;
    console.log(body_params);
    Sera.findById(req.params.seraid).then((sera) => {
        if (!sera) {
            sera = new Sera();
            sera._id = req.params.seraid;
        }
        if(body_params.name){
            sera.name = body_params.name
        } else {
            sera.name = req.params.seraid + " serası";
        }
        if (body_params.temperature && body_params.temperature !=  -274) {
            sera.temperatures.push(body_params.temperature);
        }
        if (body_params.set_point) {
            sera.set_point = body_params.set_point;

        }
        if (body_params.is_active) {
            sera.is_active = body_params.is_active;
        }
        sera.save();
        res.json({greenHouse: sera, info: "başarıyla güncellendi."});
    }).catch((err) => {
        console.log(err)
        res.json({error: err})
    })

})