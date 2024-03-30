import { selectedMonth, pageId, screenshots, screenshot, tradeScreenshotChanged, dateScreenshotEdited, renderData, markerAreaOpen, spinnerLoadingPage, spinnerSetups, editingScreenshot, timeZoneTrade, endOfList, screenshotsPagination, screenshotsQueryLimit, selectedItem, saveButton, resizeCompressImg, resizeCompressMaxWidth, resizeCompressMaxHeight, resizeCompressQuality, expandedScreenshot, expandedId, expandedSource, selectedScreenshot, selectedScreenshotIndex, selectedScreenshotSource, tags, selectedTags, tradeTags, screenshotsInfos } from '../stores/globals.js'
import { useLoadMore } from './utils';
import { useUpdateTags } from './daily.js';

screenshotsQueryLimit.value = 4

export function useGetScreenshotsPagination() {
    if (sessionStorage.getItem('screenshotsPagination')) {
        screenshotsQueryLimit.value = Number(sessionStorage.getItem('screenshotsPagination'))
        sessionStorage.removeItem('screenshotsPagination');
    }
}

export async function useGetScreenshots(param1, param2) {
    //param1 : true if page != screenshots and false if page == screenshots
    //param2 : if exists, it's the the unixDate of the day on daily when either clicked on Screenshots Tab or to open modal
    console.log("\nGETTING SCREENSHOTS")

    return new Promise(async (resolve, reject) => {
        const parseObject = Parse.Object.extend("screenshots");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.descending("dateUnix");
        query.exclude("original", "annotated");

        if (param1) { // if param1 == true then we're not on screenshots page
            if(!param2){
                console.log("  --> Getting Screenshots Infos")
                screenshotsInfos.length = 0 //we reinitiate, but only here so that when later you click on Screenshot tab or module, this information stays in memory
                query.greaterThanOrEqualTo("dateUnix", selectedMonth.value.start)
                query.lessThanOrEqualTo("dateUnix", selectedMonth.value.end)
                query.exclude("originalBase64", "annotatedBase64", "maState");
            }else{
                console.log("  --> Getting full Screenshots data")
                query.equalTo("dateUnixDay", param2)
            }
        }

        // if param1 inexistant or = false then we're on screenshots page
        else {
            query.limit(screenshotsQueryLimit.value);
            query.skip(screenshotsPagination.value)
        }


        await query.find().then(async (results) => {
            //console.log("results " + JSON.stringify(results))
            if (results.length > 0) {
                let parsedResult = JSON.parse(JSON.stringify(results))
                //console.log(" parsedResult "+JSON.stringify(parsedResult))
                if (pageId.value == "daily") {
                    //on daily page, when need to reset setups or else after new screenshot is added, it apreaeed double. 
                    //However, on screenshots page, we need to add to setups on new image / page load on scroll
                    screenshots.length = 0
                }

                parsedResult.forEach(element => {
                    //console.log(" element " + JSON.stringify(element.objectId))
                    let tradeTagsSelected = false
                    let selectedTagsArray = Object.values(selectedTags.value)
                    let index = tags.findIndex(obj => obj.tradeId == element.name)
                    if (index != -1) {
                        //console.log(" -> Screenshot id in tags...")
                        //console.log(" -> selected tags "+Object.values(selectedTags.value))
                        //console.log(" -> trade tags "+JSON.stringify(tags[index].tags))
                        //console.log(" includes ? "+selectedTagsArray.some(value => tags[index].tags.find(obj => obj.id === value)))
                        if (selectedTagsArray.some(value => tags[index].tags.find(obj => obj === value))) {
                            //console.log(" and with selected tags")
                            tradeTagsSelected = true
                        } else {
                            //console.log(" but with tags array length 0")
                            if (selectedTagsArray.includes("t000t")) {
                                //console.log(" but 'No Tags' is selected so we include the screenshot anyway")
                                tradeTagsSelected = true
                            } else {
                                //console.log(" but with no selected tags")
                            }
                        }
                    } else {
                        //console.log(" -> Screenshot not in tags...")
                        if (selectedTagsArray.includes("t000t")) {
                            //console.log(" but 'No Tags' is selected so we include the screenshot anyway")
                            tradeTagsSelected = true
                        }
                    }

                    const pushScreenshots = () => {
                        //console.log(" screenshot element " + JSON.stringify(element))
                        if (param2) {
                            screenshots.push(element)
                            //console.log(" pushing screenshots")
                            //console.log(" screenshots "+JSON.stringify(screenshots))
                        }

                        else{
                            let temp = {}
                            temp.objectId = element.objectId
                            temp.dateUnix = element.dateUnix
                            temp.name = element.name
                            screenshotsInfos.push(temp)
                            //console.log(" screenshotsInfos "+JSON.stringify(screenshotsInfos))
                        }
                    }

                    if (pageId.value == "daily") {
                        pushScreenshots()
                    } else {
                        if (tradeTagsSelected) {
                            pushScreenshots()
                        }
                    }
                })

            } else {
                if (pageId.value == "screenshots") {
                    endOfList.value = true
                }
            }


            //console.log(" -> Screenshots " + JSON.stringify(screenshots))
            screenshotsPagination.value = screenshotsPagination.value + screenshotsQueryLimit.value

            spinnerSetups.value = false //spinner for trades in daily
            //spinnerLoadMore.value = false
            if (pageId.value != "daily") {
                await (spinnerLoadingPage.value = false) // need await or else scroll to screenshot doesn't work
            }


        }).then(() => {
            if (sessionStorage.getItem('screenshotIdToEdit') && pageId.value == "screenshots") useScrollToScreenshot()
            resolve()
        })

    })
}

