Different brokers have different export options so on this page you will find instructions for some of the brokers supported by TradeNote.

Export instructions are written with the help other TradeNote users in the community. Contact me if you want to contribute as well.

You contact me via [Discord](https://discord.gg/ZbHekKYb85 "Discord") if you wish to integrate your broker. Alternatively, you can use the [template](https://github.com/Eleven-Trading/TradeNote/blob/main/brokers/Template.csv "template") and adapt it to your export file.


# Template
If you wish to adapt your export file to the template, below is the explanation for each of the columns. 
Note : make sure to input one execution per line, not aggregated trade. So one line = one execution

- Account: your accound id or name
- T/D: trade date in MM/DD/YYYY format
- S/D: same as T/D, trade date in MM/DD/YYYY format
- Currency: currency applied to the price of symbol
- Type: not relevant. Put 0
- Side: side of the execution
    - B: Buy
    - S: Sell
    - SS: Short
    - BC: Buy cover
- Symbol: symbol
- Qty: number of shares executed
- Price: price of symbol
- Exec Time: trade time in HH:mm:ss format
- Comm: commissions. Must be a positive number
- SEC: SEC fees. Put 0 if not applicable
- TAF: TAF fees. Put 0 if not applicable
- NSCC: NSCC fees. Put 0 if not applicable. 
- Nasdaq: Nasdaq fees. Put 0 if not applicable
- ECN Remove: not applicable. Put 0
- ECN Add: not applicable. Put 0
- Gross Proceeds
- Net Proceeds: gross proceeds minus commissions and fees
- Clr Broker: not applicable. Leave blank
- Liq: not applicable. Leave blank
- Note: not applicable. Leave blank

# Interactive Brokers
#### Navigating to Flex Queries
1. Login to the Portal
2. Select the Performance & Reports tab (top of the page, under the Search Box)
3. Select Flex Queries
    1. There are 2 options available, Activity Flex Query and Trade Confirmation Flex Query.
    2. We are interested in the Trade Confirmation Flex Query

#### Setting up a new Flex Query
1. Under the Trade Confirmation Flex Query panel, click the Create, +, button.
2. At the Create Trade Confirmation Flex Query page, select the following options
    1. Trade Confirmation Flex Query Details: Provide a Query Name (ex. TradeNoteExport)
    2. Sections
        1. Click Trade Confirmation and only select Executions
        2. From there, you can either
            1. Check the following boxes manually: Account ID, Trade Date, Settle Date, Currency, Underlying Symbol, Symbol, Buy/Sell, Quantity, Price, Order Time, Commission, Code, Broker Execution Commission, Broker Clearing Commission, Third-Party Execution Commission, Thirs-Party Clearing Commission, Other Commissions, Proceeds, Net Cash, Trade ID, Order ID, AssetClass, Multiplier, Put/Call
           2. Or execute the following script using your browser's DevTools console:
            ```js
            const fields=["Account ID","Trade Date","Settle Date","Currency","Underlying Symbol","Symbol","Buy/Sell","Quantity","Price","Order Time","Commission", "Code", "Broker Execution Commission","Broker Clearing Commission","Third-Party Execution Commission","Thirs-Party Clearing Commission","Other Commissions","Proceeds","Net Cash","Trade ID","Order ID","AssetClass","Multiplier","Put/Call"],container=document.querySelector('tbody[class="ui-sortable"]'),trs=container.querySelectorAll("tr");trs.forEach(e=>{let r=e.querySelectorAll("td"),t=r[1].childNodes[0].textContent;if(fields.includes(t)){let i=e.querySelector('input[type="checkbox"]');i.click()}});
            ```
        4. Scroll to the bottom of the dialog and select Save
    3. Delivery Configuration
        1. Models: Optional
        2. Format: CSV
        3. Include header and trailer records?: No
        4. Include column headers?: Yes
        5. Include section code and line descriptor? No
        6. Period: Today (or any other option)
    4. General Configuration
        1. Date Format: yyyyMMdd
        2. Time Format: HHMMSS
        3. Date/Time Separator: ;(semi-colon)
        4. Include Canceled Trades?: No
        5. Include Audit Trail Fields?: No
        6. Display Account Alias in Place of Account ID?: No
    5. Select Continue
3. On the Review Your Trade Confirmation Flex Query page, click Save Changes
4. On the Trade Confirm Flex Query Saved page, click Ok
5. Notice your new Flex Query is now available under the Trade Confirmation Flex Query panel

#### Executing your Flex Query
1. Use the Run (right arrow icon) to generate a new report
2. In the TradeNoteExport (name of your Flex Query) dialog, select
    1. Period: <Your desired date range>
    2. Format: CSV
    3. Click Run
3. At this point, your file should be downloaded and available to use

#### Cleanup before importing to TradeNote
Before attempting to import data, there are a few things that may help.
- Remove any empty lines that may be present in your CSV file
- If multiple accounts are present, isolate them to 1 account at a time
- If trading options, futures, etc., ensure the Underlying Symbol exists
- May need to set the Underlying Symbol as the ticker from the Symbol column
- Sort the trades by Order Time

- Remove any Open Trades
- Add an Order Time to Expired Contracts rather than leaving the fields empty
- Format prices to 2 decimal places to prevent dealing with floating point precision errors

# TD Ameritrade (thinkorswim)
Please use the standalone thinkorswim application and follow the steps below.

1. Navigate to the "Monitor" tab, then "Account Statement" tab.
2. From "days back from today" dropdown, filter the date range.
3. From "Transactions" dropdown, select "Trades" and deselect all others.
4. From the top right corner (underneath "OnDemand" button), click the Actions menu (3-dashes) and "Export to file". 
5. Save the .csv file to your desktop.
<div style="text-align: center;"><img style="margin-right:30px" src="https://f003.backblazeb2.com/file/7ak-public/tradenote/TD1.png" width="200">
<img src="https://f003.backblazeb2.com/file/7ak-public/tradenote/TD2.png" width="200"></div>

# TradeStation
1. Select the "Orders" tab at the bottom of the TradeManager window in TradeStation.
2. Choose "Filled Orders" from the "Status" drop-down menu at the top of the screen.
3. Press the "Retrieve Orders" button after entering the date range that you want to import.
4. Sort by Filled/Canceled orders in ascending order (e.g., oldest first) by changing the sort order.
5. Select "Copy" by right-clicking after clicking (ticking) the upper-left "square" right beneath "Symbol Filter" label. 
6. Paste the transactions into the text box in TradeNote.

Note: currently, TradeNote does not take into account ECN fees (available soon).

# Tradovate
1. click on the Account tab, then choose the account to export.
2. select "Orders".
3. Select time window of history data.
4. Download as CSV.

# MetaTrader 5 (MT 5)
Please use the standalone MT5 windows application and follow the steps below. 

1. In the MetaTrader Terminal window, select the History tab.
2. Right-click on any order in the account history, and select the time period you want to export.
3. Right-click on any order in the account history, and select Report.
4. Save the report as an "Open XML (MS Office Excel 2007)" file to your desktop (or anywhere else - just remember where you put it).
<div style="text-align: center;"><img style="margin-right:30px" src="https://f003.backblazeb2.com/file/7ak-public/tradenote/MT51.png" width="200">

# HeldenTrader Pro
1. In the upper section of the application select the "Account" button.
2. In the dropdown menu select "Reports" and a new window "Reports" will appear.
3. Select in the "Report type" dropdown menu - "Trades report".
4. Select the timeframe you want to export in the "From" - "To" dropdown menu. One export file can contain one or more trading days/weeks.
5. Select "Export to CSV".
<div style="text-align: center;"><img style="margin-right:30px" src="https://f003.backblazeb2.com/file/7ak-public/tradenote/HeldenTrader1.png" width="200">
<img src="https://f003.backblazeb2.com/file/7ak-public/tradenote/HeldenTrader2.png" width="200"></div>

# Rithmic
1. Open your Rithmic Trader application.
2. Navigate to the <b>Order History</b> window.
3. In the top nav bar find <b>Account</b> drop down and select which account you would like to track.
4. In the top nav bar find <b>Date</b> drop down and select the trading session you would like to upload.
5. Select <b>Export as CSV</b> in the top nav bar.

Please note that trades need to be ordered in ascending order 

# FundTraders
1. Login to your account
2. Click Reports on the left pane
3. Click Trade History
4. Click View Report
5. Click download as csv

# NinjaTrader
1. In the NinjaTrader 8 Control Panel Window, select New, and choose Trade Performance.
2. In the top right corner of the Trade Performance window, choose the date(s) you would like to export.  To export a single day, please ensure both fields reflect the same day you wish to export.
3. Click the 'funnel' icon in the top left of the Trade Performace window, and ensure only the account you wish to export is selected.
4. Next, change the "Display" dropdown menu to "Executions".
5. In the Trade Performance window, click the "Generate" button in the top right corner.
6. Right-click anywhere in the output window, and choose "Export".
7. Next, change the "Save as type" field to "CSV (*.csv).
8. Finally, click "Save".  Your exported file will save to the location specified