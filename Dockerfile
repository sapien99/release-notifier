FROM node:alpine AS builder
RUN apk add --update nodejs nodejs-npm
WORKDIR /opt/app
COPY package*.json package-lock*.json ./
RUN npm install --production
COPY index.js ./
COPY lib ./lib
EXPOSE 8080
USER node
CMD [ "npm", "run", "start" ]

