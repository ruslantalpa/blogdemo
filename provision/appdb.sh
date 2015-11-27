#!/bin/sh -e
cd $SCRIPTS_DIR
sudo -H -u postgres bash -c 'psql -f ./appdb.sql'

cd $INSTALL_DIR
bower install
cd -
