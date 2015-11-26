#!/bin/sh -e

wget -q -O- http://nginx.org/keys/nginx_signing.key | sudo apt-key add -
echo 'deb http://nginx.org/packages/ubuntu/ trusty nginx'|sudo tee /etc/apt/sources.list.d/nginx.list
echo 'deb-src http://nginx.org/packages/ubuntu/ trusty nginx'|sudo tee /etc/apt/sources.list.d/nginxsrc.list
sudo apt-get update > /dev/null && sudo apt-get install -y nginx

sudo rm -f /etc/nginx/conf.d/default.conf
sudo ln -s $SCRIPTS_DIR/nginx.server.conf /etc/nginx/conf.d/default.conf
sudo service nginx restart