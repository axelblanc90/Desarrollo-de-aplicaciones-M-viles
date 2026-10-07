FROM node:20-slim

# Install real snmpd, snmp tools and openssh-server for full Linux lab compatibility
RUN apt-get update && apt-get install -y --no-install-recommends \
    snmp \
    snmpd \
    snmp-mibs-downloader \
    openssh-server \
    curl \
    iproute2 \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Configure default mock snmpd
RUN echo "rocommunity public default" > /etc/snmp/snmpd.conf \
    && echo "syslocation Laboratorio Telecomunicaciones FCyT" >> /etc/snmp/snmpd.conf \
    && echo "syscontact admin@redes-campus.edu.ar" >> /etc/snmp/snmpd.conf

# Setup SSH test user
RUN useradd -rm -d /home/admin -s /bin/bash -g root -G sudo -u 1000 admin \
    && echo 'admin:cisco123' | chpasswd \
    && mkdir -p /var/run/sshd

COPY package*.json ./
RUN npm install --production

COPY server.js ./

EXPOSE 3001/tcp
EXPOSE 161/udp
EXPOSE 22/tcp

CMD service ssh start && service snmpd start && node server.js
