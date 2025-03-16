'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Создаем ENUM типы
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_role" AS ENUM ('worker', 'storekeeper');
      CREATE TYPE "enum_tools_status" AS ENUM ('active', 'maintenance', 'retired');
      CREATE TYPE "enum_requests_status" AS ENUM ('pending', 'approved', 'rejected', 'completed', 'returning');
      CREATE TYPE "enum_notifications_type" AS ENUM (
        'request_created',
        'request_approved',
        'request_rejected',
        'tool_due_soon',
        'tool_overdue',
        'tool_returned',
        'tool_return_requested',
        'tool_return_initiated'
      );
    `);

    // Создаем таблицу Users
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fullName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      role: {
        type: "enum_users_role",
        defaultValue: 'worker'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Индекс для оптимизации поиска пользователей
    await queryInterface.addIndex('Users', ['username']);
    await queryInterface.addIndex('Users', ['role', 'isActive']);

    // Создаем таблицу Categories
    await queryInterface.createTable('Categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT
      },
      icon: {
        type: Sequelize.STRING(50),
        defaultValue: 'build'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Индекс для поиска по имени категории
    await queryInterface.addIndex('Categories', ['name']);

    // Создаем таблицу Tools
    await queryInterface.createTable('Tools', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      imageUrl: {
        type: Sequelize.STRING,
        defaultValue: '/images/default-tool.png'
      },
      totalQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      availableQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      status: {
        type: "enum_tools_status",
        defaultValue: 'active'
      },
      lastMaintenance: {
        type: Sequelize.DATE
      },
      location: {
        type: Sequelize.STRING(100)
      },
      categoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Проверка для количества инструментов
    await queryInterface.sequelize.query(`
      ALTER TABLE "Tools" 
      ADD CONSTRAINT "check_available_quantity" 
      CHECK ("availableQuantity" <= "totalQuantity");
    `);

    // Индексы для оптимизации поиска инструментов
    await queryInterface.addIndex('Tools', ['name']);
    await queryInterface.addIndex('Tools', ['status']);
    await queryInterface.addIndex('Tools', ['categoryId']);

    // Создаем таблицу Requests
    await queryInterface.createTable('Requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      toolId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tools',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      status: {
        type: "enum_requests_status",
        defaultValue: 'pending'
      },
      requestDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      approvalDate: {
        type: Sequelize.DATE
      },
      returnDate: {
        type: Sequelize.DATE
      },
      expectedReturnDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Индексы для оптимизации поиска заявок
    await queryInterface.addIndex('Requests', ['userId']);
    await queryInterface.addIndex('Requests', ['toolId']);
    await queryInterface.addIndex('Requests', ['status']);
    await queryInterface.addIndex('Requests', ['requestDate']);

    // Создаем таблицу Notifications
    await queryInterface.createTable('Notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true, // null для уведомлений всех кладовщиков
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      requestId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Requests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: "enum_notifications_type",
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Индексы для оптимизации поиска уведомлений
    await queryInterface.addIndex('Notifications', ['userId']);
    await queryInterface.addIndex('Notifications', ['requestId']);
    await queryInterface.addIndex('Notifications', ['type']);
    await queryInterface.addIndex('Notifications', ['isRead']);

    // Добавляем базовые категории
    await queryInterface.bulkInsert('Categories', [
      {
        name: 'Ручной инструмент',
        description: 'Инструменты для ручной работы',
        icon: 'handyman',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Измерительный инструмент',
        description: 'Инструменты для измерений и контроля',
        icon: 'straighten',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Инструмент для обработки металла',
        description: 'Инструменты для работы с металлом',
        icon: 'construction',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем таблицы в правильном порядке
    await queryInterface.dropTable('Notifications');
    await queryInterface.dropTable('Requests');
    await queryInterface.dropTable('Tools');
    await queryInterface.dropTable('Categories');
    await queryInterface.dropTable('Users');

    // Удаляем ENUM типы
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_notifications_type";
      DROP TYPE IF EXISTS "enum_requests_status";
      DROP TYPE IF EXISTS "enum_tools_status";
      DROP TYPE IF EXISTS "enum_users_role";
    `);
  }
};
