# Two staged build of the React app
# hosted on nginx

################################################################################
# 1️⃣  react-build environment
################################################################################
FROM node:18.10-alpine3.15 as react-build

# 🔖 Copy build configuration files
#    use .dockerignore to limit activity
COPY package.json /frontend/package.json
COPY yarn.lock /frontend/yarn.lock
COPY public /frontend/public
COPY nginx.conf /frontend/nginx.conf
COPY src /frontend/src

# << here >>
COPY .env-kube /frontend/.env
WORKDIR /frontend

# create the build artifact for docker-compose
ENV NODE_ENV=production
# << docker-compose url >>
ENV REACT_APP_ENV=production
ENV PORT=3007

RUN yarn
RUN yarn build

################################################################################
# 2️⃣  production environment
################################################################################
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html
COPY --from=react-build /frontend/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=react-build /frontend/nginx.conf /etc/nginx/conf.d

ENTRYPOINT ["nginx", "-g", "daemon off;"]
