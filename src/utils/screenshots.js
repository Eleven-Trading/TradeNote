import { ref, onMounted, onUnmounted } from 'vue'
import { usePageId, useInitPopover } from './utils.js'
import { useGetPatternsMistakes, useDeletePatternMistake, useUpdatePatternsMistakes } from '../utils/patternsMistakes'
import { patterns, mistakes, selectedPatterns, selectedMistakes, patternsMistakes, selectedMonth, pageId, screenshots, screenshot, screenshotsNames, tradeScreenshotChanged, indexedDBtoUpdate, dateScreenshotEdited, renderData, markerAreaOpen, spinnerLoadingPageText, spinnerLoadingPage, spinnerLoadMore, spinnerSetups, editingScreenshot, tradeTimeZone, tradeSetupId, tradeSetupDateUnix, tradeSetupDateUnixDay, endOfList, screenshotsPagination, selectedItem, tradeSetupChanged } from '../stores/globals.js'
import { useUpdateTrades } from './trades.js'

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
                    screenshots.length = 0
                    parsedResult.forEach(element => {
                        screenshots.push(element)
                    });

                } else {
                    parsedResult.forEach(element => {
                        screenshots.push(element)
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

        screenshot.dateUnix = param1
        screenshot.symbol = param2
        screenshot.side = param3

    }
    //console.log(" day unix "+ dayjs(screenshot.dateUnix*1000).tz(tradeTimeZone.value).startOf("day").unix())
    const file = event.target.files[0];

    /* We convert to base64 so we can read src in markerArea */
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        var base64data = reader.result
        screenshot.originalBase64 = base64data
        screenshot.annotatedBase64 = base64data
        screenshot.extension = base64data.substring(base64data.indexOf('/') + 1, base64data.indexOf(';base64'))
        renderData.value += 1
        //console.log("original " + screenshot.annotatedBase64)
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
        screenshot.annotatedBase64 = imgURL
        screenshot.maState = state
        //console.log("state " + JSON.stringify(screenshot.maState))
        markerAreaOpen.value = false
        renderData.value += 1
    })

    markerArea.show();
    if (markerArea.isOpen) {
        markerAreaOpen.value = true
    }

    if (screenshot.maState) {
        markerArea.restoreState(screenshot.maState);
    }
}

export function useScreenshotUpdateDate(event) {
    if (editingScreenshot.value) {
        dateScreenshotEdited.value = true
    }
    screenshot.date = event
    //console.log("screenshot date (local time, i.e. New York time) " + screenshot.date)
    screenshot.dateUnix = dayjs.tz(screenshot.date, tradeTimeZone.value).unix()
    //console.log("unix " + dayjs.tz(screenshot.date, tradeTimeZone.value).unix()) // we SPECIFY that it's New york time
}

