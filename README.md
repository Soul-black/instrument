# Система управления инструментами

Веб-приложение для управления инструментами на производстве. Позволяет отслеживать выдачу и возврат инструментов, управлять заявками и вести учет.

## Требования к системе

- Node.js (LTS версия)
- PostgreSQL
- Git
- Vite (устанавливается автоматически)

## Технологии

### Клиентская часть

- React 18
- Material-UI (MUI) v5
- React Router v6
- Recharts для визуализации данных
- Axios для HTTP-запросов
- Vite для сборки и разработки

### Серверная часть

- Node.js с Express
- Sequelize ORM
- PostgreSQL
- JWT для аутентификации

## Установка и настройка

### 1. Клонирование репозитория

```bash
git clone <url-репозитория>
cd tools
```

### 2. Настройка базы данных

1. Установите PostgreSQL, если он еще не установлен
2. Создайте базу данных:

```sql
CREATE DATABASE tools_db;
```

3. Настройте доступ к базе данных:

- Пользователь: postgres
- Пароль: postgres
- Хост: localhost
- Порт: 5432

Или измените настройки в файле `server/config/config.json`

### 3. Настройка серверной части

```bash
# Переход в директорию сервера
cd server

# Установка зависимостей
npm install

# Инициализация базы данных и создание демо-данных
npm run setup
```

Скрипт `setup` выполнит следующие действия:

1. Удалит существующие таблицы в базе данных
2. Создаст новые таблицы через миграции
3. Создаст учетную запись кладовщика (логин: storekeeper@example.com, пароль: password)
4. Добавит демонстрационные категории и инструменты

Дополнительные скрипты:

```bash
# Только удаление таблиц
npm run init-db

# Только применение миграций
npm run migrate

# Только создание учетной записи кладовщика
npm run create-storekeeper

# Только создание демонстрационных инструментов
npm run create-demo-tools

# Управление миграциями
npm run migrate           # Применить миграции
npm run migrate:undo     # Отменить последнюю миграцию
npm run migrate:undo:all # Отменить все миграции
```

### 4. Настройка клиентской части

```bash
# Переход в директорию клиента
cd client

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Или сборка для продакшена
npm run build
npm run preview
```

## Запуск приложения

### Запуск сервера (порт 5000)

```bash
cd server
npm run dev
```

### Запуск клиента (порт 5173)

```bash
cd client
npm run dev
```

После запуска приложение будет доступно по адресу: http://localhost:5173

## Структура проекта

```
/tools
├── client/                  # React приложение
│   ├── public/             # Публичные файлы
│   ├── src/                # Исходный код
│   │   ├── components/     # React компоненты
│   │   ├── hooks/         # Пользовательские хуки
│   │   ├── pages/         # Страницы приложения
│   │   ├── services/      # Сервисы для работы с API
│   │   └── theme/         # Настройки темы
│   └── package.json       # Зависимости клиента
│
└── server/                 # Node.js сервер
    ├── config/            # Конфигурация
    ├── controllers/       # Контроллеры
    ├── middlewares/      # Промежуточное ПО
    ├── migrations/       # Миграции базы данных
    ├── models/          # Модели Sequelize
    ├── routes/         # Маршруты API
    └── package.json    # Зависимости сервера
```

## API Endpoints

### Аутентификация

- POST `/api/auth/login` - Вход в систему
- POST `/api/auth/register` - Регистрация нового пользователя

### Инструменты

- GET `/api/tools` - Получение списка инструментов
- POST `/api/tools` - Создание нового инструмента
- GET `/api/tools/:id` - Получение информации об инструменте
- PATCH `/api/tools/:id` - Обновление инструмента
- DELETE `/api/tools/:id` - Удаление инструмента

### Категории инструментов

- GET `/api/categories` - Получение списка категорий
- POST `/api/categories` - Создание новой категории
- PATCH `/api/categories/:id` - Обновление категории
- DELETE `/api/categories/:id` - Удаление категории

### Заявки

- GET `/api/requests` - Получение списка заявок
- POST `/api/requests` - Создание новой заявки
- PATCH `/api/requests/:id` - Обновление статуса заявки
- DELETE `/api/requests/:id` - Удаление заявки

## Роли пользователей

1. Работник (worker)

   - Просмотр доступных инструментов по категориям
   - Создание заявок на инструменты
   - Возврат взятых инструментов
   - Отслеживание статуса заявок

2. Кладовщик (storekeeper)
   - Управление инструментами и категориями
   - Обработка заявок
   - Подтверждение возвратов
   - Просмотр статистики и аналитики

## Разработка

### Команды для разработки

```bash
# Запуск тестов
npm test

# Проверка кода
npm run lint

# Сборка проекта
npm run build
```

### Переменные окружения

#### Сервер

Создайте файл `.env` в директории `server`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key

# База данных
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_NAME=tools_db
```

#### Клиент

Создайте файл `.env` в директории `client`:

```env
VITE_API_URL=http://localhost:5002/api
```
#   m y - i n s t r u m e n t  
 