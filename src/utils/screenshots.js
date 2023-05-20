import { ref, onMounted, onUnmounted } from 'vue'
import { usePageId, useInitPopover } from './utils.js'
import { useGetPatternsMistakes, useDeletePatternMistake } from '../utils/patternsMistakes'
import { patterns, mistakes, selectedPatterns, selectedMistakes, patternsMistakes, selectedMonth, pageId, setups, setup, screenshotsNames, tradeScreenshotChanged, indexedDBtoUpdate, dateScreenshotEdited, renderData, markerAreaOpen, spinnerLoadingPageText, spinnerLoadingPage, spinnerLoadMore, spinnerSetups, editingScreenshot, tradeTimeZone, tradeSetupId, tradeSetupDateUnix, tradeSetupDateUnixDay, endOfList, screenshotsPagination, selectedItem } from '../stores/globals.js'

let screenshotsQueryLimit = 6

export function useGetScreenshotsPagination() {
    if (sessionStorage.getItem('screenshotsPagination')) {
        screenshotsQueryLimit = Number(sessionStorage.getItem('screenshotsPagination'))
        sessionStorage.removeItem('screenshotsPagination');
    }
}

export async function useGetScreenshots(param) {
    await useGetPatternsMistakes()
    //console.log(" -> Selected patterns " + selectedPatterns.value)
    let allPatterns = []
    //console.log(" patterns " + JSON.stringify(patterns))
    patterns.filter(obj => obj.active == true).forEach(element => {
        allPatterns.push(element.objectId)
    });

    let allMistakes = []
    mistakes.filter(obj => obj.active == true).forEach(element => {
        allMistakes.push(element.objectId)
    });

    //we need to reverse the logic and exclude in the query the patterns and mistakes that are unselected
    let exclPatterns = allPatterns.filter(x => !selectedPatterns.value.includes(x));
    //console.log(" -> Excluded patterns "+exclPatterns);
    let exclMistakes = allMistakes.filter(x => !selectedMistakes.value.includes(x));
    //console.log(" -> Excluded mistakes "+exclMistakes);

    let allPatternsMistakesIds = []
    let excludedIds = []

    patternsMistakes.forEach(element => {
        allPatternsMistakesIds.push(element.tradeId)
        //console.log(" - element mistake "+element.mistake)

        if ((element.pattern != null && exclPatterns.includes(element.pattern.objectId)) || (element.mistake != null && exclMistakes.includes(element.mistake.objectId))) {
            //console.log("  --> Trade id to exclude " + element.tradeId)
            excludedIds.push(element.tradeId)
        }
    });


    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting screenshots");
        //console.log(" -> selectedPatterns " + selectedPatterns.value)
        //console.log(" -> screenshotsPagination (start)" + screenshotsPagination);
        //console.log(" selected start date " + selectedMonth.value.start)
        const parseObject = Parse.Object.extend("setupsEntries");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.descending("dateUnix");
        query.notContainedIn("name", excludedIds) // Query not including excluded ids

        if (!selectedPatterns.value.includes("void") && !selectedMistakes.value.includes("void")) { // if void has been excluded, then only query screenshots that are in Patterns Mistakes table
            query.containedIn("name", allPatternsMistakesIds)
        }

        if (param) { // if "full" false (case for daily page), then only certain limit. Else sull
            query.greaterThanOrEqualTo("dateUnix", selectedMonth.value.start)
            query.lessThanOrEqualTo("dateUnix", selectedMonth.value.end)
        } else {
            query.limit(screenshotsQueryLimit);
            query.skip(screenshotsPagination.value)
        }


        await query.find().then((results) => {
            //console.log("results " + JSON.stringify(results))
            if (results.length > 0) {
                let parsedResult = JSON.parse(JSON.stringify(results))
                parsedResult.forEach(element => {
                    screenshotsNames.push(element.name)
                });

                if (pageId.value == "daily") {
                    //on daily page, when need to reset setups or else after new screenshot is added, it apreaeed double. 
                    //However, on screenshots page, we need to add to setups on new image / page load on scroll
                    setups.length = 0
                    parsedResult.forEach(element => {
                        setups.push(element)
                    });

                } else {
                    parsedResult.forEach(element => {
                        setups.push(element)
                    });
                }
            } else {
                endOfList.value = true
            }


            //console.log(" -> Setups/Screenshots " + JSON.stringify(setups))
            screenshotsPagination.value = screenshotsPagination.value + screenshotsQueryLimit
            spinnerSetups.value = false //spinner for trades in daily
            spinnerLoadMore.value = false
            if (pageId.value != "daily") spinnerLoadingPage.value = false //we remove it later

        }).then(() => {
            if (sessionStorage.getItem('screenshotIdToEdit') && pageId.value == "screenshots") useScrollToScreenshot()
            resolve()
        })

    })
}

