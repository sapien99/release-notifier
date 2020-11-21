FROM stereum/beacon-base:3.12 as base
# Optional Configuration Parameter
ARG SERVICE_USER
ARG SERVICE_HOME
# Default Settings
ENV SERVICE_USER ${SERVICE_USER:-app}
ENV SERVICE_HOME ${SERVICE_HOME:-/opt/${SERVICE_USER}}

FROM base as builder
RUN apk add --update nodejs nodejs-npm
WORKDIR ${SERVICE_HOME}
COPY package*.json package-lock*.json ./
RUN npm install --production
COPY index.js ./
COPY lib ./lib
EXPOSE 8080
CMD [ "npm", "run", "start" ]

FROM builder as dist
RUN \
  mkdir -p ${SERVICE_HOME} && \
  adduser -h ${SERVICE_HOME} -s /sbin/nologin -u 2000 -D ${SERVICE_USER} && \
  chown -R ${SERVICE_USER}:${SERVICE_USER} ${SERVICE_HOME}

FROM dist as hardened
USER root
RUN rm -f /sbin/apk && rm -rf /etc/apk && rm -rf /lib/apk && rm -rf /usr/share/apk && rm -rf /var/lib/apk
USER ${SERVICE_USER}
WORKDIR ${SERVICE_HOME}
