# TeamForBiz — сайт teamforbiz.ru

Статическая вёрстка по макетам Figma (файл `WKQfbiHqlnQvXMcN48rn6A`, фрейм «работаем»).

- `src/pages/*.html` — страницы, `src/partials/*.html` — общие блоки (шапка, форма заявки, подвал).
- `assets/` — стили, скрипты, картинки (выгружены из Figma).
- `php/lead.php` — обработчик заявок (письмо на info@teamforbiz.ru), работает на хостинге с PHP.
- `node tools/build.js` → собирает сайт в `dist/`.
- `node tools/figma-export.js name.png=NODE_ID` — выгрузка ассетов из Figma (нужен токен в `~/.figma_token`).

Десктоп 1440 px повторяет макет 1:1; на 1024–1439 px макет масштабируется пропорционально; ниже 1024 px блоки перестраиваются в колонку.
