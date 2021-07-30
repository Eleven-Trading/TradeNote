const vueApp = new Vue({

    components: {},
    el: '#vapp',
    mixins: [tradesMixin, chartsCalMixin, addTradesMixin, addScreenshotMixin, dailyMixin, videosMixin, notesMixin, dashboardMixin, addNoteMixin, playbookMixin],
    data() {
        return {
            fromFirstFeature: "",
            fromSecondFeature: "",
            //IndexDB
            indexedDBVersion: 10,
            indexedDBOpenRequest: null,
            indexedDb: null,

            //Login/Register
            registerForm: { username: null, password: null },
            loginForm: { username: null, password: null },

            //General
            pages: [{
                    id: "dashboard",
                    name: "Dashboard",
                    icon: "uil uil-apps"
                },
                {
                    id: "daily",
                    name: "Daily",
                    icon: "uil uil-signal-alt-3"
                },
                {
                    id: "calendar",
                    name: "Calendar",
                    icon: "uil uil-calendar-alt"
                },
                {
                    id: "screenshots",
                    name: "Screenshots",
                    icon: "uil uil-image-v"
                },
                {
                    id: "videos",
                    name: "Videos",
                    icon: "uil uil-clapper-board"
                },
                {
                    id: "notes",
                    name: "Notes",
                    icon: "uil uil-edit"
                },
                {
                    id: "playbook",
                    name: "Playbook",
                    icon: "uil uil-compass"
                },
                {
                    id: "addTrades",
                    name: "Add Trades",
                    icon: "uil uil-plus-circle"
                },
                {
                    id: "addScreenshot",
                    name: "Add Screenshot",
                    icon: "uil uil-plus-circle"
                },
                {
                    id: "addNote",
                    name: "Add Note",
                    icon: "uil uil-plus-circle"
                }
            ],
            currentPage: null,
            stepper: null,
            activeNav: 1,
            dailyChartHeight: 150,
            maxChartValues: 20,
            showEstimations: localStorage.getItem('showEstimations') ? JSON.parse(localStorage.getItem('showEstimations')) : false,
            estimations: {
                quantity: 10000,
                fees: 0.005
            },
            isNet: JSON.parse(localStorage.getItem('isNet')), //JSON parse because localstorage stores in string and not bool
            amountCase: JSON.parse(localStorage.getItem('isNet')) == true ? 'net' : 'gross',
            amountCapital: JSON.parse(localStorage.getItem('isNet')) == true ? 'Net' : 'Gross',

            //Show/Hide page
            showDashboard: true,
            showAdd: false,
            showMoreVideos: false,
            loadingSpinner: false,
            loadingSpinnerText: null,
            popover: null,
            selectedItem: null,

            //DASHBOARD
            allTrades: [],
            filteredTrades: [],
            totalPAndLChartMounted: false,
            totalCalendarMounted: false,
            totalPAndLChartHeight: 400,
            totals: null,
            totalWinLossChartHeight: 200,
            dateRange: [{
                    value: "all",
                    label: "All",
                    start: 0,
                    end: 0
                },
                {
                    value: "thisWeek",
                    label: "This Week",
                    start: dayjs().startOf('week').add(1, 'day').unix(),
                    end: dayjs().endOf('week').add(1, 'day').unix()
                },
                {
                    value: "lastWeek",
                    label: "Last Week",
                    start: dayjs().startOf('week').add(1, 'day').subtract(1, 'week').unix(),
                    end: dayjs().endOf('week').add(1, 'day').subtract(1, 'week').unix()
                },
                {
                    value: "lastWeekTilNow",
                    label: "Last Week Until Now",
                    start: dayjs().startOf('week').add(1, 'day').subtract(1, 'week').unix(),
                    end: dayjs().endOf('week').add(1, 'day').unix()
                },
                {
                    value: "lastTwoWeeks",
                    label: "Last Two Weeks",
                    start: dayjs().startOf('week').add(1, 'day').subtract(2, 'week').unix(),
                    end: dayjs().endOf('week').add(1, 'day').subtract(1, 'week').unix()
                },
                {
                    value: "lastTwoWeeksTilNow",
                    label: "Last Two Weeks Until Now",
                    start: dayjs().startOf('week').add(1, 'day').subtract(2, 'week').unix(),
                    end: dayjs().endOf('week').add(1, 'day').unix()
                },
                {
                    value: "thisMonth",
                    label: "This Month",
                    start: dayjs().startOf('month').unix(),
                    end: dayjs().endOf('month').unix()
                },
                {
                    value: "lastMonth",
                    label: "Last Month",
                    start: dayjs().startOf('month').subtract(1, 'month').unix(),
                    end: dayjs().endOf('month').subtract(1, 'month').unix()
                },
                {
                    value: "lastMonthTilNow",
                    label: "Last Month Until Now",
                    start: dayjs().startOf('month').subtract(1, 'month').unix(),
                    end: dayjs().endOf('month').unix()
                },
                {
                    value: "lastTwoMonths",
                    label: "Last Two Months",
                    start: dayjs().startOf('month').subtract(2, 'month').unix(),
                    end: dayjs().endOf('month').subtract(1, 'month').unix()
                },
                {
                    value: "lastTwoMonthsTilNow",
                    label: "Last Two Months Until Now",
                    start: dayjs().startOf('month').subtract(2, 'month').unix(),
                    end: dayjs().endOf('month').unix()
                },
                {
                    value: "lastThreeMonths",
                    label: "Last Three Months",
                    start: dayjs().startOf('month').subtract(3, 'month').unix(),
                    end: dayjs().endOf('month').subtract(1, 'month').unix()
                },
                {
                    value: "lastThreeMonthsTilNow",
                    label: "Last Three Months Until Now",
                    start: dayjs().startOf('month').subtract(3, 'month').unix(),
                    end: dayjs().endOf('month').unix()
                }
            ],
            selectedDateRange: {},
            selectedCalRange: {},
            renderData: 0, //this is for updating DOM
            renderingCharts: true, // this is for spinner

            //DAILY
            curMonthTrades: [],
            curWeekTrades: [],
            winLossChartToLoad: null,
            calendarData: null,
            days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            currentCalendarDate: null,
            todayDate: null,
            todayMonth: null,
            todayYear: null,

            //Screenshots
            screenshots: [],
            screenshot: {
                id: null,
                imageUrl: null,
                imageRoot: null,
                comment: null,
                tags: []
            },
            maState: null,
            markerAreaOpen: false,

            //Videos
            videoFile: null,
            videoUrl: null,
            videoPosterUrl: null,
            videoName: null,
            awsFileType: null,
            fileExtension: null,
            tradeVideos: [],
            videoToLoad: null,
            videoIndex: null,
            videoBlob: null,
            videoUrlStorage: null,
            tradeToShow: [],
            uploadPercentCompleted: null,

            //ADDTRADES
            apiBaseUrl: "API_BASE_URL",
            apiEndPointTempUrl: "API_END_POINT_TEMP_URL",
            apiEndPointFinviz: "API_END_POINT_FINVIZ",
            publicBaseUrlB2: "PUBLIC_BASE_URL_B2",
            includeFinviz: true,
            existingTradesArray: [],
            executions: null,
            trades: null,
            blotter: null,
            pAndL: null,
            videos: {},
            inputToShow: [],


            screenshotIndex: 0,
            posterImg: null,
            videoCurrentlyPlaying: null,
            videoToPlay: null,
            forwBackSpeed: 0.5,
            forwBackSpeedArray: [0.1, 0.2, 0.3, 0.5, 1, 1.5, 2, 3],
            videoBuffer: 2,
            videoBufferArray: [0, 1, 2, 3, 4],

            //Notes
            notes: [],
            note: {},

            //Playbook
            playbookImg: null,
            testImg: null,
            playbookImgB2Url: null,
        }
    },
    beforeCreate: async function() {
        //set default gross / net in localstorage 
        !localStorage.getItem('isNet') ? localStorage.setItem('isNet', true) : ''
    },
    created: async function() {

        //we create the selectedDate and Calendar range
        this.selectedDateRange = localStorage.getItem('selectedDateRange') ? JSON.parse(localStorage.getItem('selectedDateRange')) : this.dateRange.filter(element => element.value == 'all')[0]

        this.selectedCalRange = localStorage.getItem('selectedCalRange') ? JSON.parse(localStorage.getItem('selectedCalRange')) : { start: this.dateRange.filter(element => element.value == 'thisMonth')[0].start, end: this.dateRange.filter(element => element.value == 'thisMonth')[0].end }

        this.currentPage = this.pages.filter(item => item.id == document.getElementsByTagName("main")[0].id)[0];

        //this.currentPage = document.getElementsByTagName("main")[0].id
        this.initParse()
        this.checkCurrentUser()

        await this.initIndexedDB()
        if (this.currentPage.id == "dashboard" || this.currentPage.id == "calendar") {
            await this.getAllTrades()
        }
        if (this.currentPage.id == "daily" || this.currentPage.id == "videos") {
            await this.getAllTrades()
        }

        if (this.currentPage.id == "screenshots") {
            await this.getScreenshots()
            await this.initPopover()
        }

        if (this.currentPage.id == "notes") {
            await this.getNotes()
            await this.initPopover()
        }

        if (this.currentPage.id == "playbook") {
            this.getPlaybook()
        }
        var itemToEditId = sessionStorage.getItem('editItemId')
        if (this.currentPage.id == "addNote") {
            await this.getNoteToEdit(itemToEditId)
            await this.initQuill()
            await sessionStorage.removeItem('editItemId');
        }
        if (this.currentPage.id == "addScreenshot") {
            //await this.getScreenshotToEdit(itemToEditId)
            //await this.initQuill()
            await sessionStorage.removeItem('editItemId');
        }
        this.playbookImgChange()
    },
    mounted() {
    
        var itemToEditId = sessionStorage.getItem('editItemId')
        if (this.currentPage.id == "addScreenshot") {
            //this.getScreenshotToEdit(itemToEditId)
            this.initQuill()
                /*if (itemToEditId) {
                    this.getScreenshotToEdit(itemToEditId)
                        //sessionStorage.removeItem('editItemId');
                }*/
        }
        if (this.currentPage.id == "addTrades") {
            this.initStepper()
        }

        this.tagArray()
        this.initWheelEvent()
        var fullFileName = "2021_07_19-142702.mp4"
        
        var fileName = fullFileName.substring(0, fullFileName.lastIndexOf('.'))
        console.log("file name " + fileName)
        
        
        var fileDate = fileName.split("-")[0].split("_")
        var fileYear = fileDate[0]
        var fileMonth = fileDate[1]
        var fileDay = fileDate[2]
        //console.log("year "+fileYear + " month "+fileMonth+" day "+fileDay)
        var fileTime = fileName.split("-")[1]
        var fileHour = fileTime.substring(0,2)
        var fileMinutes = fileTime.substring(2,4)
        var fileSeconds = fileTime.substring(4,6)
        //console.log("hour "+fileHour + " minutes "+fileMinutes+" seconds "+fileSeconds)
        var fileDateUnix = dayjs(fileDate+" "+fileHour+":"+fileMinutes+":"+fileSeconds, "YYYY_MM_DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss")
        console.log("unix "+fileDateUnix)
        

    },
    watch: {
        activeNav: function() {
            console.log("nav " + this.activeNav + ' and type ' + typeof this.activeNav)
        },
        playbookImg: function() {
            //console.log("watch img "+this.playbookImg)
        }, 
        includeFinviz: function() {
            //console.log("watch finviz "+this.includeFinviz)
        }, 

    },
    methods: {
        // =================================================================================
        // GLOBALS
        // =================================================================================

        grossNetToggle() {
            this.getAllTrades()
            currentState = JSON.parse(localStorage.getItem('isNet'))
            //console.log("state " + currentState)
            localStorage.setItem('isNet', !currentState)
            !currentState == true ? this.amountCase = "net" : this.amountCase = "gross"
            !currentState == true ? this.amountCapital = "Net" : this.amountCapital = "Gross"
        },

        /* ---- INITS ---- */
        initParse() {
            Parse.initialize("PARSE_INIT")
            Parse.serverURL = "PARSE_URL"
        },
        initQuill() {
            var quill = new Quill('#quillEditor', {
                theme: 'snow'
            });
            quill.root.setAttribute('spellcheck', true)

            quill.on('text-change', () => {
                if (this.currentPage.id == "addScreenshot") {
                    this.screenshot.comment = document.querySelector(".ql-editor").innerHTML
                }
                if (this.currentPage.id == "addNote") {
                    this.note.note = document.querySelector(".ql-editor").innerHTML
                    console.log("note " + this.note.note)
                }
            });
        },
        initStepper() {
            this.stepper = new Stepper(document.querySelector('#addStepper'), {
                animation: true
            })
        },
        initIndexedDB: async function() {
            return new Promise((resolve, reject) => {
                console.log("\nINITIATING INDEXEDDB")
                window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
                    IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction

                // Create/open database
                this.indexedOpenRequest = indexedDB.open("tradeNote", this.indexedDBVersion);

                this.indexedOpenRequest.onupgradeneeded = () => {
                    //console.log("onupgradeneeded")
                    // triggers if the client had no database
                    // ...perform initialization...
                    this.indexedDB = this.indexedOpenRequest.result;
                    if (!this.indexedDB.objectStoreNames.contains('videos')) {
                        console.log("creating videos object store in tradeNote")
                        this.indexedDB.createObjectStore('videos', { keyPath: 'id' })
                    }
                    if (!this.indexedDB.objectStoreNames.contains('trades')) {
                        console.log("creating trades object store in tradeNote")
                        this.indexedDB.createObjectStore('trades', { keyPath: 'id' })
                    }
                };

                this.indexedOpenRequest.onerror = () => {
                    console.error("Error", this.indexedOpenRequest.error);
                    resolve()
                };

                this.indexedOpenRequest.onsuccess = () => {
                    this.indexedDB = this.indexedOpenRequest.result;
                    resolve()

                };
            })
        },
        initWheelEvent() {
            var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
            var mouseDirection
            if (document.attachEvent) //if IE (and Opera depending on user setting)
                document.attachEvent("on" + mousewheelevt, e => {
                //console.log('IE Case wheel  ' + e.wheelDelta)
                if (e.wheelDelta > 0) {
                    mouseDirection = "forward"
                } else {
                    mouseDirection = "backward"
                }
                this.videoSkip(mouseDirection)
            })
            else if (document.addEventListener) //WC3 browsers
                document.addEventListener(mousewheelevt, e => {
                //console.log('WC3 case Mouse ' + e.wheelDelta)
                if (e.wheelDelta > 0) {
                    mouseDirection = "forward"
                        //console.log('Moving wheel ' + mouseDirection)
                } else {
                    mouseDirection = "backward"
                        //console.log('Moving wheel ' + mouseDirection)
                }
                this.videoSkip(mouseDirection)
            }, false)
        },

        initPopover() {
            var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
            popoverTriggerList.map(function(popoverTriggerEl) {
                return new bootstrap.Popover(popoverTriggerEl)
            })

            $(document).on('click', '.popoverDelete', (e) => {
                var $this = $(e.currentTarget);
                $('.popoverDelete').not($this).popover('hide');
            });

            $(document).on('click', '.popoverYes', (e) => {
                var $this = $(e.currentTarget);
                if (this.currentPage.id == "notes") {
                    this.deleteNote()
                }
                $this.parents().popover('hide');
            });

            $(document).on('click', '.popoverNo', (e) => {
                var $this = $(e.currentTarget);
                $this.parents().popover('hide');
                this.selectedItem = null
            });

        },

        /* ---- INPUTS ---- */
        getComment(e) {
            this.screenshot.comment = e.target.innerHTML
                //console.log("comment "+this.screenshot.comment)
        },

        /* ---- LOGIN/REGISTER ---- */
        checkCurrentUser() {
            var path = window.location.pathname
            const currentUser = Parse.User.current();
            if (path != "/" && path != "/register") {
                if (currentUser) {
                    //console.log("Your are logged in " + JSON.stringify(currentUser) + " and id " + Parse.User.current().id)
                } else {
                    window.location.replace("/");
                }
            }
            if (path == "/" || path == "/register") {
                if (currentUser) {
                    window.location.replace("/dashboard");
                } else {
                    console.log("Your are not logged")
                }
            }

        },
        login: async function() {
            console.log("login inn")
            try {
                await Parse.User.logIn(this.loginForm.username, this.loginForm.password);
                console.log("Hooray! You are logged in")
                window.location.replace("/dashboard");
            } catch (error) {
                // Show the error message somewhere and let the user try again.
                alert("Error: " + error.code + " " + error.message);
            }
        },
        register: async function() {
            console.log("Register and username value " + this.registerForm.username)
            const user = new Parse.User();
            user.set("username", this.registerForm.username);
            user.set("password", this.registerForm.password);
            user.set("email", this.registerForm.username);

            try {
                await user.signUp();
                console.log("Hooray! Let them use the app now")
                window.location.replace("/");
            } catch (error) {
                // Show the error message somewhere and let the user try again.
                alert("Error: " + error.code + " " + error.message);
            }
        },
        logout() {
            Parse.User.logOut().then(() => {
                Parse.User.current(); // this will now be null
                console.log("Logging out")
                window.location.replace("/");
            });
        },

        /* ---- DATE FORMATS ---- */
        dateFormat(param) {
            return dayjs.unix(param).format("DD MMMM YYYY")
        },
        timeFormat(param) {
            return dayjs.unix(param).format("hh:mm:ss")
        },
        hourMinuteFormat(param) {
            return dayjs.unix(param).format("hh:mm")
        },
        chartFormat(param) {
            return dayjs.unix(param).format("DD/MM/YY")
        },
        monthFormat(param) {
            return dayjs.unix(param).format("MMMM YYYY")
        },
        createdDateFormat(param) {
            return dayjs(param).format("DD MMMM YYYY")
        },

        /* ---- NUMBER FORMATS ---- */
        thousandFormat(param) {
            return new Intl.NumberFormat().format(param.toFixed(0))
        },

        /* ---- STEPPER---- */
        stepperNext() {
            this.stepper.next()
        },

        stepperPrevious() {
            this.stepper.previous()
        },

        /* ---- VIDEO PLAYER ---- */
        videoPlaying(param) {
            this.videoCurrentlyPlaying = "video" + param
        },
        playVideo() {
            console.log("click")
                //this.videoToPlay = param
        },
        videoSkip(param) {
            if (this.videoCurrentlyPlaying) {
                var video = document.getElementById(this.videoCurrentlyPlaying)
                if (param == "forward") {
                    video.currentTime += this.forwBackSpeed;
                }
                if (param == "backward") {
                    video.currentTime -= this.forwBackSpeed;
                }
            }
        },

        tagArray() {
            $('#tags').on('itemAdded', (event) => {
                console.log("Tag added " + event.item)
                this
                    .screenshot.tags
                    .push(event.item)
                console.log("Items in tags " + this.screenshot.tags)
            });
            $('#tags').on('itemRemoved', (event) => {
                console.log("Item to remove from tags " + event.item)
                this.screenshot.tags = this
                    .screenshot.tags
                    .filter(item => item !== event.item)
                console.log("Items left in tags " + this.screenshot.tags)
            });
        },

        editItem(param) {
            sessionStorage.setItem('editItemId', param);
            window.location.href = "/addNote"
        }

    }
})