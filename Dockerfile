FROM node:22.1.0
 

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app/


RUN npm run build

CMD ["node", "build/index.js"]