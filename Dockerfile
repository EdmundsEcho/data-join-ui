# Two staged build of the React app
# hosted on nginx

################################################################################
# 1️⃣  react-build environment
################################################################################
FROM node:18.10-alpine3.15 as react-build

# 🔖 Copy build configuration files
#    use .dockerignore to limit activity
COPY . /frontend
WORKDIR /frontend

# 🔖 .dockerignore hides .env
# create the build artifact for production
ENV NODE_ENV=production
ENV REACT_APP_ENV=production
ENV PORT=3007

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
