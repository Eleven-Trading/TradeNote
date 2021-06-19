
<center>
<font size="5">TradeNote</font>
<br/>
- Open Source Day Trading Journal -
<br/>
<br/>
</center>

# About the project
TraderVue and TraderSync are great and very powerful trading journals. However, most of these tools are very limited in terms of control and customisations (data control, privacy, UI&UX customization, etc.). Moreover, I was missing some essential features for improving my day trading.

By creating and sharing TradeNote as an open source project, I hope to help other days traders like myself store, discover and recollect trade patterns so they can become and remain consistent and profitable traders.

### Note
This project arose from a personal need and as such is currently only used (and tested) for intraday trades and using TradeZero Broker. Please refer to the "Contribute" section for more information

# Benefits
## Measure
TradeNote offers a dashboard, daily view and calendar view so you can measure your progress. You can easily filter your trades by month or date range.

![dashboard](https://f003.backblazeb2.com/file/7ak-public/tradenote/dashboard.png "Dashboard")
![daily](https://f003.backblazeb2.com/file/7ak-public/tradenote/daily.png "Daily")


## Learn
With TradeNote you can take screenshots and upload your trade videos so you can learn from your past setups and mistakes. 

![screenshots](https://f003.backblazeb2.com/file/7ak-public/tradenote/screenshots.png "Screenshots")

Screenshots can be annotated.
![annotate](https://f003.backblazeb2.com/file/7ak-public/tradenote/annotate.png "annotate")

Each video is automatically trimmed to start playing at the time the trade started so you do not have to search and scroll the whole video.

![videos](https://f003.backblazeb2.com/file/7ak-public/tradenote/videos.png "Videos")

![trimmed](https://f003.backblazeb2.com/file/7ak-public/tradenote/trimmed.png "Trimmed")

## Reflect
Take notes to work on your trader psychology and create your playbook for improved consistency.

![notes](https://f003.backblazeb2.com/file/7ak-public/tradenote/notes.png "Notes")
![playbook](https://f003.backblazeb2.com/file/7ak-public/tradenote/playbook.png "Playbook")

# Deployment
## Built with
The objective is to have a lightweight and fast website. As such, the website runs on VueJs, JS and HTML, and the server is separated.
- VueJs
- Bootstrap
- Axios
- MarkerJs
- Lodash
- Parse
- DayJs
- QuillJs
- eCharts

## Prerequisites
### Software and Tools
- Gulp for building the project
- Parse with a mongoDB database for storing your data
- Backblaze bucket for storing screenshots, videos and the playbook
- A server running your function for creating presigned URL

### Server
In order to store images and videos you need a server running a function to get a presigned URL from Backblaze. You can see an example written in PHP of this function in the folder "example_backblaze_function". If you wish to use this file, please remember to replace "FOLDER NAME" and "BUCKET NAME".

### Database Structure
Please have a running [Parse](https://parseplatform.org/ "Parse") server and mongoDB. Then, add the following classes to your mongoDB
- User
- notes
- playbooks
- screenshots
- trades

## Running Locally
- Install dependencies (npm)
- Run "gulp" in terminal with the following arguments
  - PARSE_INIT : your app id
  - PARSE_URL : your parse server url
  - API_BASE_URL : base url to your server where your function is running (exemple : http://localhost:3000)
  - API_END_POINT : end point of the function running on your server (example: /example_backblaze_function.php)
  - PUBLIC_BASE_URL_B2 : base url of the folder where your images and videos are stored in Backblaze

## Deployment
This project includes a deployment file and nginx conf file for deploying TradeNote on PaaS Caprover

# Contribute
I'm a trader and recreational developer. My days are very packed but I will do my best to answer your questions and update the code when needed. As such, do not hesitate to contact me if you would like to contribute and help improve this project. Things to work on and improve:
- Add support to other trading platforms (currently, only TradeZero is supported)
- Currently, the code has only been tested for day trading and it would be interesting to add support for swing and multi-day trading
- Clean and optimize code
- Improve front end layout and develop new ideas
- And more...

# License
This project is open sourced under the GNU GPL v3 licence.
