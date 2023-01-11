FROM node:19-alpine3.15

WORKDIR /BaseExpressServer

COPY package*.json ./
COPY ./ .
RUN npm install
EXPOSE 3000
CMD [ "node", "server.mjs" ]
