FROM node:18-bullseye-slim as node
RUN npm uninstall --global yarn && \
    corepack disable && \
    corepack enable yarn && \
    corepack prepare yarn@${YARN_VERSION} --activate
COPY --chown=node:node . /app
USER node
WORKDIR /app
ENV YARN_VERSION=1.22.19
RUN yarn install --ignore-scripts && \
    yarn build && \
    yarn install --production --ignore-scripts && \
    yarn cache clean

FROM ubuntu:jammy as base

ENV TINI_VERSION 0.19.0-1
# ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /usr/bin/tini
# RUN chmod +x /usr/bin/tini
RUN apt-get update && \
    apt-get -qq install -y --no-install-recommends \
    tini=${TINI_VERSION} && \
    rm -rf /var/lib/apt/lists/*
EXPOSE 3000

COPY --from=node /usr/local/include/ /usr/local/include/
COPY --from=node /usr/local/lib/ /usr/local/lib/
COPY --from=node /usr/local/bin/ /usr/local/bin/

RUN groupadd --gid 1000 node && \
    useradd --uid 1000 --gid node --shell /bin/bash --create-home node

RUN mkdir -p /app && \
    chown -R node:node /app

COPY --from=node --chown=node:node /app/package.json /app/
COPY --from=node --chown=node:node /app/.next/ /app/.next/
COPY --from=node --chown=node:node /app/node_modules/ /app/node_modules/
COPY --from=node --chown=node:node /app/public/ /app/public/

USER node
WORKDIR /app

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "run", "start"]
