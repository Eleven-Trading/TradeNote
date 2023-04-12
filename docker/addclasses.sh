#!/usr/bin/env bash

PARSEHOST=parse-server

curl -X POST \
  -H "X-Parse-Application-Id: $PARSE_APP_ID" \
  -H "X-Parse-Master-Key: $PARSE_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "cashJournal",
      "fields": {}
    }' \
  http://$PARSEHOST:1337/parse/schemas/cashJournal

curl -X POST \
  -H "X-Parse-Application-Id: $PARSE_APP_ID" \
  -H "X-Parse-Master-Key: $PARSE_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "journals",
      "fields": {}
    }' \
  http://$PARSEHOST:1337/parse/schemas/journals

curl -X POST \
  -H "X-Parse-Application-Id: $PARSE_APP_ID" \
  -H "X-Parse-Master-Key: $PARSE_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "dailyInfos",
      "fields": {}
    }' \
  http://$PARSEHOST:1337/parse/schemas/dailyInfos

curl -X POST \
  -H "X-Parse-Application-Id: $PARSE_APP_ID" \
  -H "X-Parse-Master-Key: $PARSE_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "playbooks",
      "fields": {}
    }' \
  http://$PARSEHOST:1337/parse/schemas/playbooks

curl -X POST \
  -H "X-Parse-Application-Id: $PARSE_APP_ID" \
  -H "X-Parse-Master-Key: $PARSE_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "setupsEntries",
      "fields": {}
    }' \
  http://$PARSEHOST:1337/parse/schemas/setupsEntries

curl -X POST \
  -H "X-Parse-Application-Id: $PARSE_APP_ID" \
  -H "X-Parse-Master-Key: $PARSE_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "trades",
      "fields": {
        "user": {"type": "Pointer",  "targetClass":"_User"},
        "date": {"type": "Date"},
        "dateUnix": {"type": "Number"},
        "executions": {"type": "Array"},
        "trades": {"type": "Array"},
        "blotter": {"type": "Object"},
        "pAndL": {"type": "Object"}
      }
    }' \
  http://$PARSEHOST:1337/parse/schemas/trades


curl -X PUT \
  -H "X-Parse-Application-Id: $PARSE_APP_ID" \
  -H "X-Parse-Master-Key: $PARSE_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "_User",
      "fields": {
        "avatar": {"type": "File"},
        "accounts": {"type": "Array", "defaultValue": [{"value": "XY000001","label": "Live Account"},{"value": "XY000002","label": "Demo Account"}]}
      }
    }' \
  http://$PARSEHOST:1337/parse/schemas/_User


curl -X POST \
  -H "X-Parse-Application-Id: $PARSE_APP_ID" \
  -H "X-Parse-Master-Key: $PARSE_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "patterns",
      "fields": {
        "user": {"type": "Pointer", "targetClass":"_User"},
        "name": {"type": "String"},
        "type": {"type": "String"},
        "side": {"type": "String"},
        "note": {"type": "String"},
        "order": {"type": "Number"}
      }
    }' \
  http://$PARSEHOST:1337/parse/schemas/patterns


  curl -X POST \
  -H "X-Parse-Application-Id: $PARSE_APP_ID" \
  -H "X-Parse-Master-Key: $PARSE_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "mistakes",
      "fields": {
        "user": {"type": "Pointer", "targetClass":"_User"},
        "name": {"type": "String"},
        "description": {"type": "String"},
        "order": {"type": "Number"}
      }
    }' \
  http://$PARSEHOST:1337/parse/schemas/mistakes


  curl -X POST \
  -H "X-Parse-Application-Id: $PARSE_APP_ID" \
  -H "X-Parse-Master-Key: $PARSE_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "patternsMistakes",
      "fields": {
        "user": {"type": "Pointer", "targetClass":"_User"},
        "pattern": {"type": "Pointer", "targetClass":"patterns"},
        "mistake": {"type": "Pointer", "targetClass":"mistakes"},
        "note": {"type": "String"},
        "dateUnixDay": {"type": "Number"},
        "tradeId": {"type": "String"}
      }
    }' \
  http://$PARSEHOST:1337/parse/schemas/patternsMistakes