export function useScrollToScreenshot() {
    let element = document.getElementById(sessionStorage.getItem('screenshotIdToEdit'))
    element.scrollIntoView()
    sessionStorage.removeItem('screenshotIdToEdit');
}

export async function useSetupImageUpload(event, param1, param2, param3) {
    if (pageId.value == "daily") {
        tradeScreenshotChanged.value = true
        indexedDBtoUpdate.value = true
        dateScreenshotEdited.value = true

        setup.dateUnix = param1
        setup.symbol = param2
        setup.side = param3

    }
    //console.log(" day unix "+ dayjs(setup.dateUnix*1000).tz(tradeTimeZone.value).startOf("day").unix())
    const file = event.target.files[0];

    /* We convert to base64 so we can read src in markerArea */
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        var base64data = reader.result
        setup.originalBase64 = base64data
        setup.annotatedBase64 = base64data
        setup.extension = base64data.substring(base64data.indexOf('/') + 1, base64data.indexOf(';base64'))
        renderData.value += 1
        //console.log("original " + setup.annotatedBase64)
    }

}

export function useSetupMarkerArea() {
    if (pageId.value == "daily") {
        tradeScreenshotChanged.value = true
        indexedDBtoUpdate.value = true
        dateScreenshotEdited.value = true

    }
    //https://github.com/ailon/markerjs2#readme
    let markerAreaId = document.getElementById("setupDiv");

    const markerArea = new markerjs2.MarkerArea(markerAreaId);
    markerArea.availableMarkerTypes = markerArea.ALL_MARKER_TYPES;
    markerArea.renderAtNaturalSize = true;
    markerArea.renderImageQuality = 1;
    markerArea.settings.defaultFillColor = "#ffffffde" //note background
    markerArea.settings.defaultStrokeColor = "black" //font color
    markerArea.settings.defaultColorsFollowCurrentColors = true
    markerArea.settings.defaultStrokeWidth = 2
    markerArea.settings.defaultColor = "white"

    markerArea.targetRoot = markerAreaId.parentElement
    markerArea.addRenderEventListener((imgURL, state) => {
        setup.annotatedBase64 = imgURL
        setup.maState = state
        //console.log("state " + JSON.stringify(setup.maState))
        markerAreaOpen.value = false
        renderData.value += 1
    })

    markerArea.show();
    if (markerArea.isOpen) {
        markerAreaOpen.value = true
    }

    if (setup.maState) {
        markerArea.restoreState(setup.maState);
    }
}

export function useScreenshotUpdateDate(event) {
    if (editingScreenshot.value) {
        dateScreenshotEdited.value = true
    }
    setup.date = event
    //console.log("setup date (local time, i.e. New York time) " + setup.date)
    setup.dateUnix = dayjs.tz(setup.date, tradeTimeZone.value).unix()
    //console.log("unix " + dayjs.tz(setup.date, tradeTimeZone.value).unix()) // we SPECIFY that it's New york time
}

