#!/bin/sh -e

export APP_DIR="/vagrant"
export SCRIPTS_DIR="/vagrant/provision"
export INSTALL_DIR="/home/vagrant/.install"

# Update package list and upgrade all packages
export DEBIAN_FRONTEND=noninteractive
echo "\n\nUPDATE & UPGRADE =========================="
apt-get update > /dev/null
apt-get -y upgrade > /dev/null


chmod +x $SCRIPTS_DIR/*.sh
mkdir $INSTALL_DIR
chown vagrant.vagrant $INSTALL_DIR

echo "\n\nMISC ======================================"
$SCRIPTS_DIR/misc.sh

echo "\n\nPOSTGRESQL ================================"
$SCRIPTS_DIR/postgresql.sh

echo "\n\nNGINX ====================================="
$SCRIPTS_DIR/nginx.sh

echo "\n\nAPP DB ===================================="
$SCRIPTS_DIR/appdb.sh

echo "\n\nPOSTGREST ================================="
$SCRIPTS_DIR/postgrest.sh

echo "\n\nNODE ====================================="
$SCRIPTS_DIR/node.sh