export function useScrollToScreenshot() {
    let element = document.getElementById(sessionStorage.getItem('screenshotIdToEdit'))
    if (element) {
        element.scrollIntoView()
    }
    sessionStorage.removeItem('screenshotIdToEdit');
}

async function imgFileReader(param) {
    return new Promise(async (resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(param);
        reader.onloadend = () => {
            let base64data = reader.result
            console.log("  --> Img size " + parseFloat(((base64data.length * 6) / 8) / 1000).toFixed(2) + " KB")
            screenshot.originalBase64 = base64data
            screenshot.annotatedBase64 = base64data
            screenshot.extension = base64data.substring(base64data.indexOf('/') + 1, base64data.indexOf(';base64'))
            renderData.value += 1
            resolve()
            //console.log("original " + screenshot.annotatedBase64)
        }
    })
}

export async function useSetupImageUpload(event, param1, param2, param3) {
    tradeScreenshotChanged.value = true
    if (pageId.value == "daily") {
        saveButton.value = true
        dateScreenshotEdited.value = true

        screenshot.dateUnix = param1
        screenshot.symbol = param2
        screenshot.side = param3

    }
    const file = event.target.files[0];
    /* We convert to base64 so we can read src in markerArea */

    await imgFileReader(file).then(() => {
        if (resizeCompressImg.value) {
            const originalImage = document.querySelector("#screenshotDiv");
            compressImage(originalImage);
        }
    })

}

let originalWidth
let originalHeight
let newWidth
let newHeight

export async function compressImage(imgToCompress) {
    console.log("\nRESIZING AND COMPRESSING IMAGE")
    //https://img.ly/blog/how-to-compress-an-image-before-uploading-it-in-javascript/
    // resizing the image
    originalWidth = imgToCompress.naturalWidth
    originalHeight = imgToCompress.naturalHeight
    console.log("  --> Original width " + originalWidth)
    console.log("  --> Original height " + originalHeight)

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (originalWidth > originalHeight) {
        if (originalWidth > resizeCompressMaxWidth.value) {
            newHeight = originalHeight * (resizeCompressMaxWidth.value / originalWidth);
            newWidth = resizeCompressMaxWidth.value;
        }
    } else {
        if (originalHeight > resizeCompressMaxHeight.value) {
            newWidth = originalWidth * (resizeCompressMaxHeight.value / originalHeight);
            newHeight = resizeCompressMaxHeight.value;
        }
    }
    canvas.width = Math.floor(newWidth * window.devicePixelRatio);
    canvas.height = Math.floor(newHeight * window.devicePixelRatio);
    console.log("canvas.width " + canvas.width)
    console.log("canvas.height " + canvas.height)
    context.scale(window.devicePixelRatio, window.devicePixelRatio);

    console.log(" -> Resizing")
    context.drawImage(
        imgToCompress,
        0,
        0,
        newWidth,
        newHeight
    );

    // reducing the quality of the image
    console.log(" -> Compressing")
    canvas.toBlob(
        (blob) => {
            if (blob) {

                // showing the compressed image
                //resizedImage.src = URL.createObjectURL(resizedImageBlob);
                imgFileReader(blob)
            }
        },
        "image/png",
        resizeCompressQuality.value
    );
}

