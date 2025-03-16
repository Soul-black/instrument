const { Category, Tool } = require('../models');

const categoryController = {
  // Получить все категории
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.findAll({
        include: [{
          model: Tool,
          as: 'tools',
          attributes: ['id']
        }]
      });

      // Добавляем количество инструментов в каждой категории
      const categoriesWithCount = categories.map(category => ({
        ...category.toJSON(),
        toolsCount: category.tools.length
      }));

      res.json(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Ошибка при получении категорий' });
    }
  },

  // Получить категорию по ID
  getCategoryById: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id, {
        include: [{
          model: Tool,
          as: 'tools'
        }]
      });

      if (!category) {
        return res.status(404).json({ message: 'Категория не найдена' });
      }

      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ message: 'Ошибка при получении категории' });
    }
  },

  // Создать новую категорию
  createCategory: async (req, res) => {
    try {
      const { name, description, icon } = req.body;

      const category = await Category.create({
        name,
        description,
        icon
      });

      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Категория с таким названием уже существует' });
      }
      res.status(500).json({ message: 'Ошибка при создании категории' });
    }
  },

  // Обновить категорию
  updateCategory: async (req, res) => {
    try {
      const { name, description, icon } = req.body;
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({ message: 'Категория не найдена' });
      }

      await category.update({
        name,
        description,
        icon
      });

      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Категория с таким названием уже существует' });
      }
      res.status(500).json({ message: 'Ошибка при обновлении категории' });
    }
  },

  // Удалить категорию
  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id, {
        include: [{
          model: Tool,
          as: 'tools'
        }]
      });

      if (!category) {
        return res.status(404).json({ message: 'Категория не найдена' });
      }

      // Проверяем, есть ли инструменты в категории
      if (category.tools && category.tools.length > 0) {
        return res.status(400).json({ 
          message: 'Невозможно удалить категорию, так как в ней есть инструменты',
          tools: category.tools.map(tool => ({
            id: tool.id,
            name: tool.name
          }))
        });
      }

      await category.destroy();
      res.status(200).json({ message: 'Категория успешно удалена' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Ошибка при удалении категории' });
    }
  }
};

module.exports = categoryController; 