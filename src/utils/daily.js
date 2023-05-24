import { excursions, queryLimit, tradeSatisfactionArray } from "../stores/globals";

export async function useGetTradesSatisfaction() {
    return new Promise(async (resolve, reject) => {
        console.log("\nGETTING SATISFACTION FOR EACH TRADE");
        const parseObject = Parse.Object.extend("satisfactions");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.exists("tradeId") /// this is how we differentiate daily from trades satisfaction records
        query.limit(queryLimit.value); // limit to at most 10 results
        tradeSatisfactionArray.length = 0
        const results = await query.find();
        for (let i = 0; i < results.length; i++) {
            let temp = {}
            const object = results[i];
            temp.id = object.get('tradeId')
            temp.satisfaction = object.get('satisfaction')
            tradeSatisfactionArray.push(temp)
        }
        //console.log(" -> Trades satisfaction " + JSON.stringify(tradeSatisfactionArray))

        resolve()

    })
}

export async function useGetExcursions() {
    return new Promise(async (resolve, reject) => {
        console.log("\nGETTING EXCURSIONS")
        const parseObject = Parse.Object.extend("excursions");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.ascending("order");
        query.limit(queryLimit.value); // limit to at most 10 results
        excursions.length = 0
        const results = await query.find();
        results.forEach(element => {
            excursions.push(JSON.parse(JSON.stringify(element)))
        });
        
        //console.log(" -> excursions " + JSON.stringify(excursions))
        resolve()
    })
}