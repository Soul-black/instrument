const { Tool } = require('../models');
const { Op } = require('sequelize');
const { Request } = require('../models');
const { User } = require('../models');
const { Category } = require('../models');
const fs = require('fs');
const path = require('path');

// Получение списка всех инструментов
const getAllTools = async (req, res) => {
  try {
    const { search, status, category } = req.query;

    // Формируем условия поиска
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const tools = await Tool.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json(tools);
  } catch (error) {
    console.error('Error getting tools:', error);
    res.status(500).json({ message: 'Ошибка при получении списка инструментов' });
  }
};

// Получение информации об одном инструменте
const getToolById = async (req, res) => {
  try {
    const { id } = req.params;
    const tool = await Tool.findByPk(id);

    if (!tool) {
      return res.status(404).json({ message: 'Инструмент не найден' });
    }

    res.json(tool);
  } catch (error) {
    console.error('Error getting tool:', error);
    res.status(500).json({ message: 'Ошибка при получении информации об инструменте' });
  }
};

// Создание нового инструмента (только для кладовщика)
const createTool = async (req, res) => {
  try {
    const {
      name,
      description,
      totalQuantity,
      availableQuantity,
      status,
      lastMaintenance,
      location,
      categoryId
    } = req.body;

    // Проверяем наличие загруженного файла
    const imageUrl = req.file 
      ? `/uploads/tools/${req.file.filename}`
      : '/images/default-tool.png';

    console.log('Creating tool with image:', imageUrl);
    console.log('Uploaded file:', req.file);

    const tool = await Tool.create({
      name,
      description,
      imageUrl,
      totalQuantity: parseInt(totalQuantity, 10),
      availableQuantity: parseInt(availableQuantity, 10),
      status,
      lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
      location,
      categoryId: parseInt(categoryId, 10)
    });

    // Получаем инструмент с данными о категории
    const toolWithCategory = await Tool.findByPk(tool.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'icon']
      }]
    });

    res.status(201).json(toolWithCategory);
  } catch (error) {
    console.error('Error creating tool:', error);
    res.status(500).json({ message: 'Ошибка при создании инструмента' });
  }
};

// Обновление информации об инструменте (только для кладовщика)
const updateTool = async (req, res) => {
  try {
    const tool = await Tool.findByPk(req.params.id);
    if (!tool) {
      return res.status(404).json({ message: 'Инструмент не найден' });
    }

    const {
      name,
      description,
      totalQuantity,
      availableQuantity,
      status,
      lastMaintenance,
      location,
      categoryId
    } = req.body;

    // Обновляем изображение только если загружен новый файл
    if (req.file) {
      tool.imageUrl = `/uploads/tools/${req.file.filename}`;
      console.log('Updating tool image to:', tool.imageUrl);
    }

    // Обновляем только переданные поля
    if (name) tool.name = name;
    if (description) tool.description = description;
    if (totalQuantity) tool.totalQuantity = parseInt(totalQuantity, 10);
    if (availableQuantity) tool.availableQuantity = parseInt(availableQuantity, 10);
    if (status) tool.status = status;
    if (lastMaintenance) tool.lastMaintenance = new Date(lastMaintenance);
    if (location) tool.location = location;
    if (categoryId) tool.categoryId = parseInt(categoryId, 10);

    await tool.save();

    // Получаем обновленный инструмент с данными о категории
    const updatedTool = await Tool.findByPk(tool.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'icon']
      }]
    });

    console.log('Updated tool:', updatedTool);
    res.json(updatedTool);
  } catch (error) {
    console.error('Error updating tool:', error);
    res.status(500).json({ message: 'Ошибка при обновлении инструмента' });
  }
};

// Удаление инструмента (только для кладовщика)
const deleteTool = async (req, res) => {
  try {
    const tool = await Tool.findByPk(req.params.id, {
      include: [{
        model: Request,
        as: 'requests',
        where: {
          status: {
            [Op.in]: ['approved', 'returning']
          }
        },
        required: false
      }]
    });

    if (!tool) {
      return res.status(404).json({ message: 'Инструмент не найден' });
    }

    // Проверяем, не выдан ли инструмент
    if (tool.requests && tool.requests.length > 0) {
      return res.status(400).json({ 
        message: 'Невозможно удалить инструмент, так как он сейчас выдан'
      });
    }

    // Удаляем файл изображения, если это не дефолтное изображение
    if (tool.imageUrl && !tool.imageUrl.includes('default-tool.png')) {
      const imagePath = path.join(__dirname, '..', tool.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await tool.destroy();
    res.status(200).json({ message: 'Инструмент успешно удален' });
  } catch (error) {
    console.error('Error deleting tool:', error);
    res.status(500).json({ message: 'Ошибка при удалении инструмента' });
  }
};

// Получение списка выданных инструментов
const getIssuedTools = async (req, res) => {
  try {
    const issuedTools = await Request.findAll({
      where: {
        status: {
          [Op.in]: ['approved', 'returning']
        }
      },
      include: [
        {
          model: Tool,
          as: 'tool',
          attributes: ['id', 'name', 'description', 'imageUrl'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName'],
        },
      ],
      order: [['approvalDate', 'DESC']],
      attributes: [
        'id',
        'status',
        'quantity',
        'requestDate',
        'approvalDate',
        'expectedReturnDate',
        'notes'
      ]
    });

    res.json(issuedTools);
  } catch (error) {
    console.error('Error getting issued tools:', error);
    res.status(500).json({ message: 'Ошибка при получении списка выданных инструментов' });
  }
};

module.exports = {
  getAllTools,
  getToolById,
  createTool,
  updateTool,
  deleteTool,
  getIssuedTools,
}; 