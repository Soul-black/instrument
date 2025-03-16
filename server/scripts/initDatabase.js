const { Sequelize } = require('sequelize');
const config = require('../config/config');
const { Client } = require('pg');

const createDatabase = async () => {
  const { database, username, password, host } = config.development;
  
  // Подключаемся к postgres для создания базы данных
  const client = new Client({
    user: username,
    password: password,
    host: host,
    database: 'postgres', // Подключаемся к дефолтной базе postgres
    port: 5432,
  });

  try {
    await client.connect();
    
    // Проверяем существует ли база данных
    const checkDb = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${database}'`
    );

    if (checkDb.rows.length === 0) {
      // База не существует, создаем её
      await client.query(`CREATE DATABASE ${database}`);
      console.log(`База данных ${database} успешно создана`);
    } else {
      console.log(`База данных ${database} уже существует`);
    }
  } catch (error) {
    console.error('Ошибка при создании базы данных:', error);
    throw error;
  } finally {
    await client.end();
  }
};

const dropTables = async () => {
  try {
    const sequelize = new Sequelize(config.development);
    await sequelize.authenticate();
    await sequelize.drop();
    console.log('Все таблицы удалены');
    await sequelize.close();
  } catch (error) {
    console.error('Ошибка при удалении таблиц:', error);
    throw error;
  }
};

const initDatabase = async () => {
  try {
    // Сначала создаем базу данных если её нет
    await createDatabase();
    
    // Затем удаляем все таблицы
    await dropTables();
    
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    process.exit(1);
  }
};

initDatabase(); 