export function useSetupMarkerArea(param1, param2) {
    //https://github.com/ailon/markerjs2#readme
    let elId

    if (param1 == "dailyTab" || param1 == "screenshots") { // case where multiple screenshots
        for (let key in screenshot) delete screenshot[key]
        Object.assign(screenshot, JSON.parse(JSON.stringify(param2)))
    }

    //console.log("screenshot " + JSON.stringify(screenshot))
    screenshot.objectId ? elId = "screenshotDiv-" + param1 + '-' + screenshot.objectId : elId = "screenshotDiv-" + param1 + '-' + screenshot.dateUnix

    let markerAreaId = document.getElementById(elId);
    console.log("elId " + elId)
    console.log("  --> Width " + markerAreaId.naturalWidth)
    console.log("  --> Height " + markerAreaId.naturalHeight)

    const markerArea = new markerjs2.MarkerArea(markerAreaId);
    markerArea.renderAtNaturalSize = true;
    markerArea.renderImageQuality = 1;
    markerArea.renderMarkersOnly = true
    //markerArea.targetRoot = markerAreaId.parentElement
    markerArea.settings.displayMode = 'popup';

    markerArea.availableMarkerTypes = markerArea.ALL_MARKER_TYPES;
    markerArea.settings.defaultFillColor = "#ffffffde" //note background
    markerArea.settings.defaultStrokeColor = "black" //font color
    markerArea.settings.defaultColorsFollowCurrentColors = true
    markerArea.settings.defaultStrokeWidth = 2
    markerArea.settings.defaultColor = "white"

    if (pageId.value == "daily") {
        markerArea.addEventListener('markercreating', event => {
            if (param1 == "dailyModal") {
                document.getElementById("tradesModal").style.display = "none";
            }
        })

        markerArea.addEventListener('markerselect', event => {
            if (param1 == "dailyModal") {
                document.getElementById("tradesModal").style.display = "none";
            }
        })
    }

    markerArea.addEventListener('render', event => {
        console.log("render")
        if (param1 == "dailyModal") {
            document.getElementById("tradesModal").style.display = "block";
            tradeScreenshotChanged.value = true
            dateScreenshotEdited.value = true
            saveButton.value = true

        }

        console.log("  --> Marker img size " + parseFloat(((event.dataUrl.length * 6) / 8) / 1000).toFixed(2) + " KB")

        //console.log("  --> Width "+markerAreaId.naturalWidth)
        //console.log("state " + JSON.stringify(screenshot.maState))
        markerAreaOpen.value = false


        screenshot.annotatedBase64 = event.dataUrl
        screenshot.maState = event.state

        if (param1 == "dailyTab" || param1 == "screenshots") {
            //in case of annotation in screenshot, we update the current page + we use screenshot. in useSaveScreenshot
            let index = screenshots.findIndex(obj => obj.dateUnix == screenshot.dateUnix)
            //console.log("index " + index)
            screenshots[index].annotatedBase64 = event.dataUrl
            screenshots[index].maState = event.state
            useSaveScreenshot()
        }

        renderData.value += 1
    })

    markerArea.addEventListener('close', event => {
        if (param1 == "dailyModal") {
            document.getElementById("tradesModal").style.display = "block";
        }
        markerAreaOpen.value = false
    })

    markerArea.show();
    if (markerArea.isOpen) {
        markerAreaOpen.value = true
    }

    if (screenshot.maState) {
        markerArea.restoreState(screenshot.maState)
    }
}

