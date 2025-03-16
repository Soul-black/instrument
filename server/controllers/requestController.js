const { Request, Tool, User, Notification } = require('../models');
const sequelize = require('../config/database');

// Получение списка заявок (с фильтрацией по статусу)
const getRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }

    // Для работника показываем только его заявки
    if (req.user.role === 'worker') {
      where.userId = req.user.id;
    }

    const requests = await Request.findAll({
      where,
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
      order: [['requestDate', 'DESC']],
    });

    res.json(requests);
  } catch (error) {
    console.error('Error getting requests:', error);
    res.status(500).json({ message: 'Ошибка при получении списка заявок' });
  }
};

// Создание новой заявки (только для работников)
const createRequest = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { toolId, quantity, returnDate, notes } = req.body;

    // Проверяем наличие инструмента
    const tool = await Tool.findByPk(toolId, { transaction });
    if (!tool) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Инструмент не найден' });
    }

    // Проверяем доступность инструмента
    if (tool.status !== 'active') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Инструмент недоступен для выдачи' });
    }

    if (quantity > tool.availableQuantity) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Запрошенное количество превышает доступное' });
    }

    // Обрабатываем дату возврата, убирая время
    const expectedReturnDate = new Date(returnDate);
    expectedReturnDate.setHours(0, 0, 0, 0);

    // Создаем заявку
    const request = await Request.create({
      toolId,
      userId: req.user.id,
      quantity,
      status: 'pending',
      requestDate: new Date(),
      expectedReturnDate,
      notes,
    }, { transaction });

    // Создаем уведомление для кладовщиков
    await Notification.create({
      type: 'request_created',
      message: `Новая заявка на ${tool.name} от ${req.user.fullName}`,
      userId: null, // null означает, что уведомление для всех кладовщиков
      requestId: request.id,
    }, { transaction });

    await transaction.commit();

    // Получаем заявку с данными об инструменте и пользователе
    const fullRequest = await Request.findByPk(request.id, {
      include: [
        {
          model: Tool,
          as: 'tool',
          attributes: ['name', 'location'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['fullName'],
        },
      ],
    });

    res.status(201).json(fullRequest);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Ошибка при создании заявки' });
  }
};

// Обработка заявки (только для кладовщика)
const processRequest = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const request = await Request.findByPk(id, {
      include: [
        { model: Tool, as: 'tool' },
        { model: User, as: 'user' },
      ],
      transaction,
    });

    if (!request) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    if (request.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Заявка уже обработана' });
    }

    // Если заявка одобрена, проверяем доступность инструментов
    if (status === 'approved') {
      const tool = request.tool;
      if (request.quantity > tool.availableQuantity) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Недостаточно инструментов' });
      }

      // Уменьшаем количество доступных инструментов
      tool.availableQuantity -= request.quantity;
      await tool.save({ transaction });
    }

    // Обновляем статус заявки
    request.status = status;
    request.approvalDate = new Date();
    if (notes) request.notes = notes;
    await request.save({ transaction });

    // Создаем уведомление для работника
    await Notification.create({
      type: status === 'approved' ? 'request_approved' : 'request_rejected',
      message: `Ваша заявка на ${request.tool.name} была ${status === 'approved' ? 'одобрена' : 'отклонена'}${notes ? `: ${notes}` : ''}`,
      userId: request.userId,
      requestId: request.id,
    }, { transaction });

    // Создаем отдельное уведомление для кладовщиков
    await Notification.create({
      type: status === 'approved' ? 'request_approved' : 'request_rejected',
      message: `Заявка на ${request.tool.name} от ${request.user.fullName} была ${status === 'approved' ? 'одобрена' : 'отклонена'}${notes ? `: ${notes}` : ''}`,
      userId: null, // для кладовщиков
      requestId: request.id,
    }, { transaction });

    await transaction.commit();

    // Получаем обновленную заявку со всеми связями
    const updatedRequest = await Request.findByPk(request.id, {
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
    });

    res.json(updatedRequest);
  } catch (error) {
    await transaction.rollback();
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Ошибка при обработке заявки' });
  }
};

