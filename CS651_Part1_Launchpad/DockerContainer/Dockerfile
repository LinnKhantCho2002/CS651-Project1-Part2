# RoomWise on Docker — Apache serves the compiled dist/ site.
#
# Build (run from CS651_Part1_Launchpad/ on the EC2 instance):
#   sudo docker build -f DockerContainer/Dockerfile -t roomwise .
#
# Run (host port 3001 -> container port 80):
#   sudo docker run -d -p 3001:80 --name roomwise roomwise
#
# Site is then live at http://<ec2-public-ip>:3001
FROM httpd:2.4
COPY ./dist/ /usr/local/apache2/htdocs/
EXPOSE 80
