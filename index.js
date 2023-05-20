const express = require('express');
const ParseServer = require('parse-server').ParseServer;
//var ParseDashboard = require('parse-dashboard');
const Parse = require('parse/node');
const path = require('path');
const fs = require('fs');
const Vite = require('vite');

var app = express();

const port = 7788;
const PROXY_PORT = 39482;

// SERVER

let server = null

const startIndex = async() => {

    const startServer = async() => {
        console.log("\nSTARTING NODEJS SERVER")
        return new Promise(async(resolve, reject) => {
            server = app.listen(port, function() {
                console.log('\nTradeNote server started on http://localhost:' + port)
            });
            resolve(server)
        })
    }

    const runServer = async() => {
        console.log("\nRUNNING SERVER")
        return new Promise(async(resolve, reject) => {
            if (process.env.NODE_ENV == 'dev') {

                const Proxy = require('http-proxy');

                var proxy = new Proxy.createProxyServer({
                    target: { host: 'localhost', port: PROXY_PORT }
                });

                // proxy anything yet-unhandled back to vite
                app.get('*', (req, res) => proxy.web(req, res));

                // proxy hmr ws back to vite
                server.on('upgrade', (req, socket, head) => {
                    if (req.url == '/') proxy.ws(req, socket, head)
                });

                // start our vite dev server
                const vite = await Vite.createServer({ server: { port: PROXY_PORT } });
                vite.listen();
                console.log(" -> Running vite dev server")
                resolve()

            } else {
                app.use(express.static('dist'))
                app.get('*', function (request, response) {
                    response.sendFile(path.resolve('dist', 'index.html'));
                  });
                console.log(" -> Running prod server")
                resolve()
            }
        })
    }

    const setupParseServer = async() => {
        console.log("\nSETTING UP PARSE SERVER")
        return new Promise(async(resolve, reject) => {
            const serv = new ParseServer({
                databaseURI: process.env.MONGO_URI,
                appId: process.env.APP_ID,
                masterKey: process.env.MASTER_KEY,
                port: port
            });

            // EXPRESS USE
            await serv.start().then(() => {
                app.use('/parse', serv.app);
                resolve()
            })            
        })
    }

    await startServer()
    await setupParseServer()
    await runServer()

    /*var parseDashboard = new ParseDashboard({
        "apps": [{
            "serverURL": "/parse",
            "appId": process.env.APP_ID,
            "masterKey": process.env.MASTER_KEY,
            "appName": "TradeNote"
        }],
        "trustProxy": true
    });*/



    if (process.env.PARSE_DASHBOARD) app.use('/parseDashboard', parseDashboard)

    //INIT
    console.log("\nInitializing Parse")
    Parse.initialize(process.env.APP_ID)
    Parse.serverURL = "http://localhost:" + port + "/parse"
    Parse.masterKey = process.env.MASTER_KEY

    //API

    app.post("/parseAppId", (req, res) => {
        console.log("\nAPI : post APP ID")
        res.send(process.env.APP_ID)
    });

    app.post("/posthog", (req, res) => {
        //console.log("\nAPI : posthog")
        if (process.env.ANALYTICS_OFF) {
            res.send("off")
        } else {
            res.send("phc_FxkjH1O898jKu0yiELC3aWKda3vGov7waGN0weU5kw0")
        }
    });

    app.post("/updateSchemas", async(req, res) => {
        //console.log("\nAPI : post update schema")

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

}

startIndex()