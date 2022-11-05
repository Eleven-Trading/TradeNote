
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
This project arose from a personal need and as such is most widely used (and tested) for intraday trades and using TradeZero Broker. However, I'm adding little by little other brokers. Currently, supported brokers are
 - TradeZero
 - MetaTrader

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


# Installation
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
### Docker
#### 1. Clone the repository
```
git clone https://github.com/Eleven-Trading/TradeNote.git
```

#### 2. Modify the "< >" inside the env.env file to match your environment
- <your_parse_app_id>: Set a random string as application ID, which will be used to connect to the Parse server (no spaces)
- <your_parse_master_key>: Set a random string as application ID, which can be used to make root connections to the Parse server (no spaces)
- <your_parse_server_ip>: This will be your Parse server URL. If you are installing TradeNote locally, then this is simply http://localhost and if you are installing remotely then it is the remote ip address of your server.
- <your_parse_dashboard_user>: Parse comes with a dashboard where you can explore your data. Set username used for login into the Parse dashboard.
- <your_parse_dashboard_password>: Set password used for login into the Parse dashboard.
- <your_app_name>: Pick a name for your app e.g. TradeNote

#### 3. Enter the cloned directory
```
cd docker
```
#### 4. Build Docker image with your custom parameters (fill out "< >" with the information you sett in step 2)

```
docker build -f docker/Dockerfile . -t tradenote:latest --build-arg PARSE_APP_ID=<your_parse_app_id> --build-arg PARSE_URL=<your_parse_server_url>
```

#### 5. Run up all the services
There are two options: you can run TradeNote with Parse Dashboard or without


##### 5a. Run TradeNote with parse-dashboard
   
```
docker-compose up -d
```   

##### b. Run TradeNote without parse-dashboard.
  This may be interesting in certain cases when you're running TradeNote on Raspberry Pi.

```
docker-compose -f docker-compose-without-dashboard.yaml up -d
```

#### 6. wait at least 1 minute for services up and data creation (IMPORTANT)

#### 7. Register via http://<your_ip>:7777/register


### Caprover
If you are using [Caprover](https://github.com/caprover/caprover "Caprover"), you can deploy directly thanks to the existing captain-definition file.
1. Install Parse from One-Click Apps
2. Create an app in Caprover and in "App Configs" add the following variables: 
   - PARSE_APP_ID : your parse app id
   - PARSE_URL : your parse server url
3. Deploy TradeNote using the captain-definition file


# Contribute
I'm a trader and recreational developer. My days are very packed but I will do my best to answer your questions and update the code when needed. As such, do not hesitate to contact me if you would like to contribute and help improve this project. Things to work on and improve:
- Add support to other trading platforms (currently, only TradeZero is supported)
- Currently, the code has only been tested for day trading and it would be interesting to add support for swing and multi-day trading
- Clean and optimize code
- Improve front end layout and develop new ideas
- And more...

# License
This project is open sourced under the GNU GPL v3 licence.
