#!/bin/sh -e
curl -sL https://deb.nodesource.com/setup_0.12 | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g webpack webpack-dev-server rimraf

cd $FRONTED_DIR
npm install
npm run build
