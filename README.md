
<h3 align="center">TradeNote</h3>
<h4 align="center">- Open Source Day Trading Journal -</h4>


# The project
## About
TraderVue and TraderSync are great and very powerful trading journals. However, most of these tools are very limited in terms of control and customisations (data control, privacy, UI&UX customization, etc.). Moreover, I was missing some essential features for improving my day trading, like having a diary.

By creating and sharing TradeNote as an open source project, I hope to help other days traders like myself store, discover and recollect trade patterns so they can become and remain consistent and profitable traders.

![dashboard](https://f003.backblazeb2.com/file/7ak-public/tradenote/TradeNote-Dashboard.png "Dashboard")

## Built with
The objective is to have a lightweight and fast website. As such, the website runs on static pages without any server, using VueJs, JS and HTML as well as [Parse](https://parseplatform.org/ "Parse") for its backend.

## Note
This project arose from a personal need and as such is currently only used (and tested) for intraday trades and using TradeZero Broker. Please refer to the "Contribute" section for more information


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
This project uses [Parse](https://parseplatform.org/ "Parse") as backend.
1. Install and run Parse. Please visit their website for instructions : https://parseplatform.org/
2. Enter your Parse Dashboard and add the following classes
- _User (alreay exists by default)
- dailyInfos
- cashJournals
- journals
- playbooks
- setupsEntries
- trades
## Installation
### Docker
1. Clone the repository
```
git clone https://github.com/Eleven-Trading/TradeNote.git
```
2. Enter the cloned directory
3. Build Doocker image with arguments
 - PARSE_INIT : your parse app id
 - PARSE_URL : your parse server url
```
docker build -f docker/Dockerfile . -t tradenote:latest --build-arg PARSE_INIT=<your_parse_app_id> --build-arg PARSE_URL=<your_parse_server_url>
```
4. Run the docker image
```
docker run -p 7777:80 tradenote:latest
```

### Caprover
If you are using [Caprover](https://github.com/caprover/caprover "Caprover"), you can deploy directly thanks to the existing captain-definition file.

### Running locally in development mode
1. Clone the repository
```
git clone https://github.com/Eleven-Trading/TradeNote.git
```
2. Enter cloed directory and install dependencies
```
npm install
```
3. Run "gulp" in terminal with the following arguments
  - PARSE_INIT : your parse app id
  - PARSE_URL : your parse server url
```
gulp --PARSE_INIT <your_parse_app_id> --PARSE_URL <your_parse_server_url>
```
## Post installation (first time user)
1. When running the app for the first time, register a new user
```
http://localhost:7777/register
```
2. In user Class, create the following columns
- avatar (type file) and add your avatar
- accounts (type array): and add your accounts the following way:
```
[
  {
    "value": "XY000001",
    "label": "Live Account"
  },
  {
    "value": "XY000002",
    "label": "Demo Account"
  }
]
```

# Contribute
I'm a trader and recreational developer. My days are very packed but I will do my best to answer your questions and update the code when needed. As such, do not hesitate to contact me if you would like to contribute and help improve this project. Things to work on and improve:
- Add support to other trading platforms (currently, only TradeZero is supported)
- Currently, the code has only been tested for day trading and it would be interesting to add support for swing and multi-day trading
- Clean and optimize code
- Improve front end layout and develop new ideas
- And more...

# License
This project is open sourced under the GNU GPL v3 licence.
