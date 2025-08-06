FROM node:22.15-slim AS build
WORKDIR /app
COPY package*.json /app/
RUN npm ci --only=production --omit=dev && \
   rm -f .npmrc

FROM node:22.15-slim AS runner
RUN usermod -aG dialout node && \
    apt-get -y update && \ 
    apt-get install -y --no-install-recommends udev && \
    apt-get clean
USER node
WORKDIR /app
COPY --chown=node:node --from=build /app/node_modules /app/node_modules
COPY --chown=node:node . /app

ENTRYPOINT ["node", "src/index.js", "serial"]