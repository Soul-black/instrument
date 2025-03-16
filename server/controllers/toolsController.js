const { Tool, Category, User } = require('../models');
const { Op } = require('sequelize');

exports.getAllTools = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      categoryId = null,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

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
    
    if (categoryId && categoryId !== 'all' && categoryId !== 'null' && categoryId !== 'undefined') {
      where.categoryId = parseInt(categoryId, 10);
      console.log('Filtering by categoryId:', where.categoryId);
    }

    console.log('Final where clause:', where);

    const { count, rows: tools } = await Tool.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon']
        }
      ]
    });

    const response = {
      tools,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / parseInt(limit, 10)),
        currentPage: parseInt(page, 10)
      }
    };

    console.log('Sending response with', tools.length, 'tools');
    res.json(response);
  } catch (error) {
    console.error('Error getting tools:', error);
    res.status(500).json({ message: 'Ошибка при получении списка инструментов' });
  }
}; 