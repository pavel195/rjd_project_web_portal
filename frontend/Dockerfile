FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build
RUN ls -la /app/build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Создаем пустой файл для проверки
RUN touch /usr/share/nginx/html/test.txt
RUN ls -la /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 