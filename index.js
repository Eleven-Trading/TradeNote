const express = require('express');
const ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
const Parse = require('parse/node');
const axios = require('axios');
const fs = require('fs');

var app = express();

// SDK
const parseServer = new ParseServer({
    databaseURI: process.env.MONGO_URI,
    appId: process.env.APP_ID,
    masterKey: process.env.MASTER_KEY,
    port: 7777
});

var parseDashboard = new ParseDashboard({
    "apps": [{
        "serverURL": "/parse",
        "appId": process.env.APP_ID,
        "masterKey": process.env.MASTER_KEY,
        "appName": "TradeNote"
    }]
});


// EXPRESS USE
app.use('/parse', parseServer);
app.use('/parseDashboard', parseDashboard);
app.use(express.static('dist', {
    extensions: ['html', 'htm'],
}))


//INIT
Parse.initialize(process.env.APP_ID)
Parse.serverURL = "http://localhost:7777/parse"
Parse.masterKey = process.env.MASTER_KEY
    //Parse.initialize(process.env.APP_ID, "", process.env.MASTER_KEY)
    //Parse.serverURL = "http://localhost:7777/parse"

//API

app.post("/parseAppId", (req, res) => {
    res.send(process.env.APP_ID)
});

app.post("/updateSchemas", async(req, res) => {
    console.log("updateshemas")

    let rawdata = fs.readFileSync('requiredClasses.json');
    let schemasJson = JSON.parse(rawdata);
    //console.log("schemasJson "+JSON.stringify(schemasJson))

    let existingSchema = []
    const getExistingSchema = await Parse.Schema.all()
    console.log(" -> Get existing schema " + JSON.stringify(getExistingSchema))
    getExistingSchema.forEach(element => {
        existingSchema.push(element.className)
    });
    console.log(" -> Existing Schema " + existingSchema)

    const uploadSchema = (param1, param2, param3) => {
        return new Promise((resolve, reject) => {
            const mySchema = new Parse.Schema(param1);
            if (param2[param3].type === "String") mySchema.addString(param3)
            if (param2[param3].type === "Number") mySchema.addNumber(param3)
            if (param2[param3].type === "Boolean") mySchema.addBoolean(param3)
            if (param2[param3].type === "Date") mySchema.addDate(param3)
            if (param2[param3].type === "File") mySchema.addFile(param3)
            if (param2[param3].type === "GeoPoint") mySchema.addGeoPoint(param3)
            if (param2[param3].type === "Polygon") mySchema.addPolygon(param3)
            if (param2[param3].type === "Array") mySchema.addArray(param3)
            if (param2[param3].type === "Object") mySchema.addObject(param3)
            if (param2[param3].type === "Pointer") mySchema.addPointer(param3, param2[param3].targetClass)
            if (param2[param3].type === "Relation") mySchema.addRelation(param3, param2[param3].targetClass)

            //console.log("existing schema "+existingSchema)
            //console.log("includes ? "+existingSchema.includes(className))
            if (existingSchema.includes(param1)) {
                mySchema.update().then((result) => {
                    console.log(" -> Updated schema " + JSON.stringify(result))
                    resolve()
                })
            } else {
                mySchema.save().then((result) => {
                    console.log(" -> Save new schema " + JSON.stringify(result))
                    existingSchema.push(param1)
                    console.log(" -> Existing Schema " + existingSchema)
                    resolve()
                })
            }
        })
    }

    for (let i = 0; i < schemasJson.length; i++) {
        //console.log("el " + schemasJson[i].className)
        let className = schemasJson[i].className
        let obj = schemasJson[i].fields
        for (const key of Object.keys(obj)) {
            //console.log(key, obj[key]);
            if (key != "objectId" && key != "updatedAt" && key != "createdAt" && key != "ACL") {
                console.log(" -> Key " + key)
                await uploadSchema(className, obj, key)
            }

        }
    }
    res.sendStatus(200)

})

// SERVER
const port = 7777;
app.listen(port, function() {
    console.log('TradeNote running on port ' + port + '.');
});