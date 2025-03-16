require('dotenv').config();
const { User } = require('../models');
const sequelize = require('../config/database');

const createStorekeeper = async () => {
  try {
    await sequelize.authenticate();
    console.log('Подключение к базе данных установлено');

    const storekeeper = await User.create({
      username: 'storekeeper',
      password: 'storekeeper12345',
      fullName: 'Главный Кладовщик',
      role: 'storekeeper',
      isActive: true,
    });

    console.log('Кладовщик успешно создан:', {
      id: storekeeper.id,
      username: storekeeper.username,
      role: storekeeper.role,
      fullName: storekeeper.fullName,
    });

    process.exit(0);
  } catch (error) {
    console.error('Ошибка при создании кладовщика:', error);
    process.exit(1);
  }
};

createStorekeeper();
