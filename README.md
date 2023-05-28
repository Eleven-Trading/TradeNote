
<h2 align="center">TradeNote</h2>
<h4 align="center" style='margin-bottom:30px'>- Open Source Trading Journal -</h4>


# The project
## About
There are numerous great and very powerful trading journals out there. However, most of these tools are very limited in terms of control and customisations (data control, privacy, UI&UX customization, etc.). Moreover, I was missing some essential features for improving my day trading, like having a diary or taking and annotating screenshots.

By creating and sharing TradeNote as an open source project, I hope to help other days traders like myself store, discover and recollect trade patterns so they can become and remain consistent and profitable traders.

![dashboard](https://f003.backblazeb2.com/file/7ak-public/tradenote/TradeNote-Dashboard.png "Dashboard")

## Dicsussions and Feeback
You can follow the project, get support and suggest new features on [Discord](https://discord.gg/ZbHekKYb85 "Discord").

## Built with
The objective is to have a lightweight and fast website. As such, the website runs on static pages, using VueJs, JS and HTML and uses [Parse](https://parseplatform.org/ "Parse") for its backend.

## Note
This project arose from a personal need and as such is most widely used (and tested) for intraday trades and using TradeZero Broker. However, I'm adding little by little other brokers. 

### Supported Brokers
Currently, you can add trades from the following brokers
 - TradeZero
 - MetaTrader 5
 - TD Ameritrade
 - TradeStation
 - Interactive Brokers

Please look at the [brokers folder](https://github.com/Eleven-Trading/TradeNote/blob/main/brokers "brokers folder") to see the export format for you broker.

You contact me via [Discord](https://discord.gg/ZbHekKYb85 "Discord") if you wish to integrate your broker.

Alternatively, you can use the [template](https://github.com/Eleven-Trading/TradeNote/blob/main/brokers/Template.csv "template") and adapt it to your export file.

### Type of trades
TradeNote works best for intraday US stocks. However, you can also import swing trades but you must make sure all imported trades are closed / that you do not have any open trades.

### Upcoming features
You can see upcoming features on [Trello](https://trello.com/b/GOqJSF2v/tradenote "Trello").

## Buy me coffee
If you like this project, don't hesitate to show me <s>the money</s> love ;)
<p><a href='https://ko-fi.com/eleven70433' target='_blank'><img height='35' style='margin-top:20px;border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a></p>

# TradeNote
TradeNote is divided in 2 sections, each being an essential building block for becoming a consistent trading and managing your trading business.

### Measure
TradeNote offers a dashboard, daily view and calendar view so you can measure your progress. You can easily filter your trades by month or date range.

#### Dashboard
![dashboard](https://f003.backblazeb2.com/file/7ak-public/tradenote/TradeNote-Dashboard.png "Dashboard")

#### Daily Page
On daily page you can see your trades per day. You can add pattern, mistake and note to each of you trades. Moreover, you can specify your satisfaction with the trade (for example if you followed or not your rules) with thumbs up or down. 

![Add Trade Information](https://f003.backblazeb2.com/file/7ak-public/tradenote/Capture%20d%E2%80%99%C3%A9cran%202023-03-26%20%C3%A0%2015.04.03.png "Add Trade Information")
![Daily Page](https://f003.backblazeb2.com/file/7ak-public/tradenote/Capture%20d%E2%80%99%C3%A9cran%202023-03-26%20%C3%A0%2015.05.34.png "Daily Page")


### Reflect
With TradeNote you can keep a daily diary of your trading journey to work on your trader psychology as well as add annotated screenshots of interesting setups or your entries. You can also write your (yearly) playbook.

#### Diary Page
Besides notes for every trade, you can record things related to your every day trading, like feelings, moods and emotions or more technical related issues like patterns, in order to make important discoveries.  

![Add Journal Entry](https://f003.backblazeb2.com/file/7ak-public/tradenote/Capture%20d%E2%80%99%C3%A9cran%202023-03-26%20%C3%A0%2015.08.41.png "Add Journal Entry")

![Journal Page](https://f003.backblazeb2.com/file/7ak-public/tradenote/Capture%20d%E2%80%99%C3%A9cran%202023-03-26%20%C3%A0%2015.08.53.png "Journal Page")

#### Screenshots Page
Upload screenshots of you trades ("Entry" option) or simply an interesting setup you have identified ("Setup" option) and make annotations for further analysis.

![Add Screenshot](https://f003.backblazeb2.com/file/7ak-public/tradenote/Capture%20d%E2%80%99%C3%A9cran%202023-03-26%20%C3%A0%2015.07.02.png "Add Screenshots")

![Screenshots Page](https://f003.backblazeb2.com/file/7ak-public/tradenote/Capture%20d%E2%80%99%C3%A9cran%202023-03-26%20%C3%A0%2015.07.16.png "Screenshots Page")






# Installation, Upgrade and Backup

## Docker
### MongoDB
Your data will be stored on your terms, in a [MongoDB](https://hub.docker.com/_/mongo "MongoDB") database. As such, you must have a running mongoDB and you will be asked to proved the URI with the database name.

If you already have an existing MongoDB running and want to use it, you can skip this step. Otherwise, you can install MongoDB on a user-defined bridge with following steps
#### 1_ Create network
```
docker network create tradenote-net
```
#### 2_ Pull image
```
docker pull mongo:latest
```
#### 3_ Run MongoDB
```
docker run -e MONGO_INITDB_ROOT_USERNAME=<MONGO_INITDB_ROOT_USERNAME> -e MONGO_INITDB_ROOT_PASSWORD=<MONGO_INITDB_ROOT_PASSWORD> -v mongo_data:/data/db -p 27017:27017 --name tradenote-mongo --net tradenote-net -d mongo:latest
```
Run the image with the following environment variables
- <MONGO_INITDB_ROOT_USERNAME>: Username for authenticating to the MongoDB database.
- <MONGO_INITDB_ROOT_PASSWORD>: Password for authenticating to the MongoDB database.

### TradeNote
#### 1_ Pull image from DockerHub
Pull image from [DockerHub](https://hub.docker.com/r/eleventrading/tradenote/tags "DockerHub")
- Stable, production tags are simply identified by version number. Example 7.7.7. The community and myself do our best to test and limit bugs on stable versions but if you encounter any please let me know via GitHub issues or Discord. 
- Development, beta or test tags are marked with an underscore and description. Example : 7.7.7_beta

```
docker pull eleventrading/tradenote:<tag>
```
Alternatively, you can [build the image](#build-image-locally) yourself 

#### 2_ Run image
```
docker run -e MONGO_URL=<MONGO_URL> -e MONGO_PORT=<MONGO_PORT> -e MONGO_USER=<MONGO_USER> -e MONGO_USER=<MONGO_PASSWORD> -e TRADENOTE_DATABASE=<TRADENOTE_DATABASE> -e APP_ID=<APP_ID> -e MASTER_KEY=<MASTER_KEY> -p 7777:7777 --name tradenote-app --net tradenote-net -d eleventrading/tradenote:<TAG>
```
Run the image with the following environment variables
- <MONGO_URL>: Enter one of the following information : 
   - If you have followed the above MongoDB installation process and created a network ("tradenote-net"), simply use the container name ("tradenote-mongo").
   - If you have an existing MongoDB running on a local network, you can either connect it to the network by creating the network (`docker network create tradenote-net`) running `docker network connect tradenote-net <container_name>` and then use the container name or connect it using your MongoDB container IP (you can find it by running `docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container_name>`)
   - If you have an existing MongoDB on a remote network, simply use the remote IP address
- <MONGO_PORT>: The MongoDB port number.
- <MONGO_USER>: The MongoDB user.
- <MONGO_PASSWORD>: The MongoDB password.
- <TRADENOTE_DATABASE>: The TradeNote database name in the MongoDB. You can use whatever name you like. 
- <APP_ID>: Set a random string as application ID, which will be used to connect to the backend (no spaces)
- <MASTER_KEY>: Set a random string as master key, which will be used to make root connections to the backend (no spaces)
- < TAG >: Depends on the tag number pulled from [DockerHub](https://hub.docker.com/r/eleventrading/tradenote/tags "DockerHub")


#### 3_ First Steps
1. Start by registering a user. Visit `http://<your_server>:7777/register` to register a TradeNote user. Use any email and set a password
2. When you log in for the first time, you will see a step by step tutorial explaining how TradeNote works
2. Import your trades. See the [brokers folder](https://github.com/Eleven-Trading/TradeNote/blob/main/brokers "brokers folder") for more information

### Side note
#### Build image locally
For advanced users, you can also build the TradeNote image locally, directly from GitHub repository.

1. Pull from github
2. cd into Tradenote directory 
3. docker build -f docker/Dockerfile . -t tradenote:<tag>
(replace <tag> with the number you wish / with latest tag number)
4. Run the image
```
docker run -e MONGO_URL=<MONGO_URL> -e MONGO_PORT=<MONGO_PORT> -e MONGO_USER=<MONGO_USER> -e MONGO_USER=<MONGO_PASSWORD> -e TRADENOTE_DATABASE=<TRADENOTE_DATABASE> -e APP_ID=<APP_ID> -e MASTER_KEY=<MASTER_KEY> -p 7777:7777 --name tradenote-app --net tradenote-net -d eleventrading/tradenote:<TAG>

```
#### Parse
This project uses [Parse](https://github.com/parse-community "Parse") as its backend framework, for the following reasons: 
1. Manage the authentification (flow)
2. Parse is a great framework for all API communications with the mongo database
3. Parse acts as the server so that TradeNote does not need to run any server on its own, making it faster and lighter. 

During the installation process, Parse server is automatically installed via Docker. If you wish to visualize your raw MongoDB data, you can use a tool [MongoDB Compass](https://github.com/parse-community "MongoDB Compass") or you can install and run the [Parse Dashboard](https://github.com/parse-community/parse-dashboard "Parse Dashboard").

#### PostHog
This projects uses [PostHog](https://github.com/PostHog/posthog "PostHog") as its product analytics suite to collect <u>anonymous</u> analytics about TradeNote installations and page views. This helps me better understand if and how people are using TradeNote and evaluate the outreach of my project. If you want to opt-out of this program, you can simply add `-e ANALYTICS_OFF=true` when running the docker image. 

## Upgrade to new version
### Docker
#### 1_ Stop and remove container
1. List all containers `docker ps -a` and get the TradeNote container id
2. Stop the TradeNote container: `docker stop <container_id>`
3. Remove the TradeNote container: `docker rm <container_id>`

#### 2_ Stop and remove image
1. List all images `docker image ls` and get the TradeNote image id
2. Remove the TradeNote image: `docker rmi <image_id>`

#### 3_ Pull and Run (see Installation)



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
