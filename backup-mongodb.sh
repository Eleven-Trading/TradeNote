#!/bin/bash

# Variables
DATABASE_USER="$1"
DATABASE_PASSWORD="$2"
MONGO_HOST="$3"
MONGO_PORT="$4"
MONGO_DATABASE="$5"
S3_BUCKET_NAME="$6"
S3_BUCKET_PATH="$7"
MONGO_DATABASE_NAME="$8"
MONGODUMP_PATH="/usr/bin/mongodump"
TIMESTAMP=`date +%F_%H%M`

# Force file syncronization and lock writes
echo -e "\n 1- LOCKING DATABASE"
mongosh --authenticationDatabase admin -u $DATABASE_USER -p $DATABASE_PASSWORD --eval "printjson(db.fsyncLock())" 
 
# Create backup
echo -e "\n 2- CREATING BACKUP..."
$MONGODUMP_PATH -h $MONGO_HOST:$MONGO_PORT -d $MONGO_DATABASE --authenticationDatabase admin -u $DATABASE_USER -p $DATABASE_PASSWORD
 
# mv dump to current folder (tmp) and add timestamp to backup
echo -e "\n 3- MOVING BACKUP TO CURRENT FOLDER"
mv dump $TIMESTAMP-$MONGO_DATABASE_NAME
tar cf $TIMESTAMP-$MONGO_DATABASE_NAME.tar $TIMESTAMP-$MONGO_DATABASE_NAME

# Upload to S3
echo -e "\n 4- UPLOADING TO S3"
s3cmd -c /root/.s3cfg put $TIMESTAMP-$MONGO_DATABASE_NAME.tar s3://$S3_BUCKET_NAME/$S3_BUCKET_PATH/$TIMESTAMP/$TIMESTAMP-$MONGO_DATABASE_NAME.tar

# Remove dumps and dump tars in current folder
echo -e "\n 5- REMOVING BACKUP FROM CURRENT FOLDER"
rm -r $TIMESTAMP-$MONGO_DATABASE_NAME $TIMESTAMP-$MONGO_DATABASE_NAME.tar

# Unlock databases writes
echo -e "\n 6- UNLOCKING DATABASE"
mongosh --authenticationDatabase admin -u $DATABASE_USER -p $DATABASE_PASSWORD --eval "printjson(db.fsyncUnlock())"

echo -e "\n DONE"
