FROM node:lts-alpine AS build

WORKDIR /app

COPY . .

RUN apk add bash \
    && npm install --legacy-peer-deps \
    && npm run build

CMD ["node", "./dist/main.js", "--name coinsender"]

# FROM node:lts-alpine AS image

# WORKDIR /app

# RUN apk add bash 

# COPY --from=0 /app/dist ./dist
# COPY --from=0 /app/node_modules ./node_modules

# CMD ["node", "./dist/main.js", "--name coinsender"]
