# PetMatch (tula-hack)

Бэкенд на Go (Gin, SQLite), фронт — статическое SPA в `pet-swipe-app`, в Docker фронт отдаётся через Node (`serve`).

## Требования

- **Docker** и **Docker Compose** (Plugin `docker compose` или отдельная утилита `docker-compose`).

Для локального запуска без Docker: **Go 1.24+** (в `go.mod` указана цепочка инструментов под 1.25), **Node.js** для фронта.

## Переменные окружения

Для загрузки фото в Object Storage (S3-совместимый API) нужны ключи:

| Переменная | Описание |
|------------|----------|
| `YANDEX_ACCESS_KEY_ID` | Идентификатор ключа |
| `YANDEX_SECRET_ACCESS_KEY` | Секрет ключа |

Создайте в **корне репозитория** файл `.env` (рядом с `docker-compose.yml`) с этими переменными. Docker Compose подставит их в сервис `api`. Файл `.env` не коммитьте, если в нём реальные секреты.

## Запуск через Docker (рекомендуется)

Из корня репозитория:

```bash
docker compose up --build
```

- **Фронт:** [http://localhost:3000](http://localhost:3000)
- **API:** [http://localhost:8080](http://localhost:8080)

База SQLite хранится в томе Docker `sqlite_data` (данные переживают перезапуск контейнера).

Остановка: `Ctrl+C` или `docker compose down`. Чтобы удалить и том с БД: `docker compose down -v`.

## Локальный запуск без Docker

### Бэкенд

В корне репозитория создайте `.env` с `YANDEX_ACCESS_KEY_ID` и `YANDEX_SECRET_ACCESS_KEY` (или экспортируйте эти переменные в окружении). Затем из корня:

```bash
go run ./backend/cmd/app
```

Сервер слушает порт **8080**. Файл `data.db` появится в текущей директории (корень репозитория), если вы запускаете команду оттуда.

### Фронт

```bash
cd pet-swipe-app
npm install
npm start
```

Откройте [http://localhost:3000](http://localhost:3000). В `pet-swipe-app/js/api.js` по умолчанию API указывает на `http://localhost:8080` — с локальным бэкендом это совпадает.

## Структура

| Путь | Назначение |
|------|------------|
| `backend/` | Go API |
| `pet-swipe-app/` | Фронт (HTML/CSS/JS) |
| `Dockerfile` | Образ API |
| `pet-swipe-app/Dockerfile` | Образ фронта |
| `docker-compose.yml` | Сервисы `api` и `web` |
