FROM node:16-alpine as build
COPY . /ui
WORKDIR /ui
RUN npm install react-scripts
RUN npm run-script build

FROM nginx:stable-alpine
COPY --from=build /ui/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
