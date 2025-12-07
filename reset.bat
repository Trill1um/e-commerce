@echo off
SET USER=root
SET PASS=rootpassword
SET DB=mern_db
SET CONTAINER=mysql_dev

echo Stopping containers...
docker-compose down

echo Removing MySQL volume...
docker volume rm e-commerce_mysql_data

echo Starting containers...
docker-compose up -d

echo Database reset complete!