// Возврат инструмента (только для кладовщика)
const returnTool = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { notes } = req.body;

    const request = await Request.findByPk(id, {
      include: [
        { model: Tool, as: 'tool' },
        { model: User, as: 'user' },
      ],
      transaction,
    });

    if (!request) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    if (request.status !== 'returning') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Заявка не находится в статусе возврата' });
    }

    // Обновляем статус заявки
    request.status = 'completed';
    request.returnDate = new Date();
    if (notes) request.notes = notes;

    // Возвращаем инструменты в доступные
    const tool = request.tool;
    tool.availableQuantity += request.quantity;
    await tool.save({ transaction });

    await request.save({ transaction });

    // Создаем уведомление для работника
    await Notification.create({
      type: 'tool_returned',
      message: `Возврат инструмента ${request.tool.name} подтвержден`,
      userId: request.userId,
      requestId: request.id,
    }, { transaction });

    // Создаем отдельное уведомление для кладовщиков
    await Notification.create({
      type: 'tool_returned',
      message: `Инструмент ${request.tool.name} возвращен работником ${request.user.fullName}`,
      userId: null, // для кладовщиков
      requestId: request.id,
    }, { transaction });

    await transaction.commit();
    res.json(request);
  } catch (error) {
    await transaction.rollback();
    console.error('Error returning tool:', error);
    res.status(500).json({ message: 'Ошибка при возврате инструмента' });
  }
};

// Создание групповой заявки на несколько инструментов
const createBatchRequest = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { tools } = req.body;
    const userId = req.user.id;

    // Проверяем доступность всех инструментов
    for (const item of tools) {
      const tool = await Tool.findByPk(item.toolId, { transaction });
      
      if (!tool) {
        await transaction.rollback();
        return res.status(404).json({ message: `Инструмент с ID ${item.toolId} не найден` });
      }

      if (tool.status !== 'active') {
        await transaction.rollback();
        return res.status(400).json({ message: `Инструмент ${tool.name} недоступен` });
      }

      if (item.quantity > tool.availableQuantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Недостаточно доступных единиц инструмента ${tool.name}` 
        });
      }
    }

    // Создаем заявки на каждый инструмент
    const requests = await Promise.all(tools.map(async (item) => {
      // Создаем дату возврата (+7 дней) без времени
      const expectedReturnDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expectedReturnDate.setHours(0, 0, 0, 0);

      const request = await Request.create({
        toolId: item.toolId,
        userId,
        quantity: item.quantity,
        status: 'pending',
        requestDate: new Date(),
        expectedReturnDate,
      }, { transaction });

      // Создаем уведомление для кладовщиков
      await Notification.create({
        type: 'request_created',
        message: `Новая заявка на инструмент от ${req.user.fullName}`,
        userId: null, // null означает, что уведомление для всех кладовщиков
        requestId: request.id,
      }, { transaction });

      return request;
    }));

    await transaction.commit();
    res.status(201).json(requests);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating batch request:', error);
    res.status(500).json({ message: 'Ошибка при создании заявок' });
  }
};

// Получение заявок текущего пользователя
const getUserRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Tool,
          as: 'tool',
          attributes: ['name', 'imageUrl'],
        }
      ],
      order: [['requestDate', 'DESC']],
    });

    res.json(requests);
  } catch (error) {
    console.error('Error getting user requests:', error);
    res.status(500).json({ message: 'Ошибка при получении заявок пользователя' });
  }
};

// Получение взятых инструментов
const getBorrowedTools = async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: {
        userId: req.user.id,
        status: 'approved',
      },
      include: [
        {
          model: Tool,
          as: 'tool',
          attributes: ['id', 'name', 'imageUrl', 'description'],
        }
      ],
    });

    res.json(requests);
  } catch (error) {
    console.error('Error getting borrowed tools:', error);
    res.status(500).json({ message: 'Ошибка при получении взятых инструментов' });
  }
};

// Инициация возврата инструмента работником
const initiateToolReturn = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { notes } = req.body;

    const request = await Request.findByPk(id, {
      include: [
        { model: Tool, as: 'tool' },
        { model: User, as: 'user' },
      ],
      transaction,
    });

    if (!request) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    // Проверяем, что заявка принадлежит этому работнику
    if (request.userId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Нет доступа к этой заявке' });
    }

    if (request.status !== 'approved') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Инструмент не был выдан по этой заявке' });
    }

    // Обновляем статус заявки на "возвращается"
    request.status = 'returning';
    if (notes) request.notes = notes;
    await request.save({ transaction });

    // Создаем уведомление для кладовщиков
    await Notification.create({
      type: 'tool_return_initiated',
      message: `Работник ${request.user.fullName} инициировал возврат инструмента ${request.tool.name}`,
      userId: null, // для кладовщиков
      requestId: request.id,
    }, { transaction });

    await transaction.commit();

    res.json(request);
  } catch (error) {
    await transaction.rollback();
    console.error('Error initiating tool return:', error);
    res.status(500).json({ message: 'Ошибка при инициации возврата инструмента' });
  }
};

module.exports = {
  getRequests,
  createRequest,
  processRequest,
  returnTool,
  initiateToolReturn,
  createBatchRequest,
  getUserRequests,
  getBorrowedTools,
}; 