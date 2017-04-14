FROM node:7.9.0
MAINTAINER Lucas Elisei <lucas.elisei@heig-vd.ch>

COPY src /opt/app/

WORKDIR /opt/app/
RUN npm install

ENTRYPOINT ["node", "/opt/app/app.js"]
