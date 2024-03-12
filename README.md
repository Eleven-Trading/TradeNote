
<h2 align="center">TradeNote</h2>
<h4 align="center" style='margin-bottom:30px'>- Open Source Trading Journal -</h4>


# The project
### About
There are numerous great and very powerful trading journals out there. However, I wanted to build a journal for traders who care about data security and privacy but also for individuals that need simplicity and flexibility.

By creating and sharing TradeNote as an open source project, I hope to help other days traders like myself store, discover and recollect trade patterns so they can become and remain consistent and profitable traders.

![dashboard](https://f003.backblazeb2.com/file/7ak-public/tradenote/TradeNote-Dashboard.png "Dashboard")

### Project
#### Dicsussions and Feeback
For support or feedback, feel free to join our [Discord](https://discord.gg/ZbHekKYb85 "Discord"), or create an issue on this repository.

#### Upcoming features
You can see upcoming features and project development on the [project page](https://github.com/orgs/Eleven-Trading/projects/1 "Project").

#### Built with
TradeNote is a responsive website that runs on VueJs, JS and HTML and uses [Parse](https://parseplatform.org/ "Parse") for its backend.

#### Coffee
If you like this project, <font size="5">please 🌟 this repository</font> and don't hesitate to show me <s>the money</s> love ;)
<p><a href='https://ko-fi.com/eleven70433' target='_blank'><img height='35' style='margin-top:20px;border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a></p>


# TradeNote
### Structure
TradeNote is divided in 2 sections, each being an essential building block for becoming a consistent trading and managing your trading business.

#### Analyze
TradeNote offers a dashboard, daily view and calendar view so you can measure your progress. You can easily filter your trades by month or date range.


#### Reflect
With TradeNote you can keep a daily diary of your trading journey to work on your trader psychology as well as add annotated screenshots of interesting setups or your entries. You can also write your (yearly) playbook.

### Trades, Assets and Brokers
#### Supported trades
TradeNote supports intraday and swing trades but keep in mind that the project arose from a personal need and as such is most widely used (and tested) for intraday stock trades (using TradeZero Broker).

#### Supported Assets. 
Depending on the broker and thanks to the contribution of the community, you can import and journal the following assets in TradeNote: Stocks, Futures, Options (only tested on single options) and Forex. 

#### Supported Brokers
Please look at the [brokers folder](https://github.com/Eleven-Trading/TradeNote/blob/main/brokers "brokers folder") to see the list of supported brokers and instructions for exporting and importing to TradeNote.

You can contact me via [Discord](https://discord.gg/ZbHekKYb85 "Discord") if you wish to integrate your broker.

Alternatively, you can use the [template](https://github.com/Eleven-Trading/TradeNote/blob/main/brokers/Template.csv "template") and adapt it to your export file.

### Screenshots
##### Dashboard
![dashboard](https://f003.backblazeb2.com/file/7ak-public/tradenote/TradeNote-Dashboard.png "Dashboard")

##### Daily Page
On daily page you can see your trades per day. You can add tags and a note to each of you trades. Moreover, you can specify your satisfaction with the trade (for example if you followed or not your rules) with thumbs up or down. 

![Add Trade Information](https://f003.backblazeb2.com/file/7ak-public/tradenote/Capture%20d%E2%80%99%C3%A9cran%202023-03-26%20%C3%A0%2015.04.03.png "Add Trade Information")
![Daily Page](https://f003.backblazeb2.com/file/7ak-public/tradenote/Capture%20d%E2%80%99%C3%A9cran%202023-03-26%20%C3%A0%2015.05.34.png "Daily Page")

##### Diary Page
Besides notes for every trade, you can record things related to your every day trading, like feelings, moods and emotions or more technical related issues like patterns, in order to make important discoveries.  

![Add Journal Entry](https://f003.backblazeb2.com/file/7ak-public/tradenote/Capture%20d%E2%80%99%C3%A9cran%202023-03-26%20%C3%A0%2015.08.41.png "Add Journal Entry")

![Journal Page](https://f003.backblazeb2.com/file/7ak-public/tradenote/Capture%20d%E2%80%99%C3%A9cran%202023-03-26%20%C3%A0%2015.08.53.png "Journal Page")

##### Add Screenshots
Upload screenshots of you trades ("Entry" option) or simply an interesting setup you have identified ("Setup" option) and make annotations for further analysis.

![Add Screenshot](https://f003.backblazeb2.com/file/7ak-public/tradenote/Capture%20d%E2%80%99%C3%A9cran%202023-03-26%20%C3%A0%2015.07.02.png "Add Screenshots")

![Screenshots Page](https://f003.backblazeb2.com/file/7ak-public/tradenote/Capture%20d%E2%80%99%C3%A9cran%202023-03-26%20%C3%A0%2015.07.16.png "Screenshots Page")

# Setup
## Installation
### ❗Important Notice ❗
#### MongoDB
TradeNote uses MongodDB as its database. Please make sure to follow MongoDB's recommendations and requirements before installing and running TradeNote with MongoDB. 

For detailed information, please read MongdoDB's [production notes ](https://www.mongodb.com/docs/manual/administration/production-notes/#platform-support  "production notes").

#### RaspberryPi
Some users have experienced issues running MongoDB on a Raspberry Pi. At the time of writing, they managed to make it work using v4.4.8 of MongoDB rather than the latest version.

#### Windows with Ubuntu VM
MongoDB 5.0+ version is (currently) not compatible with Ubuntu VM on windows platform. Indeed, MongoDB 5.0+ needs a CPU that supports AVX, which seems like a known issue with latest version of MongoDB 5.0+ and Windows+Ubuntu VM. A workaround is to use MongoDB 4.4.18 (last known version that does not need AVX support) in the docker compose file. 

#### Other issues
Here is the list of the other, most common issues
- Your server / computer cannot run MongoDB (see above).
- Docker is not running on your server / computer.
- The required ports are not open on your server / computer.
- You are running an incompatible NodeJs or MongoDB version with Parse Server ([compatibility table](https://github.com/parse-community/parse-server#compatibility "compatibility table")).
- You already have a MongoDB instance running which is interfering with the installation process.

If you have any other issues, please visite the [Discord](https://discord.gg/ZbHekKYb85 "Discord") #installation channel and use the search bar to see if your issue has already been discussed. 


### Docker Compose (recommended)
#### Requirements
- Docker
- Docker Compose
- Node 18.X

#### Installation
1. Download the docker-compose.yml file
2. Run `docker compose up -d`

This will automatically setup the database (mongodDB) and the TradeNote app.

You can then access the website on http://localhost:8080.

If you cannot access the website, please refer to the importante notice above (and try changing the mongo version) or get support via [Discord](https://discord.gg/ZbHekKYb85 "Discord")

### Docker
#### Requirements
- Docker
- Node 18.X
- MongoDB

#### Installation
You need to have a running MongoDB database. Please see their [Docker Hub](https://hub.docker.com/_/mongo "Docker Hub") for instructions.

Then, run the TradeNote image with its environment variables.

```
docker run \
    -e MONGO_URI=<mongo_uri> \
    -e TRADENOTE_DATABASE=<tradenote_database>
    -e APP_ID=<app_id> \
    -e MASTER_KEY=<master_key> \
    -e TRADENOTE_PORT=<tradenote_port> \
    -p <tradenote_port>:<tradenote_port> \
    --name tradenote_app \
    -d eleventrading/tradenote
```
- **MONGO_URI**: The MongoDB connection string, with tradenote database name and enforced access control ([explanation](https://www.mongodb.com/docs/manual/reference/connection-string/ "explanation")). You can use any MongoDB instance you like. If you are using Docker, you can use the default MongoDB instance. (example: mongodb://tradenote:tradenote@mongo:27017/tradenote?authSource=admin)
- **TRADENOTE_DATABASE**: The TradeNote database name in the MongoDB (example: tradenote)
- **APP_ID**: Set a random string as application ID, which will be used to connect to the backend (no spaces) (example: 12345).
- **MASTER_KEY**: Set a random string as master key, which will be used to make root connections to the backend (no spaces) (example: 12345)
- **TRADENOTE_PORT**: TradeNote port number, from which you wish to serve the website. (example: 8080)

### Local installation (advanced)
#### Docker
If you want to run the latest version of TradeNote you can also build the image locally, directly from GitHub repository.

1. Clone from github
2. cd into TradeNote directory 
3. Run
    - For Docker Compose : Run `docker compose -f docker-compose-local.yml up -d`
    - For Docker: run `docker build -f docker/Dockerfile . -t tradenote:<tag>`

#### Dev Mode
1. Clone the project (Master or Beta branch)
2. cd into your project
3. Run `npm install`
4. Run `APP_ID=xxx MASTER_KEY=xxx ANALYTICS_OFF="true" MONGO_USER=xxx MONGO_PASSWORD=xxx TRADENOTE_DATABASE=xxx MONGO_URL=xxx MONGO_PORT=xxx TRADENOTE_PORT=xxx NODE_ENV='dev' node index.js`

## First Steps
### Registering a User
Start by registering a user. Visit `http://localhost:8080/register` to register a TradeNote user.
- Use any (random) email and set a password.
- Choose your broker and/or account timezone.

### Importing Trades
#### Instructions
Please make sure to follow the instructions in the [brokers folder](https://github.com/Eleven-Trading/TradeNote/blob/main/brokers "brokers folder") for exporting and importing trades. 


#### Swing trades
❗Important Notice❗
- Importing swing trades is currently in beta phase and being tested. Please use [Discord](https://discord.gg/ZbHekKYb85 "Discord") if you have questions or comments.
- Importing swing trades is prone to P&L Discrepancy and it is therefore crucial to follow the instructions below.

##### Avoiding P&L Discrepancy
To avoid open positions and/or P&L Discrepancy when importing swing trades, please make sure of the following. 
1. Begin importing from a point in time where you were flat (no previous open positions). If you begin importing from a point in time where you had pre-existing positions, there is a chance the data will be incorrect as TradeNote doesn’t know about these existing positions. 
2. Alternatively, before importing your file, if you know it contains execution(s) from an open position (and that you're closing or adding to), simply remove that/these execution(s).

Example 1 (recommended)
- You remember that on the 10th of August 2022 you did not have any open trades from before the 10th of August 2022
- You import your trades between 10/08/22-30/11/2023.
- From there, if you later decide to import trades before 10/08/22 they will likely be inaccurate and cause future discrepancies.
- If you import trades in between the dates, for example on the 12/03/2023, it will say "already imported" (this is standard TradeNote behavior - you cannot import already imported dates)
- If you import trades after 30/11/23 it will work.
- The best is to start with a clean TradeNote database but it is not mandatory as long as you respect these steps.

Example 2 (advanced)
- You want to start your imports 10th of August 2022, but you know you have 1 open trade from before.
- You want to import your trades between 10/08/22-30/11/2023 and you know that you closed the open trade on the 20th of August 2022. 
- Edit your export file on the 20th of August 2022 by removing all executions related to closing the mentioned trade.
- The reste of the process is the same as example 1.

##### P&L Calculation and View
When you have an open trade you will see "Open" in the time column on the daily page and "Closed" when the swing trade has been closed. Hover your mouse over the question mark to get information when the trade was opened and closed. 

P&L as well as partial close is calculated on the closing day.

## Side note
### Parse
This project uses [Parse](https://github.com/parse-community "Parse") as its backend framework, for the following reasons: 
1. Manage the authentication (flow)
2. Parse is a great framework for all API communications with the mongo database
3. Parse acts as the server so that TradeNote does not need to run any server on its own, making it faster and lighter. 

### Viewing the database (optional)
Additionally, if you want to view and manage the database, you can use [MongoDB Compass](https://github.com/parse-community "MongoDB Compass") or install and run the [Parse Dashboard](https://github.com/parse-community/parse-dashboard "Parse Dashboard").

### PostHog
This projects uses [PostHog](https://github.com/PostHog/posthog "PostHog") as its product analytics suite to collect <u>anonymous</u> analytics about TradeNote installations and page views. This helps me better understand if and how people are using TradeNote and evaluate the outreach of my project. If you want to opt-out of this program, you can simply add `-e ANALYTICS_OFF=true` when running the docker image. 


## Backup data
### Persistent data
During installation, mongoDB runs with persistent data. This way, if you restart or update your mongoDB container, your data will not be lost.

### Backup mongoDB
Additionally, you can, and should, backup your database. 

For convenience, here is an example using [s3cmd](https://s3tools.org/s3cmd "s3cmd") for backing up your database. As this is not part of the TradeNote projet, I will unfortunately not be able to provide support on this part. But you will find more information about this on google and stackoverflow. 
1. Install [s3cmd](https://s3tools.org/s3cmd "s3cmd")
2. Configure the s3cfg config file
3. Run the [bash file](https://github.com/Eleven-Trading/TradeNote/blob/main/backup-mongodb.sh "bash file") with the correct variables


# Contribute
I'm a trader and recreational developer. My days are very packed but I will do my best to answer your questions and update the code when needed. As such, do not hesitate to contact me if you would like to contribute and help improve this project. Things to work on and improve:
- Add support to other trading platforms
- Currently, the code has only been tested for day trading and it would be interesting to add support for swing and multi-day trading
- Improve front end layout and develop new ideas
- And more...

# License
This project is open sourced under the GNU GPL v3 licence.
