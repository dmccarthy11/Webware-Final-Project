require('dotenv').config()
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const helmet = require('helmet');
const bcrypt = require('bcrypt');

const itemTypes = {
    CANNEDJARRED: "canned-jarred",
    DAIRY: "dairy",
    DRYBAKING: "dry-baking",
    FROZEN: "frozen",
    GRAINS: "grains",
    MEAT: "meat",
    PRODUCE: "produce",
    OTHER: "other",
  }

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@${process.env.HOST}/database?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true,});
let collection = null

// Init express application
const app = express();

// Start listening on defined port
app.listen(process.env.PORT || 3000, () => {
    console.log('Now listening on port ' + process.env.PORT || 3000);
});

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet({
    crossOriginEmbedderPolicy: false
}));

// Serve React build
app.use(express.static(__dirname + "/client/build"));

// Get routes
app.get("/user-data", (req, resp) => {
    const userId = req.query.id;
    // Fetch user data from DB

    if (!userId) { // Guard clause
        resp.end();
    }
    client.connect((err, client) => {
        if (err) {
            throw err;
        } else {
            // If DB connection is successful
            const db = client.db("database");
            db.collection("data").findOne({"_id": new ObjectId(userId)}, {}, (err, res) => {
                if (err) {
                    throw err;
                } else {
                    // Found user document
                    const body = {
                        cannedJarredData: res.cannedJarredData,
                        dairyData: res.dairyData,
                        dryBakingData: res.dryBakingData,
                        frozenData: res.frozenData,
                        grainsData: res.grainsData,
                        meatData: res.meatData,
                        produceData: res.produceData,
                        otherData: res.otherData
                    }
                    resp.json(JSON.stringify(body));
                    resp.end();
                }
            })
        }
    })
})

app.post("/add-item", (req, resp) => {
    const data = req.body;
    if (!data) { // Guard clause
        resp.end();
    }
    client.connect((err, client) => {
        if (err) {
            throw err;
        } else {
            // If DB connection is successful
            const db = client.db("database");
            db.collection("data").findOne({"_id": new ObjectId(data.userId)}, {}, (err, res) => {
                if (err) {
                    throw err;
                } else {
                    // Found user document
                    // Edit correct field 
                    const array = null;
                    const field = null;
                    switch(data.itemType) {
                        case itemTypes.CANNEDJARRED:
                            array = res.cannedJarredData;
                            field = "cannedJarredData";
                            break;
                        case itemTypes.DAIRY:
                            array = res.dairyData;
                            field = "dairyData";
                            break;
                        case itemTypes.DRYBAKING:
                            array = res.dryBakingData;
                            field = "dryBakingData";
                            break;
                        case itemTypes.FROZEN:
                            array = res.frozenData;
                            field = "frozenData";
                            break;
                        case itemTypes.GRAINS:
                            array = res.grainsData;
                            field = "grainsData";
                            break;
                        case itemTypes.MEAT:
                            array = res.meatData;
                            field = "meatData";
                            break;
                        case itemTypes.PRODUCE:
                            array = res.produceData;
                            field = "produceData";
                            break;
                        case itemTypes.OTHER:
                            array = res.otherData;
                            field = "otherData";
                            break;
                        default:
                            array = null;
                            field = null;
                            break;
                    }
                    if (!array) {
                        resp.end();
                    }
                    array.push(data.newItem);
                    db.collection("users").updateOne({"_id": new ObjectId(data.userId)}, { $set: {field: array} }, (err, result) => {
                        if (err) {
                            throw err;
                        } else {
                            const body = {
                                error: false
                            }
                            resp.json(JSON.stringify(body));
                            resp.end();
                        }
                    });   
                    resp.json(JSON.stringify(body));
                    resp.end();
                }
            })
        }
    })
})

// Default get
app.get("*", (req, res) => {
    res.sendFile(__dirname + "/build/index.html")
});