const { Tool, Category } = require('../models');
const sequelize = require('../config/database');

// const demoTools = {
//   'Ручной инструмент': [
//     {
//       name: 'Набор отверток',
//       description: 'Профессиональный набор отверток различных размеров и типов',
//       imageUrl: '/images/tools/screwdriver-set.jpg',
//       totalQuantity: 10,
//       availableQuantity: 8,
//       status: 'active',
//       lastMaintenance: new Date('2024-02-15')
//     },
//     {
//       name: 'Молоток слесарный',
//       description: 'Молоток с фиберглассовой ручкой, вес головки 500г',
//       imageUrl: '/images/tools/hammer.jpg',
//       totalQuantity: 15,
//       availableQuantity: 12,
//       status: 'active',
//       lastMaintenance: new Date('2024-02-20')
//     },
//     {
//       name: 'Плоскогубцы комбинированные',
//       description: 'Многофункциональные плоскогубцы с изолированными ручками',
//       imageUrl: '/images/tools/pliers.jpg',
//       totalQuantity: 20,
//       availableQuantity: 15,
//       status: 'active',
//       lastMaintenance: new Date('2024-02-18')
//     }
//   ],
//   'Измерительный инструмент': [
//     {
//       name: 'Штангенциркуль цифровой',
//       description: 'Цифровой штангенциркуль с точностью измерения 0.01мм',
//       imageUrl: '/images/tools/caliper.jpg',
//       totalQuantity: 8,
//       availableQuantity: 6,
//       status: 'active',
//       lastMaintenance: new Date('2024-02-25')
//     },
//     {
//       name: 'Микрометр',
//       description: 'Микрометр для точных измерений с диапазоном 0-25мм',
//       imageUrl: '/images/tools/micrometer.jpg',
//       totalQuantity: 5,
//       availableQuantity: 4,
//       status: 'active',
//       lastMaintenance: new Date('2024-02-22')
//     },
//     {
//       name: 'Угломер',
//       description: 'Универсальный угломер для измерения углов',
//       imageUrl: '/images/tools/protractor.jpg',
//       totalQuantity: 10,
//       availableQuantity: 8,
//       status: 'active',
//       lastMaintenance: new Date('2024-02-19')
//     }
//   ],
//   'Инструмент для обработки металла': [
//     {
//       name: 'Ножницы по металлу',
//       description: 'Ручные ножницы для резки листового металла толщиной до 1.2мм',
//       imageUrl: '/images/tools/metal-shears.jpg',
//       totalQuantity: 12,
//       availableQuantity: 10,
//       status: 'active',
//       lastMaintenance: new Date('2024-02-17')
//     },
//     {
//       name: 'Напильник набор',
//       description: 'Набор напильников различной формы для обработки металла',
//       imageUrl: '/images/tools/file-set.jpg',
//       totalQuantity: 15,
//       availableQuantity: 12,
//       status: 'active',
//       lastMaintenance: new Date('2024-02-21')
//     },
//     {
//       name: 'Зубило',
//       description: 'Слесарное зубило для рубки металла',
//       imageUrl: '/images/tools/chisel.jpg',
//       totalQuantity: 20,
//       availableQuantity: 18,
//       status: 'active',
//       lastMaintenance: new Date('2024-02-16')
//     }
//   ]
// };

const createDemoTools = async () => {
  try {
    await sequelize.authenticate();
    console.log('Подключение к базе данных установлено');
    console.log('Начинаем создание демо-инструментов...');

    // Получаем все категории
    // const categories = await Category.findAll();

    // for (const category of categories) {
    //   const toolsForCategory = demoTools[category.name];

    //   if (toolsForCategory) {
    //     console.log(`Создаем инструменты для категории "${category.name}"...`);

    //     for (const toolData of toolsForCategory) {
    //       await Tool.create({
    //         ...toolData,
    //         categoryId: category.id,
    //       });
    //       console.log(`✓ Создан инструмент: ${toolData.name}`);
    //     }
    //   }
    // }

    console.log('Демо-инструменты успешно созданы!');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при создании демо-инструментов:', error);
    process.exit(1);
  }
};

createDemoTools();