export async function useSaveScreenshot() {
    console.log("\nSAVING SCREENSHOT")
    //console.log(" -> Setup to save " + JSON.stringify(setup))
    return new Promise(async (resolve, reject) => {
        if (markerAreaOpen.value == true) {
            alert("Please save your setup annotation")
            return
        }
        if (pageId.value == "addScreenshot") {
            spinnerLoadingPage.value = true
            spinnerLoadingPageText.value = "Uploading screenshot ..."
        }

        if (pageId.value == "daily") {
            spinnerSetups.value = true
        }

        if (pageId.value == "addScreenshot") { //if daily, we do not edit dateUnix. It's already formated
            if (!editingScreenshot.value || (editingScreenshot.value && dateScreenshotEdited.value)) {
                setup.dateUnix = dayjs.tz(setup.date, tradeTimeZone.value).unix()
            }
        }
        if (editingScreenshot.value && !dateScreenshotEdited.value) {
            //we do nothing
        }

        //extension is created during setupImageUpload. So when edit, must create it here before upload
        if (editingScreenshot.value) {
            setup.extension = setup.originalBase64.substring(setup.originalBase64.indexOf('/') + 1, setup.originalBase64.indexOf(';base64'))
        }

        //console.log(" -> dateUnix " + setup.dateUnix)


        setup.side ? setup.name = "t" + setup.dateUnix + "_" + setup.symbol + "_" + setup.side : setup.name = setup.dateUnix + "_" + setup.symbol
        //console.log("name " + setup.name)

        /*
        UPDATE PATTERNS MISTAKES
        //updating variables used in dailyMixin
        //Pattern and mistake are already updated on change/input
        */
        tradeSetupId.value = setup.name
        tradeSetupDateUnix.value = setup.dateUnix
        tradeSetupDateUnixDay.value = dayjs(setup.dateUnix * 1000).tz(tradeTimeZone.value).startOf("day").unix()

        //if (pageId.value == "addScreenshot") await hideTradesModal() //I reuse the function from dailyMixin, for storing patterns and mistakes. But only on add screenshot or else it creates infinity loop

        /* UPLOAD SCREENSHOT */
        await useUploadScreenshotToParse()

        resolve()
    })
}

