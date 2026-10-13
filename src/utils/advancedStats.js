/*
 * ADVANCED STATS (personal fork)
 *
 * Pure functions: no Vue, Parse or store imports, so they can be tested in plain Node.
 * Input  : the flat list of filtered trades (temp1 in trades.js) + { amountCase, timeZone }
 * Output : one plain object that is copied into the reactive `advancedStats` store.
 *
 * Only CLOSED trades are used (tradesCount > 0). P&L per trade is
 * trade[amountCase + 'Proceeds'] where amountCase is 'gross' or 'net', exactly like the rest of TradeNote.
 */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const WEEKDAY_INDEX = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }

const sum = (arr) => arr.reduce((a, b) => a + b, 0)
const mean = (arr) => (arr.length ? sum(arr) / arr.length : null)

function stdDev(arr) { // sample standard deviation
    if (arr.length < 2) return null
    const m = mean(arr)
    return Math.sqrt(sum(arr.map(x => (x - m) ** 2)) / (arr.length - 1))
}

function median(arr) {
    if (!arr.length) return null
    const s = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(s.length / 2)
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

function isClosed(t) {
    if (t.tradesCount !== undefined) return t.tradesCount > 0
    return t.openPosition !== true
}

function makeZoneParts(timeZone) {
    let fmt
    try {
        fmt = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", hour: "numeric", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit" })
    } catch (e) {
        fmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", hour: "numeric", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit" })
    }
    return (unixSeconds) => {
        const parts = fmt.formatToParts(new Date(unixSeconds * 1000))
        const get = (type) => parts.find(p => p.type === type)?.value
        return {
            weekday: WEEKDAY_INDEX[get("weekday")],
            hour: parseInt(get("hour"), 10) % 24,
            date: get("year") + "-" + get("month") + "-" + get("day"),
            month: get("year") + "-" + get("month"),
        }
    }
}

/*
 * Max drawdown of a series of P&L values. Equity starts at 0.
 * Recovery lengths count observations after the prior high until equity
 * returns to that high or exceeds it. For daily values, one observation is
 * one distinct trading day.
 */
function drawdownOf(values) {
    let equity = 0, peak = 0, maxDD = 0, maxDDPeak = 0, ddStartIdx = -1, ddEndIdx = -1, peakIdx = -1
    let recoveryStartIdx = null, maxRecoveryLength = 0
    const equityCurve = [], ddCurve = []
    values.forEach((v, i) => {
        equity += v
        if (equity > peak) { peak = equity; peakIdx = i }
        const dd = equity - peak // <= 0
        equityCurve.push(equity)
        ddCurve.push(dd)
        if (-dd > maxDD) { maxDD = -dd; maxDDPeak = peak; ddStartIdx = peakIdx; ddEndIdx = i }
        if (dd < 0) {
            if (recoveryStartIdx === null) recoveryStartIdx = peakIdx
            maxRecoveryLength = Math.max(maxRecoveryLength, i - recoveryStartIdx)
        } else if (recoveryStartIdx !== null) {
            maxRecoveryLength = Math.max(maxRecoveryLength, i - recoveryStartIdx)
            recoveryStartIdx = null
        }
    })
    return {
        maxDrawdown: maxDD,
        maxDrawdownPctOfPeak: maxDDPeak > 0 ? maxDD / maxDDPeak : null,
        ddStartIdx, ddEndIdx, equityCurve, ddCurve,
        currentDrawdown: ddCurve.length ? -ddCurve[ddCurve.length - 1] : 0,
        maxRecoveryLength,
        currentRecoveryLength: recoveryStartIdx === null ? 0 : values.length - 1 - recoveryStartIdx,
    }
}

function streaks(values) {
    let maxWin = 0, maxLoss = 0, curType = null, curLen = 0
    values.forEach(v => {
        const type = v > 0 ? "win" : v < 0 ? "loss" : null
        if (type && type === curType) curLen++
        else { curType = type; curLen = type ? 1 : 0 }
        if (curType === "win" && curLen > maxWin) maxWin = curLen
        if (curType === "loss" && curLen > maxLoss) maxLoss = curLen
    })
    return { maxWinStreak: maxWin, maxLossStreak: maxLoss, currentStreakType: curType, currentStreakLength: curLen }
}

