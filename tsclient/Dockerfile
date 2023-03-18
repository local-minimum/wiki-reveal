FROM node:16-alpine as build
COPY package* /ui/
COPY .eslintrc.json /ui/
COPY tsconfig.json /ui/
WORKDIR /ui
RUN npm install react-scripts --force
COPY . /ui
WORKDIR /ui
RUN npm run-script build

FROM nginx:stable-alpine
COPY --from=build /ui/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