export function useExpandScreenshot(param1, param2) {
    //console.log("param1 "+param1+", param2 "+param2)

    if (param2) {
        expandedScreenshot.value = param2.objectId
        if (param1 == "dailyTab") {
            for (let key in screenshot) delete screenshot[key]
            Object.assign(screenshot, JSON.parse(JSON.stringify(param2)))
        }
        if (param1 == 'dailyTab' || param1 == 'screenshots') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.style.overflow = 'hidden'
        }
        expandedSource.value = param1
        expandedId.value = 'screenshotDiv-' + param1 + '-' + param2.objectId
        //console.log("expandedId.value " + expandedId.value)
    } else {//case when we close the fullscreen mode
        if (expandedSource.value == 'dailyTab' || expandedSource.value == 'screenshots') {
            document.body.style.overflow = 'visible'
            let id = document.getElementById(expandedId.value);
            id.scrollIntoView({ behavior: 'smooth' }, true);
        }
        expandedScreenshot.value = null
        expandedSource.value = null
        expandedId.value = null
    }
}

export async function useSaveScreenshot() {
    console.log("\nSAVING SCREENSHOT")
    //console.log(" -> Setup to save " + JSON.stringify(screenshot))
    return new Promise(async (resolve, reject) => {

        /**
         * CHECKS
         * **/
        if (markerAreaOpen.value == true) {
            alert("Please save your screenshot annotation")
            return
        }

        if (pageId.value == "addScreenshot") {
            if (screenshot.symbol == undefined) {
                alert("Please add symbol")
                return
            }
            if (!editingScreenshot.value && tradeScreenshotChanged.value == false) {
                alert("Please add a screenshot")
                return
            }
        }

        if (pageId.value == "addScreenshot") {
            spinnerLoadingPage.value = true
            //spinnerLoadingPageText.value = "Uploading screenshot ..."
            if (!editingScreenshot.value || (editingScreenshot.value && dateScreenshotEdited.value)) {
                screenshot.dateUnix = dayjs.tz(screenshot.date, timeZoneTrade.value).unix()
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


        /* UPLOAD SCREENSHOT */
        //in case it's the first time and no tags, we do not save tags
        console.log(" tradeTags " + JSON.stringify(tradeTags))
        if (!editingScreenshot.value && tradeTags.length == 0) {
            //console.log(" first time no tags")
            await useUploadScreenshotToParse()
        } else {
            //console.log("tags")
            await useUpdateTags()
            await useUploadScreenshotToParse()
        }

        resolve()
    })
}

export async function useUploadScreenshotToParse() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Uploading to database")

        //spinnerLoadingPageText.value = "Uploading Screenshot ..."

        /* creating names, recreating files and new parse files */

        const parseObject = Parse.Object.extend("screenshots");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", screenshot.objectId);

        const results = await query.first();
        //console.log("url orig " + screenshot.originalUrl + " annot " + screenshot.annotatedUrl)
        if (results) {
            console.log(" -> Updating")
            //console.log("screenshot: "+JSON.stringify(screenshot))
            //await parseOriginalFile.save() // before I was using then. In that case it's possible to catch error. I had to change it to await because in daily trades it was triggering the rest of the functinos in clickTradesModal too fast
            //await parseAnnotatedFile.save()
            results.set("name", screenshot.name)
            results.set("symbol", screenshot.symbol)
            results.set("side", screenshot.side)
            results.set("originalBase64", screenshot.originalBase64)
            results.set("annotatedBase64", screenshot.annotatedBase64)
            results.set("markersOnly", true)
            results.set("maState", screenshot.maState)
            if (dateScreenshotEdited.value) {
                results.set("date", new Date(dayjs.unix(screenshot.dateUnix).tz(timeZoneTrade.value).format("YYYY-MM-DDTHH:mm:ss")))
                results.set("dateUnix", Number(screenshot.dateUnix))
                results.set("dateUnixDay", dayjs(screenshot.dateUnix * 1000).tz(timeZoneTrade.value).startOf("day").unix())
            }
            results.save().then(async () => {
                console.log(' -> Updated screenshot with id ' + results.id)
                if (pageId.value == "addScreenshot") {
                    window.location.href = "/screenshots"
                }

                if (pageId.value == "daily") {
                    await useGetScreenshots(true, dayjs(screenshot.dateUnix * 1000).tz(timeZoneTrade.value).startOf("day").unix())
                    await useGetScreenshots(true) // but also update screenshot infos
                    const file = document.querySelector('.screenshotFile');
                    if (file) file.value = '';
                }
                resolve()

            }, (error) => {
                console.log('Failed to update new object, with error code: ' + error.message);
                //window.location.href = "/screenshots"
                spinnerLoadingPage.value = false
            })

        } else {
            console.log(" -> Saving")

            //await parseOriginalFile.save()
            //await parseAnnotatedFile.save()
            //console.log(" -> Setup to upload " + JSON.stringify(screenshot))
            const object = new parseObject();
            object.set("user", Parse.User.current())
            object.set("name", screenshot.name)
            object.set("symbol", screenshot.symbol)
            object.set("side", screenshot.side)
            object.set("originalBase64", screenshot.originalBase64)
            object.set("annotatedBase64", screenshot.annotatedBase64)
            object.set("markersOnly", true)
            object.set("maState", screenshot.maState)
            object.set("date", new Date(dayjs.unix(screenshot.dateUnix).tz(timeZoneTrade.value).format("YYYY-MM-DDTHH:mm:ss")))
            object.set("dateUnix", Number(screenshot.dateUnix))
            object.set("dateUnixDay", dayjs(screenshot.dateUnix * 1000).tz(timeZoneTrade.value).startOf("day").unix())

            object.setACL(new Parse.ACL(Parse.User.current()));

            object.save()
                .then(async (object) => {
                    console.log('  --> Added new screenshot with id ' + object.id)
                    if (pageId.value == "addScreenshot") {
                        window.location.href = "/screenshots"
                    }
                    if (pageId.value == "daily") {
                        await useGetScreenshots(true, dayjs(screenshot.dateUnix * 1000).tz(timeZoneTrade.value).startOf("day").unix()) //get full data (in daily modal)
                        await useGetScreenshots(true) // but also update screenshot infos
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
    console.log(" -> Selected item " + selectedItem.value)
    //console.log("screenshot "+JSON.stringify(screenshots))

    /* Now, let's delete screenshot */
    const parseObject = Parse.Object.extend("screenshots");
    const query = new Parse.Query(parseObject);
    query.equalTo("objectId", selectedItem.value);
    const results = await query.first();

    if (results) {
        await results.destroy()
        console.log('  --> Deleted screenshot with id ' + results.id)
        //document.location.reload()
        if (pageId.value == 'screenshots') {
            await useRefreshScreenshot()
        }
        if (pageId.value == 'daily') {
            let index = screenshots.findIndex(obj => obj.objectId == selectedItem.value)
            for (let key in screenshots[index]) delete screenshots[index][key]
            for (let key in screenshot) delete screenshot[key]
            selectedItem.value = null
        }
    } else {
        alert("There was a problem with the query")
    }
}

export async function useRefreshScreenshot() {
    return new Promise(async (resolve, reject) => {
        await (spinnerLoadingPage.value = true)
        screenshotsQueryLimit.value = 4
        screenshotsPagination.value = 0
        screenshots.length = 0
        await useGetScreenshots(false)
        selectedItem.value = null
        //await useInitPopover()
        resolve()
    })
}

export async function useSelectedScreenshotFunction(param1, param2, param3) {
    //console.log("Index "+param1)
    selectedScreenshotIndex.value = param1
    selectedScreenshotSource.value = param2
    //console.log("selectedScreenshotIndex " + selectedScreenshotIndex.value)
    //console.log("screenshots length "+screenshots.length)
    //console.log("selectedScreenshotSource " + selectedScreenshotSource.value)
    //Case where there is index (so screenshots) and we get to end array on screenshots page
    if (param1 && ((param1 + 2) == screenshots.length) && !endOfList.value) {
        useLoadMore()
    }


    //Case where param3 exists, index exists / and click on next (pages: screenshots, daily in tab)
    if (param1 >= 0) {
        for (let key in selectedScreenshot) delete selectedScreenshot[key]
        Object.assign(selectedScreenshot, screenshots[param1])
        //console.log("screenshots length "+screenshots.length)
    }
    //case where no index, so simple full screen without "carousel"
    else {
        //console.log("Object id " + param3.objectId)
        Object.assign(selectedScreenshot, param3)
    }

    //console.log("selectedScreenshot id  " + selectedScreenshot.objectId)
}