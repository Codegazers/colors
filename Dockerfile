FROM node:alpine
ENV APPDIR /APP
WORKDIR ${APPDIR}
COPY app.js app.js
COPY index.html index.html
COPY package.json package.json
RUN npm install
CMD ["node","app.js","3000"]
EXPOSE 3000