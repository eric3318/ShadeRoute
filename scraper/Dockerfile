FROM mcr.microsoft.com/playwright:v1.50.1-noble

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]