function bucketStats(pnls) {
    const n = pnls.length
    const wins = pnls.filter(x => x > 0).length
    return { count: n, winRate: n ? wins / n : null, avgPnl: mean(pnls), totalPnl: sum(pnls) }
}

function histogram(values, binsWanted = 12) {
    if (values.length < 2) return { labels: [], centers: [], counts: [] }
    const min = Math.min(...values), max = Math.max(...values)
    if (min === max) return { labels: [String(min)], centers: [min], counts: [values.length] }
    const bins = Math.min(binsWanted, Math.max(5, Math.round(Math.sqrt(values.length) * 2)))
    const width = (max - min) / bins
    const counts = new Array(bins).fill(0)
    values.forEach(v => {
        let idx = Math.floor((v - min) / width)
        if (idx >= bins) idx = bins - 1
        counts[idx]++
    })
    const centers = counts.map((_, i) => min + width * (i + 0.5))
    const labels = counts.map((_, i) => {
        const a = min + width * i, b = a + width
        return Math.round(a) + " to " + Math.round(b)
    })
    return { labels, centers, counts }
}

function buildTagPerformance(trades, tagRecords = [], tagDefinitions = []) {
    const names = new Map()
    tagDefinitions.forEach(group => (group.tags || []).forEach(tag => names.set(tag.id, tag.name)))
    const byTag = new Map()
    const records = new Map(tagRecords.map(record => [String(record.tradeId), record.tags || []]))

    trades.forEach(x => {
        const tradeTags = records.get(String(x.t.id)) || []
        tradeTags.forEach(tagId => {
            if (!byTag.has(tagId)) byTag.set(tagId, { tagId, tradeCount: 0, totalPnl: 0, wins: 0 })
            const summary = byTag.get(tagId)
            summary.tradeCount++
            summary.totalPnl += x.pnl
            if (x.pnl > 0) summary.wins++
        })
    })

    return [...byTag.values()]
        .map(summary => ({
            tagId: summary.tagId,
            label: names.get(summary.tagId) || summary.tagId,
            tradeCount: summary.tradeCount,
            totalPnl: summary.totalPnl,
            winRate: summary.tradeCount ? summary.wins / summary.tradeCount : null,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
}

export function computeAdvancedStats(allTrades, opts = {}) {
    const amountCase = opts.amountCase === "gross" ? "gross" : "net"
    const timeZone = opts.timeZone || "America/New_York"
    const zoneParts = makeZoneParts(timeZone)
    const key = amountCase + "Proceeds"

    const trades = (allTrades || [])
        .filter(isClosed)
        .map(t => ({
            t,
            pnl: Number(t[key]) || 0,
            orderTime: t.exitTime > 0 ? t.exitTime : t.entryTime,
        }))
        .sort((a, b) => a.orderTime - b.orderTime)

    const n = trades.length
    if (n === 0) return { n: 0, amountCase }

    const pnls = trades.map(x => x.pnl)
    const winsArr = pnls.filter(x => x > 0)
    const lossArr = pnls.filter(x => x < 0)
    const decisive = winsArr.length + lossArr.length
    const avgWin = mean(winsArr)
    const avgLoss = lossArr.length ? -mean(lossArr) : null // positive magnitude
    const totalWinningPnl = sum(winsArr)
    const totalLosingPnl = -sum(lossArr)
    const calculatedProfitFactor = totalLosingPnl > 0 && Number.isFinite(totalWinningPnl) && Number.isFinite(totalLosingPnl)
        ? totalWinningPnl / totalLosingPnl
        : null
    const profitFactor = Number.isFinite(calculatedProfitFactor) ? calculatedProfitFactor : null
    const winRateDecisive = decisive ? winsArr.length / decisive : null
    const payoffRatio = avgWin !== null && avgLoss ? avgWin / avgLoss : null
    const expectancy = mean(pnls)

    /* ---- Trade level drawdown + streaks ---- */
    const tradeDD = drawdownOf(pnls)
    const st = streaks(pnls)

    /* ---- Daily series ---- */
    const dailyMap = {}
    trades.forEach(x => {
        const d = x.t.td
        dailyMap[d] = (dailyMap[d] || 0) + x.pnl
    })
    const dailyDates = Object.keys(dailyMap).map(Number).sort((a, b) => a - b)
    const dailyPnls = dailyDates.map(d => dailyMap[d])
    const dailyDD = drawdownOf(dailyPnls)
    const dailyMean = mean(dailyPnls)
    const dailyStd = stdDev(dailyPnls)
    const downsideDev = Math.sqrt(sum(dailyPnls.map(x => Math.min(0, x) ** 2)) / dailyPnls.length)
    const sharpeDaily = dailyStd ? dailyMean / dailyStd : null
    const sortinoDaily = downsideDev ? dailyMean / downsideDev : null
    const annual = Math.sqrt(252)

    /* ---- Weekday performance: local trading date, Monday through Friday ---- */
    const weekdayRows = WEEKDAYS.slice(0, 5).map(label => ({
        label,
        pnl: 0,
        tradingDays: 0,
        tradeCount: 0,
        wins: 0,
        dates: new Set(),
    }))
    trades.forEach(x => {
        const p = zoneParts(x.orderTime)
        if (!Number.isInteger(p.weekday) || p.weekday < 0 || p.weekday >= weekdayRows.length) return
        const row = weekdayRows[p.weekday]
        row.pnl += x.pnl
        row.tradeCount++
        if (x.pnl > 0) row.wins++
        row.dates.add(p.date)
    })
    const weekdayPerformance = weekdayRows.map(row => ({
        label: row.label,
        pnl: row.tradeCount ? row.pnl : null,
        tradingDays: row.dates.size,
        tradeCount: row.tradeCount,
        winRate: row.tradeCount ? row.wins / row.tradeCount : null,
    }))

    /* ---- Holding time ---- */
    const holdWin = [], holdLoss = []
    trades.forEach(x => {
        const secs = x.t.exitTime - x.t.entryTime
        if (x.t.exitTime > 0 && secs >= 0) {
            if (x.pnl > 0) holdWin.push(secs)
            if (x.pnl < 0) holdLoss.push(secs)
        }
    })

    /* ---- Fees ---- */
    const totalFees = sum(trades.map(x => (x.t.commission || 0) + (x.t.sec || 0) + (x.t.taf || 0) + (x.t.nscc || 0) + (x.t.nasdaq || 0)))
    const grossWinsTotal = sum(trades.map(x => Math.max(0, Number(x.t.grossProceeds) || 0)))

    /* ---- Heatmap (entry weekday x entry hour) and monthly ---- */
    const heat = {}
    const monthly = {}
    trades.forEach(x => {
        const p = zoneParts(x.t.entryTime)
        if (p.weekday === undefined || Number.isNaN(p.hour)) return
        const k = p.hour + "_" + p.weekday
        if (!heat[k]) heat[k] = { hour: p.hour, weekday: p.weekday, pnl: 0, count: 0 }
        heat[k].pnl += x.pnl
        heat[k].count++
        const pm = zoneParts(x.orderTime).month
        if (!monthly[pm]) monthly[pm] = []
        monthly[pm].push(x.pnl)
    })
    const heatCells = Object.values(heat)
    const hoursUsed = [...new Set(heatCells.map(c => c.hour))].sort((a, b) => a - b)
    const hourRange = hoursUsed.length ? Array.from({ length: hoursUsed[hoursUsed.length - 1] - hoursUsed[0] + 1 }, (_, i) => hoursUsed[0] + i) : []

    /* ---- Behaviour: trade number of the day, after win / after loss ---- */
    const byDay = {}
    trades.forEach(x => { (byDay[x.t.td] = byDay[x.t.td] || []).push(x) })
    const afterLoss = [], afterWin = [], firstOfDay = []
    const byNumber = { 1: [], 2: [], 3: [], 4: [], "5+": [] }
    Object.values(byDay).forEach(list => {
        list.sort((a, b) => a.t.entryTime - b.t.entryTime)
        list.forEach((x, i) => {
            byNumber[i + 1 >= 5 ? "5+" : i + 1].push(x.pnl)
            if (i === 0) firstOfDay.push(x.pnl)
            else {
                const prev = list[i - 1].pnl
                if (prev < 0) afterLoss.push(x.pnl)
                else if (prev > 0) afterWin.push(x.pnl)
            }
        })
    })

    /* ---- Position size terciles ---- */
    let bySize = null
    if (n >= 9) {
        const sized = trades.map(x => ({ size: Math.max(x.t.buyQuantity || 0, x.t.sellQuantity || 0), pnl: x.pnl })).sort((a, b) => a.size - b.size)
        const third = Math.floor(sized.length / 3)
        const parts = [sized.slice(0, third), sized.slice(third, sized.length - third), sized.slice(sized.length - third)]
        bySize = ["Small", "Medium", "Large"].map((label, i) => ({
            label,
            minSize: parts[i][0].size,
            maxSize: parts[i][parts[i].length - 1].size,
            ...bucketStats(parts[i].map(x => x.pnl)),
        }))
    }

    return {
        n,
        amountCase,
        totalPnl: sum(pnls),

        /* Per trade */
        winCount: winsArr.length,
        lossCount: lossArr.length,
        breakevenCount: n - decisive,
        winRateDecisive,
        avgWin,
        avgLoss,
        payoffRatio,
        profitFactor,
        expectancy,
        expectancyInLossUnits: avgLoss ? expectancy / avgLoss : null,
        medianTrade: median(pnls),
        stdDevTrade: stdDev(pnls),
        bestTrade: Math.max(...pnls),
        worstTrade: Math.min(...pnls),
        kelly: payoffRatio && winRateDecisive !== null ? winRateDecisive - (1 - winRateDecisive) / payoffRatio : null,

        /* Streaks */
        ...st,

        /* Drawdown */
        maxDrawdown: tradeDD.maxDrawdown,
        maxDrawdownPctOfPeak: tradeDD.maxDrawdownPctOfPeak,
        currentDrawdown: tradeDD.currentDrawdown,
        maxDailyDrawdown: dailyDD.maxDrawdown,
        maxRecoveryTrades: tradeDD.maxRecoveryLength,
        currentRecoveryTrades: tradeDD.currentRecoveryLength,
        maxRecoveryDays: dailyDD.maxRecoveryLength,
        currentRecoveryDays: dailyDD.currentRecoveryLength,
        drawdownChart: { dates: dailyDates, equity: dailyDD.equityCurve, drawdown: dailyDD.ddCurve },

        /* Daily */
        tradingDays: dailyPnls.length,
        profitableDaysPct: dailyPnls.filter(x => x > 0).length / dailyPnls.length,
        avgDay: dailyMean,
        bestDay: Math.max(...dailyPnls),
        worstDay: Math.min(...dailyPnls),
        sharpeDaily,
        sortinoDaily,
        sharpeAnnualized: sharpeDaily !== null ? sharpeDaily * annual : null,
        sortinoAnnualized: sortinoDaily !== null ? sortinoDaily * annual : null,
        weekdayPerformance,
        tagPerformance: buildTagPerformance(trades, opts.tags, opts.tagDefinitions),

        /* Time held */
        avgHoldWinSeconds: mean(holdWin),
        avgHoldLossSeconds: mean(holdLoss),

        /* Fees */
        totalFees,
        feesPctOfGrossWins: grossWinsTotal > 0 ? totalFees / grossWinsTotal : null,

        /* Distribution + heatmap + monthly */
        distribution: histogram(pnls),
        heatmap: {
            weekdays: WEEKDAYS,
            hours: hourRange,
            cells: heatCells,
            maxAbs: heatCells.length ? Math.max(...heatCells.map(c => Math.abs(c.pnl))) : 0,
        },
        monthly: Object.keys(monthly).sort().map(m => ({ month: m, ...bucketStats(monthly[m]) })),

        /* Behaviour */
        behavior: {
            firstOfDay: bucketStats(firstOfDay),
            afterWin: bucketStats(afterWin),
            afterLoss: bucketStats(afterLoss),
            byTradeNumber: Object.keys(byNumber).filter(k => byNumber[k].length).map(k => ({ label: k, ...bucketStats(byNumber[k]) })),
            bySize,
        },
    }
}
