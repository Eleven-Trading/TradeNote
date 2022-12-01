
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

Please contact me via [Discord](https://discord.gg/ZbHekKYb85 "Discord") if you wish to integrate your broker.

Alternatively, you can use the [example file](https://github.com/Eleven-Trading/TradeNote/blob/main/example_tradezero_file.csv "example file") and adapt it to your export file.

### Type of trades
TradeNote works best for intraday stocks and forex trading. However, you can also import swing trades but you must make sure all imported trades are closed / that you do not have any open trades.


## Buy me coffee
If you like this project, don't hesitate to show me <s>the money</s> love ;)
<p><a href='https://ko-fi.com/eleven70433' target='_blank'><img height='35' style='margin-top:20px;border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a></p>

# TradeNote
TradeNote is divided in 3 sections, each being an essential building block for becoming a consistent trading and managing your trading business.

### Measure
TradeNote offers a dashboard, daily view and calendar view so you can measure your progress. You can easily filter your trades by month or date range.


### Reflect
With TradeNote you can keep a daily diary of your trading journey to work on your trader psychology as well as add annotated screenshots of interesting setups or your entries. You can also write your (yearly) playbook.

### Anticipate
They say trading is like running a business so with TradeNote you can create a forecast so you can anticipate your P&L.


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
#### 1_ Pull image
Pull image from [DockerHub](https://hub.docker.com/r/eleventrading/tradenote/tags "DockerHub")

```
docker pull eleventrading/tradenote:<tag>
```

#### 2_ Run image
```
docker run -e MONGO_URI=<MONGO_URI> -e APP_ID=<APP_ID> -e MASTER_KEY=<MASTER_KEY> -p 7777:7777 --name tradenote-app --net tradenote-net -d eleventrading/tradenote:<TAG>
```
Run the image with the following environment variables
- <MONGO_URI>: URI to your mongo database, including database name. It must have the following structure: `mongodb://<mongo_user>:<mongo_password>@<mongo_url>:<mongo_port>/<tradenote_database>?authSource=admin`. 
   - <mongo_url>: Enter one of the following information : 
      - If you have followed the above MongoDB installation process and created a network (in the example tradenote-net), simply use the container name.
      - If you have an existing MongoDB running on a local network, you can either connect it to the network by creating the network (`docker network create tradenote-net`) running `docker network connect tradenote-net <container_name>` and then use the container name or connect it using your MongoDB container IP (you can find it by running `docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container_name>`)
      - If you have an existing MongoDB on a remote network, simply use the remote IP address
   - <tradenote_database>: You can use whatever name you like for your  tradenote database. 
- <APP_ID>: Set a random string as application ID, which will be used to connect to the backend (no spaces)
- <MASTER_KEY>: Set a random string as master key, which will be used to make root connections to the backend (no spaces)
- < TAG >: Depends on the tag number pulled from [DockerHub](https://hub.docker.com/r/eleventrading/tradenote/tags "DockerHub")


#### 3_ Register a user
Visit `http://<your_server>:7777/register` to register a TradeNote user. Use any email and set a password

### Side note
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
