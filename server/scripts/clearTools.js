const sequelize = require('../config/database');
require('dotenv').config();

const clearTools = async () => {
  try {
    await sequelize.authenticate();
    console.log('Подключение к базе данных установлено');

    // Используем TRUNCATE CASCADE для очистки всех связанных таблиц
    await sequelize.query('TRUNCATE TABLE "Tools", "Requests", "Notifications" CASCADE;');
    console.log('Все таблицы очищены');

    process.exit(0);
  } catch (error) {
    console.error('Ошибка при очистке таблиц:', error);
    process.exit(1);
  }
};

clearTools(); 