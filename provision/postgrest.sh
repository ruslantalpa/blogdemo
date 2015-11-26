#!/bin/sh -e

POSTGREST_VERSION="0.3.0.0"

cd $INSTALL_DIR
git clone https://github.com/begriffs/postgrest.git
cd postgrest

#install postgrest from source
#$SCRIPTS_DIR/stack.sh
#sudo stack install --install-ghc --local-bin-path /usr/local/bin

#install from release
wget --quiet https://github.com/begriffs/postgrest/releases/download/v${POSTGREST_VERSION}/postgrest-${POSTGREST_VERSION}-ubuntu.tar.xz
tar --xz -xvf postgrest-${POSTGREST_VERSION}-ubuntu.tar.xz
mv postgrest /usr/local/bin/postgrest

#set it up as a service
sudo cp $INSTALL_DIR/postgrest/debian/postgrest-wrapper /usr/local/bin
sudo cp $INSTALL_DIR/postgrest/debian/postgrest.init.d /etc/init.d/postgrest
#sudo cp $SCRIPTS_DIR/postgrest.default /etc/default/postgrest
sudo ln -s $SCRIPTS_DIR/postgrest.default /etc/default/postgrest
sudo chmod +x /etc/init.d/postgrest
sudo update-rc.d postgrest defaults
sudo useradd -M postgrest --shell /bin/false
sudo usermod -L postgrest
sudo mkdir /var/log/postgrest
sudo chown postgrest.postgrest /var/log/postgrest

sudo service postgrest start

