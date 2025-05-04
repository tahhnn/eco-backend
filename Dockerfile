# 👉 Base image là Node 18
FROM node:22

# 👉 Tạo thư mục app
WORKDIR /app

# 👉 Copy package files trước để cache install nếu source chưa đổi
COPY package*.json ./

# 👉 Cài dependencies (không chạy script nếu có postinstall)
RUN npm install

# 👉 Copy toàn bộ source vào container
COPY . .

# 👉 Build ứng dụng NestJS (nếu dùng TypeScript)
RUN npm run build

# 👉 Bật port (nếu app chạy ở 8080)
EXPOSE 8080

# 👉 Command chạy app đã build
CMD ["npm", "run", "start:prod"]

