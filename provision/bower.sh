#!/bin/sh -e
curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm install -g bower

cd $APP_DIR
bower --allow-root install

