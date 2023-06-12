FROM node:alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install && npm install typescript -g

USER node

COPY --chown=node:node . .

RUN tsc

EXPOSE 4443

CMD [ "node", "dist/app.js" ]