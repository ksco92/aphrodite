#!/bin/bash

sudo yum update -y
sudo yum install haproxy -y
sudo sh -c 'cat > /etc/haproxy/haproxy.cfg << EOL
global
        log /dev/log    local0
        log /dev/log    local1 notice
        chroot /var/lib/haproxy
        maxconn 4000
        user haproxy
        group haproxy
        daemon

stats socket /var/lib/haproxy/stats mode 777

listen postgres
bind 0.0.0.0:<actual_postgres_port>
    timeout connect 96h
    timeout client 96h
    timeout server 96h
    mode tcp
    server singlePostgres <actual_postgres_endpoint>:<actual_postgres_port>

EOL'

sudo service haproxy restart
sudo systemctl start haproxy
