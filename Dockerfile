FROM node:alpine
#RUN apk --update --update --no-progress --no-cache  add nodejs
ENV APPDIR /APP
ENV COLOR=WHITE

WORKDIR ${APPDIR}

COPY app.js app.js
COPY index.html index.html
COPY package.json package.json
RUN npm install
CMD ["node","app.js","3000"]
EXPOSE 3000

