docker start mysql_dev
docker exec -it mysql_dev mysql -u mern_user -pmern_password mern_db
@REM docker exec -it mysql_dev mysql -u root -prootpassword mern_db