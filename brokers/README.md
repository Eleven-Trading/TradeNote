Different brokers have different export options so on this page you will find instructions for some of the brokers supported by TradeNote.

Export instructions are written with the help other TradeNote users in the community. Contact me if you want to contribute as well.

You contact me via [Discord](https://discord.gg/ZbHekKYb85 "Discord") if you wish to integrate your broker. Alternatively, you can use the [template](https://github.com/Eleven-Trading/TradeNote/blob/main/brokers/Template.csv "template") and adapt it to your export file.


# Template
If you wish to adapt your export file to the template, below is the explanation for each of the columns. 
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
        2. From there, check the following boxes
            1. Account ID
            2. Trade Date
            3. Settle Date
            4. Currency
            5. Underlying Symbol
            6. Symbol
            7. Buy/Sell
            8. Quantity
            9. Price
            10. Order Time
            11. Commission
            12. Broker Execution Commission
            13. Broker Clearing Commission
            14. Third-Party Execution Commission
            15. Thirs-Party Clearing Commission
            16. Other Commissions
            17. Proceeds
            18. Net Cash
            19. Trade ID
            20. Order ID
        3. Scroll to the bottom of the dialog and select Save
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
- Convert the Order Time to include semi-colons between yyyy;MM;dd;hh;mm;ss
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

# MetaTrader 5 (MT 5)
Please use the standalone MT5 windows application and follow the steps below. 

1. In the MetaTrader Terminal window, select the History tab.
2. Right-click on any order in the account history, and select the time period you want to export.
3. Right-click on any order in the account history, and select Report.
4. Save the report as an "Open XML (MS Office Excel 2007)" file to your desktop (or anywhere else - just remember where you put it).
<div style="text-align: center;"><img style="margin-right:30px" src="https://f003.backblazeb2.com/file/7ak-public/tradenote/MT51.png" width="200">

# HeldenTrader Pro
1. In the upper section of the application select the "Account" button
2. In the dropdown menu select "Reports" and a new window "Reports" will appear
3. Select in the "Report type" dropdown menu - "Trades report"
4. Select the timeframe you want to export in the "From" - "To" dropdown menu. One export file can contain one or more trading days/weeks.
5. Select "Export to CSV"
<div style="text-align: center;"><img style="margin-right:30px" src="https://f003.backblazeb2.com/file/7ak-public/tradenote/HeldenTrader1.png" width="200">
<img src="https://f003.backblazeb2.com/file/7ak-public/tradenote/HeldenTrader2.png" width="200"></div>
