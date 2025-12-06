import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'mern_db',        // ← Same as MYSQL_DATABASE
  'mern_user',      // ← Same as MYSQL_USER
  'mern_password',  // ← Same as MYSQL_PASSWORD
  {
    host: 'localhost',  // Docker exposes it on localhost
    port: 3306,         // Default MySQL port
    dialect: 'mysql'
  }
);

export default sequelize;