export async function useSaveScreenshot() {
    console.log("\nSAVING SCREENSHOT")
    //console.log(" -> Setup to save " + JSON.stringify(screenshot))
    return new Promise(async (resolve, reject) => {
        if (markerAreaOpen.value == true) {
            alert("Please save your screenshot annotation")
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
                screenshot.dateUnix = dayjs.tz(screenshot.date, tradeTimeZone.value).unix()
            }
        }
        if (editingScreenshot.value && !dateScreenshotEdited.value) {
            //we do nothing
        }

        //extension is created during setupImageUpload. So when edit, must create it here before upload
        if (editingScreenshot.value) {
            screenshot.extension = screenshot.originalBase64.substring(screenshot.originalBase64.indexOf('/') + 1, screenshot.originalBase64.indexOf(';base64'))
        }

        //console.log(" -> dateUnix " + screenshot.dateUnix)


        screenshot.side ? screenshot.name = "t" + screenshot.dateUnix + "_" + screenshot.symbol + "_" + screenshot.side : screenshot.name = screenshot.dateUnix + "_" + screenshot.symbol
        //console.log("name " + screenshot.name)

        /*
        UPDATE PATTERNS MISTAKES
        //updating variables used in dailyMixin
        //Pattern and mistake are already updated on change/input
        */
        tradeSetupId.value = screenshot.name
        tradeSetupDateUnix.value = screenshot.dateUnix
        tradeSetupDateUnixDay.value = dayjs(screenshot.dateUnix * 1000).tz(tradeTimeZone.value).startOf("day").unix()

        //console.log(" -> Trades modal hidden with indexDBUpdate " + indexedDBtoUpdate.value + " and screenshot changed " + tradeSetupChanged.value)
        if (indexedDBtoUpdate.value && tradeSetupChanged.value) {
            if (screenshot.type == null || screenshot.type == "entry") {
                await Promise.all([useUpdatePatternsMistakes(), useUpdateTrades()])
            }

            //Case add screenshot is screenshot => do not update trades
            if (screenshot.type == "setup") {
                await useUpdatePatternsMistakes()
            }
        }


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
        const originalName = screenshot.name + "-original." + screenshot.extension
        const annotatedName = screenshot.name + "-annotated." + screenshot.extension

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
        let originalFile = dataURLtoFile(screenshot.originalBase64, originalName);
        const parseOriginalFile = new Parse.File(originalName, originalFile);

        let annotatedFile = dataURLtoFile(screenshot.annotatedBase64, originalName);
        const parseAnnotatedFile = new Parse.File(annotatedName, annotatedFile);

        const parseObject = Parse.Object.extend("setupsEntries");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", screenshot.objectId);

        const results = await query.first();
        //console.log("url orig " + screenshot.originalUrl + " annot " + screenshot.annotatedUrl)
        if (results) {
            console.log(" -> Updating")
            await parseOriginalFile.save() // before I was using then. In that case it's possible to catch error. I had to change it to await because in daily trades it was triggering the rest of the functinos in clickTradesModal too fast
            await parseAnnotatedFile.save()
            results.set("name", screenshot.name)
            results.set("symbol", screenshot.symbol)
            results.set("side", screenshot.side)
            results.set("original", parseOriginalFile)
            results.set("annotated", parseAnnotatedFile)
            results.set("originalBase64", screenshot.originalBase64)
            results.set("annotatedBase64", screenshot.annotatedBase64)
            results.set("maState", screenshot.maState)
            if (dateScreenshotEdited.value) {
                results.set("date", new Date(dayjs.tz(screenshot.dateUnix, tradeTimeZone.value).format("YYYY-MM-DDTHH:mm:ss")))
                results.set("dateUnix", Number(screenshot.dateUnix))
                results.set("dateUnixDay", dayjs(screenshot.dateUnix * 1000).tz(tradeTimeZone.value).startOf("day").unix())
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
            //console.log(" -> Setup to upload " + JSON.stringify(screenshot))
            const object = new parseObject();
            object.set("user", Parse.User.current())
            object.set("name", screenshot.name)
            object.set("symbol", screenshot.symbol)
            object.set("side", screenshot.side)
            object.set("original", parseOriginalFile)
            object.set("annotated", parseAnnotatedFile)
            object.set("originalBase64", screenshot.originalBase64)
            object.set("annotatedBase64", screenshot.annotatedBase64)
            object.set("maState", screenshot.maState)
            object.set("date", new Date(dayjs.tz(screenshot.date, tradeTimeZone.value).format("YYYY-MM-DDTHH:mm:ss")))
            object.set("dateUnix", Number(screenshot.dateUnix))
            object.set("dateUnixDay", dayjs(screenshot.dateUnix * 1000).tz(tradeTimeZone.value).startOf("day").unix())

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
    //console.log("screenshot "+JSON.stringify(screenshots))

    /* First, let's delete patterns mistakes */
    let setupToDelete = screenshots.filter(obj => obj.objectId == screenshots)[0]
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
        screenshots.length = 0
        await useGetScreenshots()
        await useInitPopover()
        resolve()
    })
}