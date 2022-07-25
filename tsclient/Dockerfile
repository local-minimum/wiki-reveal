FROM node:16-alpine as build
COPY . /ui
WORKDIR /ui
RUN npm run-script build

FROM nginx:stable-alpine
COPY --from=build /ui/build /user/shar/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "deamon off;"]
