FROM ubuntu:latest 

# Update the package list
RUN apt-get update

# Install nginx
RUN apt-get install -y nginx 

# Copy the built React app to the nginx web root
COPY dist /var/www/html/

# Configure nginx
RUN echo '\
# server block
server { \n\  
    listen 80 default_server; \n\
    listen [::]:80 default_server; \n\
    root /var/www/html; \n\
    index index.html; \n\
    server_name _; \n\
    location / { \n\
        try_files $uri $uri/ /index.html; \n\
    } \n\
}' > /etc/nginx/sites-available/default

# Expose port 80 to the outside world
EXPOSE 3001

# Start nginx and keep the container running
CMD service nginx start && tail -F /var/log/nginx/error.log