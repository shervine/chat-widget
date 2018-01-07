#!/bin/bash

if [ "$1" == "" ]
then
    echo "Usage: run-app.sh <postgres-password>."
    exit 1
fi

export POSTGRESQL_URL="postgres://chat:$1@usdb.cf7c4gbt7lvh.us-west-2.rds.amazonaws.com/usnetwork";
echo 'Using connection string  ';
set | grep POSTGRESQL_URL;

export CHANNEL="usnetwork"
export MONGO_URL="nope"

#generate a random number version for cache busting
echo "document.cbv='$RANDOM';" > ./client/lib/version.js 

bower install
npm install

cd "$(dirname $0)"
meteor