export async function useUploadScreenshotToParse() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Uploading to database")

        spinnerLoadingPageText.value = "Uploading Screenshot ..."

        /* creating names, recreating files and new parse files */
        const originalName = setup.name + "-original." + setup.extension
        const annotatedName = setup.name + "-annotated." + setup.extension

        /* we convert image back from base64 to file cause base64 was making browser freez whenever image was larger (at least at 300ko) */
        const dataURLtoFile = (dataurl, filename) => {
            var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = window.atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);

            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, { type: mime });
        }
        let originalFile = dataURLtoFile(setup.originalBase64, originalName);
        const parseOriginalFile = new Parse.File(originalName, originalFile);

        let annotatedFile = dataURLtoFile(setup.annotatedBase64, originalName);
        const parseAnnotatedFile = new Parse.File(annotatedName, annotatedFile);

        const parseObject = Parse.Object.extend("setupsEntries");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", setup.objectId);

        const results = await query.first();
        //console.log("url orig " + setup.originalUrl + " annot " + setup.annotatedUrl)
        if (results) {
            console.log(" -> Updating")
            await parseOriginalFile.save() // before I was using then. In that case it's possible to catch error. I had to change it to await because in daily trades it was triggering the rest of the functinos in clickTradesModal too fast
            await parseAnnotatedFile.save()
            results.set("name", setup.name)
            results.set("symbol", setup.symbol)
            results.set("side", setup.side)
            results.set("original", parseOriginalFile)
            results.set("annotated", parseAnnotatedFile)
            results.set("originalBase64", setup.originalBase64)
            results.set("annotatedBase64", setup.annotatedBase64)
            results.set("maState", setup.maState)
            if (dateScreenshotEdited.value) {
                results.set("date", new Date(dayjs.tz(setup.dateUnix, tradeTimeZone.value).format("YYYY-MM-DDTHH:mm:ss")))
                results.set("dateUnix", Number(setup.dateUnix))
                results.set("dateUnixDay", dayjs(setup.dateUnix * 1000).tz(tradeTimeZone.value).startOf("day").unix())
            }
            results.save().then(async () => {
                console.log(' -> Updated screenshot with id ' + results.id)
                if (pageId.value == "addScreenshot") {
                    window.location.href = "/screenshots"
                }

                if (pageId.value == "daily") {
                    await useGetScreenshots(true)
                    const file =
                        document.querySelector('.screenshotFile');
                    file.value = '';
                }
                resolve()

            }, (error) => {
                console.log('Failed to update new object, with error code: ' + error.message);
                //window.location.href = "/screenshots"
                spinnerLoadingPage.value = false
            })

        } else {
            console.log(" -> Saving")

            await parseOriginalFile.save()
            await parseAnnotatedFile.save()
            //console.log(" -> Setup to upload " + JSON.stringify(setup))
            const object = new parseObject();
            object.set("user", Parse.User.current())
            object.set("name", setup.name)
            object.set("symbol", setup.symbol)
            object.set("side", setup.side)
            object.set("original", parseOriginalFile)
            object.set("annotated", parseAnnotatedFile)
            object.set("originalBase64", setup.originalBase64)
            object.set("annotatedBase64", setup.annotatedBase64)
            object.set("maState", setup.maState)
            object.set("date", new Date(dayjs.tz(setup.date, tradeTimeZone.value).format("YYYY-MM-DDTHH:mm:ss")))
            object.set("dateUnix", Number(setup.dateUnix))
            object.set("dateUnixDay", dayjs(setup.dateUnix * 1000).tz(tradeTimeZone.value).startOf("day").unix())

            object.setACL(new Parse.ACL(Parse.User.current()));

            object.save()
                .then(async (object) => {
                    console.log('  --> Added new screenshot with id ' + object.id)
                    if (pageId.value == "addScreenshot") {
                        window.location.href = "/screenshots"
                    }
                    if (pageId.value == "daily") {
                        await useGetScreenshots(true)
                        const file =
                            document.querySelector('.screenshotFile');
                        file.value = '';
                    }
                    resolve()


                }, (error) => {
                    console.log('Failed to create new object, with error code: ' + error.message);
                    //window.location.href = "/screenshots"
                    spinnerLoadingPage.value = false
                });

        }
    })
}

export async function useDeleteScreenshot(param1, param2) {
    console.log("selected item " + selectedItem.value)
    //console.log("setup "+JSON.stringify(setups))

    /* First, let's delete patterns mistakes */
    let setupToDelete = setups.filter(obj => obj.objectId == setups)[0]
    //console.log("setupToDelete "+JSON.stringify(setupToDelete))
    //console.log("setupToDelete date unix day "+setupToDelete.dateUnixDay+" and name "+setupToDelete.name)
    if (setupToDelete) await useDeletePatternMistake(setupToDelete.dateUnixDay, setupToDelete.name)

    /* Now, let's delete screenshot */
    const parseObject = Parse.Object.extend("setupsEntries");
    const query = new Parse.Query(parseObject);
    query.equalTo("objectId", selectedItem.value);
    const results = await query.first();

    if (results) {
        await results.destroy()
        console.log('  --> Deleted screenshot with id ' + results.id)
        //document.location.reload()
        await useRefreshScreenshot()
    } else {
        alert("There was a problem with the query")
    }
}

export async function useRefreshScreenshot() {
    return new Promise(async (resolve, reject) => {
        screenshotsQueryLimit = 6
        screenshotsPagination.value = 0
        setups.length = 0
        await useGetScreenshots()
        await useInitPopover()
        resolve()
    })
}