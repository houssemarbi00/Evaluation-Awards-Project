# Étape 1 : builder l’app React
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : servir avec Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copie optionnelle d’un fichier de conf Nginx
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
