# Narcos Records — сайт студии звукозаписи (Тюмень)

Одностраничный статический лендинг. Чистый HTML + CSS + JS, без сборщиков и фреймворков.

```
index.html      разметка и все тексты
styles.css      дизайн-система и вёрстка (секции пронумерованы комментариями)
script.js       навигация, анимации появления, счётчики
assets/         логотип, фавикон, фото (см. assets/README.md)
```

## Запуск локально

```bash
python -m http.server 5178
```

Затем откройте http://localhost:5178

## Деплой на GitHub Pages

1. Создайте репозиторий и залейте эти файлы в корень ветки `main`.
2. Settings → Pages → Source: `Deploy from a branch`, ветка `main`, папка `/ (root)`.
3. Через минуту сайт будет доступен по адресу `https://<логин>.github.io/<репозиторий>/`.

Любой другой статический хостинг (Netlify, Vercel, обычный nginx) — просто отдайте папку как есть.

## Что нужно подставить

Все места помечены комментариями прямо в `index.html` — ищите слова
**ВСТАВИТЬ ССЫЛКУ** и **ЗАМЕНИТЬ**.

| Что | Где | Как |
|---|---|---|
| Плееры треков | `index.html`, раздел «03 — Работы», блок `.audio-grid` | Раскомментируйте `<iframe>` и вставьте код Яндекс.Музыки (`https://music.yandex.ru/iframe/track/ТРЕК/АЛЬБОМ`). Затем удалите `<div class="embed-ph">…</div>` из этой же карточки. |
| Клипы и Reels | там же, блок `.video-grid` | То же самое: YouTube `https://www.youtube.com/embed/ID`, VK `https://vk.com/video_ext.php?…`. Карточки `.wide` — 16:9, `.tall` — 9:16. |
| Фото студии | `assets/photos/` | Имена файлов — в `assets/README.md`. Пока файла нет, показывается аккуратный плейсхолдер. |
| Фото команды | `assets/team/roman.jpg`, `valeriy.jpg` | Вертикаль 3:4. |
| Обложка для соцсетей | `assets/og-cover.jpg` | 1200×630, подставляется в Open Graph. |
| Прямая ссылка на карточку Яндекс.Карт | `index.html`, класс `.yamap-badge` | Замените `href` на прямой адрес организации. |

Тексты, цены и контакты правятся прямо в `index.html` — разметка разбита
комментариями по секциям (`01 — О студии`, `02 — Услуги` и т. д.).

## Что уже сделано

- Мобильная вёрстка от 360 px, sticky-навигация, бургер-меню, закреплённая панель связи на телефоне.
- Доступность: семантические теги, `alt` у всех изображений, фокус-стили, `aria-*` у меню, поддержка `prefers-reduced-motion`, работа без JS (`<noscript>`).
- SEO: `title`, meta description, Open Graph, Twitter Card, `lang="ru"`, JSON-LD `Organization` / `LocalBusiness` с адресом, режимом работы и рейтингом.
- Производительность: без библиотек, шрифты через Google Fonts с `preconnect`, все изображения `loading="lazy"` (кроме hero — `fetchpriority="high"`).

## Контакты в разметке

Телефон `+7 (922) 062-64-64`, мессенджеры `+7 (967) 540-93-06`,
Telegram [@gonanight](https://t.me/gonanight) (запись) и
[@narcosrec72](https://t.me/narcosrec72) (канал),
WhatsApp, Viber, [VK](https://vk.com/narcosrecords), Instagram `@narcosrecords72`.
Адрес: Тюмень, ул. Сакко, 21. Круглосуточно, по записи.
