
<h3 align="center">TradeNote</h3>
<h4 align="center">- Open Source Day Trading Journal -</h4>


# The project
## About
TraderVue and TraderSync are great and very powerful trading journals. However, most of these tools are very limited in terms of control and customisations (data control, privacy, UI&UX customization, etc.). Moreover, I was missing some essential features for improving my day trading, like having a diary.

By creating and sharing TradeNote as an open source project, I hope to help other days traders like myself store, discover and recollect trade patterns so they can become and remain consistent and profitable traders.

![dashboard](https://f003.backblazeb2.com/file/7ak-public/tradenote/TradeNote-Dashboard.png "Dashboard")

## Dicsussions and Feeback
You can follow the project on [Discord](https://discord.gg/ZbHekKYb85 "Discord") and suggest and vote for new features via [Fider](https://fider.tradenote.co "Fider").

## Built with
The objective is to have a lightweight and fast website. As such, the website runs on static pages without any server, using VueJs, JS and HTML as well as [Parse](https://parseplatform.org/ "Parse") for its backend.

## Note
This project arose from a personal need and as such is most widely used (and tested) for intraday trades and using TradeZero Broker. However, I'm adding little by little other brokers. 

### Supported Brokers
Currently, you can add trades from the following brokers
 - TradeZero
 - MetaTrader

Please contact me via [Discord](https://discord.gg/ZbHekKYb85 "Discord") if you wish to integrate your broker.

Alternatively, you can use the [example file](https://github.com/Eleven-Trading/TradeNote/blob/main/example_tradezero_file.csv "example file") and adapt it to your export file.

### Type of trades
TradeNote works best for intraday stocks and forex trading. However, you can also import swing trades but you must make sure all imported trades are closed / that you do not have any open trades.

Please feel free to contribute if you want to see other brokers or vote for your broker via [Fider](https://fider.tradenote.co "Fider"). 


# Benefits
TradeNote is divided in 3 sections, each being an essential building block for becoming a consistent trading and managing your trading business.

### Measure
TradeNote offers a dashboard, daily view and calendar view so you can measure your progress. You can easily filter your trades by month or date range.


### Reflect
With TradeNote you can keep a daily diary of your trading journey to work on your trader psychology as well as add annotated screenshots of interesting setups or your entries. You can also write your (yearly) playbook.

### Anticipate
They say trading is like running a business so with TradeNote you can create a forecast so you can anticipate your P&L.


# Installation, Upgrade and Backup
## Prerequisite
This project uses [Parse](https://github.com/parse-community "Parse") as its backend framework. Parse is composed of 3 parts :
1. The Parse server that does all the "heavy lifting"
2. A mongo database where the data is stored
3. A dashboard for nicely displaying the mongo database

TradeNote uses Parse for the following reasons: 
1. Manage the authentification (flow)
2. Parse is a great framework for all API communications with the mongo database
3. Parse acts as the server so that TradeNote does not need to run any server on its own, making it faster and lighter. 

During the installation process, Parse is installed via Docker. If you use [Caprover](https://github.com/caprover/caprover "Caprover"), you can install Parse using One-Click Apps.

## Installation
You can install and run TradeNote using docker (the most common) or [Caprover](https://github.com/caprover/caprover "Caprover") (the easiest in my opinion).
### Docker
#### 1_ Clone the repository
```
git clone https://github.com/Eleven-Trading/TradeNote.git
```

#### 2_ Enter the cloned directory
```
cd TradeNote
```

#### 3_ Modify the env.env file 
Modify the "< >" inside the env.env file to match your environment
- <your_parse_app_id>: Set a random string as application ID, which will be used to connect to the Parse server (no spaces)
- <your_parse_master_key>: Set a random string as application ID, which can be used to make root connections to the Parse server (no spaces)
- <your_tradenote_parse_server_ip>: This is the ip where you are installing TradeNote. If you are installing locally, then this is simply localhost and if you are installing remotely then it is the remote ip address of your server(and please update http(s) accordingly).
- <your_parse_dashboard_user>: Parse comes with a dashboard where you can explore your data. Set username used for login into the Parse dashboard.
- <your_parse_dashboard_password>: Set password used for login into the Parse dashboard.
- <your_app_name>: Pick a name for your app e.g. TradeNote

#### 4_ Build the TradeNote Docker image
Fill out "< >" with the information you sett in step 2

```
docker build -f docker/Dockerfile . -t tradenote:latest --build-arg PARSE_APP_ID=<your_parse_app_id> --build-arg PARSE_URL=http://<your_tradenote_parse_server_ip>:1337/parse
```

#### 5_ Run up all the services
Parse comes with a dashboard for visualizing the data stored in the MongoDB. However, some users, mainly using Raspberry PI, have reported the need to install without Parse dashboard. Therefore, there are two options.


##### 5a_ Run TradeNote with parse-dashboard
   
```
docker-compose -f docker/docker-compose.yaml up -d
```   

##### 5b_ Run TradeNote without parse-dashboard.
```
docker-compose -f docker/docker-compose-without-dashboard.yaml up -d
```

#### 6_ Wait at least 1 minute
Wait for services up and data creation (IMPORTANT)

#### 7_ Register a user
Visit `http://<your_tradenote_parse_server_ip>:7777/register` to register a TradeNote user. Use any email and set a password

#### 8_ (Optional) Parse Dashboard
You can view your all the data stored in mongoDB using the Parse dashboard via `http://<your_tradenote_parse_server_ip>:4040`


### Caprover

#### 1_ Install Parse from One-Click Apps
#### 2_ Create your TradeNote app
#### 3_ Configure your TradeNote app
Under App Configs tab
   - Add environmental variables 
      - PARSE_APP_ID : your parse app id, configured during step 1
      - PARSE_URL : your parse server url, configured during step 1
   - Add port mapping 
      - Server Port: 7777
      - Container Port: 80
Hit Save or wait after deploying the app.

#### 4_ Clone the repository
```
git clone https://github.com/Eleven-Trading/TradeNote.git
```

#### 4_ Create a TAR file from the directory
#### 5_ Deploy
Under Deployment tab, add your TAR file

## Upgrade to new version
### Docker
#### 1_ Clone the repository
```
git clone https://github.com/Eleven-Trading/TradeNote.git
```

#### 2_ Enter the cloned directory
```
cd TradeNote
```

#### 3_ Build the TradeNote Docker image with your custom parameters
Fill out "< >" with the information you sett in step 2

```
docker build -f docker/Dockerfile . -t tradenote:latest --build-arg PARSE_APP_ID=<your_parse_app_id> --build-arg PARSE_URL=http://<your_tradenote_parse_server_ip>:1337/parse
```
#### 3_ Stop and remove container
1. List all containers `docker ps -a` and get the TradeNote container id
2. Stop the TradeNote container: `docker stop <container_id>`
3. Remove the TradeNote container: `docker rm <container_id>`

#### 4_ Stop and remove image
1. List all images `docker image ls` and get the TradeNote image id
2. Remove the TradeNote image: `docker rmi <image_id>`

#### 5_ Run the new TradeNote Docker image
```
docker run -d -p 7777:80 tradenote:latest
```

### Caprover
#### 1_ Clone the repository
```
git clone https://github.com/Eleven-Trading/TradeNote.git
```

#### 2_ Create a TAR file from the directory
#### 3_ Deploy
Under Deployment tab, add your TAR file

## Backup data
### Persistant data
During installation, mongoDB is runs with persistant data. This way, if you restart or update your mongoDB container, your data will not be lost.

### Backup mongoDB
Additionally, you can, and should, backup your database. 

For convenience, here is an example using [s3cmd](https://s3tools.org/s3cmd "s3cmd") for backing up your database. As this is not part of the TradeNote projet, I will unfortunately not be able to provide support on this part. But you will find more information about this on google and stackoverflow. 
1. Install [s3cmd](https://s3tools.org/s3cmd "s3cmd")
2. Configure the s3cfg config file
3. Run the [bash file](https://github.com/Eleven-Trading/TradeNote/blob/main/example_tradezero_file.csv "bash file") with the following 5 arguments: DATABASE_USER, DATABASE_PASSWORD, S3_BUCKET_NAME, S3_BUCKET_PATH, MONGO_DATABASE_NAME 


# Contribute
I'm a trader and recreational developer. My days are very packed but I will do my best to answer your questions and update the code when needed. As such, do not hesitate to contact me if you would like to contribute and help improve this project. Things to work on and improve:
- Add support to other trading platforms (currently, only TradeZero is supported)
- Currently, the code has only been tested for day trading and it would be interesting to add support for swing and multi-day trading
- Clean and optimize code
- Improve front end layout and develop new ideas
- And more...

# License
This project is open sourced under the GNU GPL v3 licence.
