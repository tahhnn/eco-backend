FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

# Không copy toàn bộ source vì sẽ mount volume bên ngoài

EXPOSE 8080

CMD ["npm", "run", "start:dev"]
