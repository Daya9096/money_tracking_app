const { Sequelize, DataTypes } = require('sequelize');

// Use environment variables for DB credentials (Docker Compose compatible)
const sequelize = new Sequelize(
  process.env.DB_NAME || 'money_track_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Daya@9096',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

const Income = sequelize.define('Income', {
  source: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  user: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW }
});

const Expense = sequelize.define('Expense', {
  source: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  user: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW }
});

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
});

module.exports = { sequelize, Income, Expense, User };