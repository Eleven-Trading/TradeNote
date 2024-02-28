import { excursions, queryLimit, satisfactionArray, satisfactionTradeArray, tags, selectedRange, availableTags, currentUser } from "../stores/globals";

export async function useGetSatisfactions() {
    return new Promise(async (resolve, reject) => {
        console.log("\nGETTING SATISFACTIONS");
        satisfactionTradeArray.length = 0
        satisfactionArray.length = 0
        let startD = selectedRange.value.start
        let endD = selectedRange.value.end
        const parseObject = Parse.Object.extend("satisfactions");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.greaterThanOrEqualTo("dateUnix", startD)
        query.lessThan("dateUnix", endD)
        query.limit(queryLimit.value); // limit to at most 10 results

        const results = await query.find();
        for (let i = 0; i < results.length; i++) {
            let temp = {}
            const object = results[i];
            temp.tradeId = object.get('tradeId')
            temp.satisfaction = object.get('satisfaction')
            temp.dateUnix = object.get('dateUnix')
            if (temp.tradeId != undefined) {
                satisfactionTradeArray.push(temp)
            } else {
                satisfactionArray.push(temp)
            }

        }
        //console.log(" -> Trades satisfaction " + JSON.stringify(satisfactionArray))
        resolve()

    })
}


export async function useGetExcursions() {
    return new Promise(async (resolve, reject) => {
        console.log("\nGETTING EXCURSIONS")
        let startD = selectedRange.value.start
        let endD = selectedRange.value.end
        const parseObject = Parse.Object.extend("excursions");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.ascending("order");
        query.greaterThanOrEqualTo("dateUnix", startD)
        query.lessThan("dateUnix", endD)
        query.limit(queryLimit.value); // limit to at most 10 results
        excursions.length = 0
        const results = await query.find();
        results.forEach(element => {
            const parseElement = JSON.parse(JSON.stringify(element))
            excursions.push(parseElement)
        });
        //console.log(" -> excursions " + JSON.stringify(excursions))
        resolve()
    })
}

export async function useGetTags() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting Tags");
        tags.length = 0
        let startD = selectedRange.value.start
        let endD = selectedRange.value.end
        const parseObject = Parse.Object.extend("tags");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.greaterThanOrEqualTo("dateUnix", startD)
        query.lessThan("dateUnix", endD)
        query.limit(queryLimit.value); // limit to at most 10 results

        const results = await query.find();
        //console.log(" results "+JSON.stringify(results))
        for (let i = 0; i < results.length; i++) {
            let temp = {}
            const object = results[i];
            temp.tradeId = object.get('tradeId')
            temp.tags = object.get('tags')
            temp.dateUnix = object.get('dateUnix')
            tags.push(temp)

        }
        //console.log("  --> Tags " + JSON.stringify(tags))
        resolve()

    })
}

export async function useGetAvailableTags() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting Available Tags");
        availableTags.splice(0);


        const parseObject = Parse.Object.extend("_User");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", currentUser.value.objectId);
        const results = await query.first();
        if (results) {
            let parsedResults = JSON.parse(JSON.stringify(results))
            let currentTags = parsedResults.tags

            if (currentTags != undefined) {
                for (let index = 0; index < currentTags.length; index++) {
                    const element = currentTags[index];
                    availableTags.push(element)
                    if ((index + 1) == currentTags.length) {
                        console.log("  --> Available Tags " + JSON.stringify(availableTags))
                        resolve()
                    }
                }
            }
        }

        /*let currentTags = currentUser.value.tags
        if (currentTags != undefined){
            for (let index = 0; index < currentTags.length; index++) {
                const element = currentTags[index];
                availableTags.push(element)   
            }
        }  

        console.log("  --> Available Tags " + JSON.stringify(availableTags))
        resolve()*/

    })
}