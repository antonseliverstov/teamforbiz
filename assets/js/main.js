/* TeamForBiz — site scripts (no dependencies) */
(function () {
  'use strict';
  var root = document.querySelector('link[href$="assets/css/main.css"]').getAttribute('href').replace('assets/css/main.css', '');

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      mnav.hidden = open;
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); mnav.hidden = true; }
    });
  }

  /* ---------- Diagnostics (home): categories -> complaints -> analysis ---------- */
  // Category «Деньги и заявки», complaint #1 — текст из макета. Остальное — черновики, требуют проверки заказчиком.
  var DIAG = {
    money: [
      ['Заявки есть, продаж нет', 'Отдел продаж жалуется на «мусорные» лиды, маркетинг — на то, что заявки не обрабатывают.', 'Почти всегда дело не в качестве лидов, а в отсутствии общей метрики. Маркетинг отчитывается за заявки, продажи — за сделки, и никто не отвечает за деньги целиком.', 'Сводим маркетинг и продажи в одну воронку', ['Считаем стоимость клиента', 'Подключаем сквозную аналитику', 'Размечаем качество лидов', 'Правим скрипты и скорость ответа']],
      ['Лид дороже маржи', 'Заявки идут, но после расчёта оказывается, что каждая продажа съедает почти всю прибыль.', 'Рекламу оптимизируют на дешёвую заявку, а не на прибыльную сделку. Бюджет уходит на аудиторию, которая оставляет контакты, но не покупает.', 'Перестраиваем рекламу под маржу, а не под заявку', ['Считаем допустимую цену лида', 'Отключаем убыточные сегменты', 'Передаём в рекламу данные о продажах', 'Тестируем оффер под прибыльных клиентов']],
      ['Больше бюджета — дороже заявка', 'Каждый раз, когда увеличиваете бюджет, цена заявки растёт быстрее, чем их количество.', 'Горячий спрос в текущих каналах уже выбран. Новые деньги уходят на всё более холодную и дорогую аудиторию.', 'Ищем новые точки роста вместо перегрева старых', ['Проверяем ёмкость спроса', 'Подключаем новые каналы', 'Расширяем семантику и аудитории', 'Распределяем бюджет по окупаемости']],
      ['Не понимаем, что работает', 'Деньги тратятся на несколько каналов, но какой из них приносит продажи — непонятно.', 'Нет сквозной аналитики: заявки не связаны с источником, а продажи — с заявками. Решения принимаются по ощущениям.', 'Связываем каждый рубль с продажей', ['Настраиваем UTM и цели', 'Подключаем коллтрекинг', 'Связываем CRM с рекламой', 'Собираем отчёт по окупаемости']],
      ['У каждого подрядчика свой отчёт', 'SEO-шник, таргетолог и директолог присылают отчёты в разных форматах, и все они «в плюсе».', 'Каждый подрядчик считает свою метрику и забирает себе одни и те же продажи. Общей картины нет ни у кого.', 'Собираем единую картину по всем каналам', ['Вводим одну модель атрибуции', 'Сводим данные в один дашборд', 'Считаем вклад каждого канала', 'Ставим общие цели в деньгах']],
      ['Филиалы живут вразнобой', 'В одних городах реклама окупается, в других — нет, и каждый филиал продвигается по-своему.', 'Нет единых стандартов: разные сайты, карточки, офферы и настройки. Удачные решения не переносятся между филиалами.', 'Делаем систему, которая масштабируется на все точки', ['Проводим аудит каждого филиала', 'Собираем единый шаблон кампаний', 'Унифицируем карточки на картах', 'Сравниваем точки по одним метрикам']],
      ['Клик дорогой, продукт сложный', 'Клик стоит дорого, а клиенту нужно время и несколько касаний, чтобы решиться на покупку.', 'Реклама пытается продать с первого касания. Для сложного продукта нужен прогрев: контент, ретаргетинг и доказательства.', 'Строим воронку прогрева вместо продажи в лоб', ['Делим путь клиента на этапы', 'Запускаем контент и ПромоСтраницы', 'Настраиваем ретаргетинг', 'Добавляем кейсы и отзывы в путь']]
    ],
    demand: [
      ['Мало заявок', 'Сайт и реклама есть, но заявок единицы, и непонятно, где теряются клиенты.', 'Чаще всего трафика мало или он нецелевой: реклама показывается не тем людям, а сайт не отвечает на их вопросы.', 'Находим, где теряется спрос, и закрываем дыры', ['Считаем объём спроса в нише', 'Проверяем настройки рекламы', 'Разбираем путь до заявки', 'Запускаем недостающие каналы']],
      ['Сезонные провалы', 'В несезон заявки почти исчезают, и бизнес живёт от пика до пика.', 'Продвижение работает только на горячий спрос, который зависит от сезона. Нет каналов, которые накапливают аудиторию заранее.', 'Сглаживаем сезонность и копим спрос заранее', ['Анализируем спрос по месяцам', 'Готовим офферы на несезон', 'Запускаем SEO и контент', 'Собираем базу для повторных продаж']],
      ['Трафик есть, но не тот', 'Посетителей много, но они уходят, ничего не купив, или спрашивают не то, что вы продаёте.', 'Запросы и аудитории подобраны слишком широко. Реклама приводит людей, которые ищут похожее, но не ваше.', 'Чистим трафик до целевого', ['Чистим семантику и минус-слова', 'Сужаем аудитории', 'Уточняем объявления и оффер', 'Отслеживаем качество по продажам']],
      ['Нас нет в поиске', 'Конкуренты в топе по ключевым запросам, а вас клиенты просто не находят.', 'Сайт не оптимизирован под запросы, за которыми стоят деньги: не хватает страниц, контента и технической базы.', 'Выводим сайт в поиск по денежным запросам', ['Проводим SEO-аудит', 'Собираем семантическое ядро', 'Расширяем структуру сайта', 'Готовим контент под запросы']],
      ['Зависим от одного канала', 'Почти все заявки идут из одного источника, и любой сбой в нём сразу бьёт по выручке.', 'Бизнес не диверсифицирован по каналам. Рост цены клика или блокировка кабинета ставят под угрозу продажи.', 'Строим несколько независимых источников клиентов', ['Оцениваем риски текущего канала', 'Подбираем новые каналы', 'Тестируем их на малом бюджете', 'Масштабируем окупаемые']]
    ],
    reputation: [
      ['Плохие отзывы в выдаче', 'По названию компании в поиске первыми выходят негативные отзывы и жалобы.', 'Негатив никто не отрабатывает, а довольные клиенты отзывов не оставляют. Выдача по бренду формируется сама.', 'Наводим порядок в выдаче по бренду', ['Мониторим упоминания', 'Отвечаем на негатив', 'Собираем отзывы довольных клиентов', 'Вытесняем негатив из топа']],
      ['Нас плохо знают', 'В нише вас мало кто знает, и клиенты выбирают более известных конкурентов.', 'Компания работает только с горячим спросом и не строит узнаваемость. Клиент выбирает знакомое имя.', 'Растим узнаваемость среди целевой аудитории', ['Определяем ключевые аудитории', 'Запускаем охватные форматы', 'Публикуем экспертный контент', 'Отслеживаем рост брендовых запросов']],
      ['Соцсети не приносят клиентов', 'Ведёте соцсети, публикуете посты, но подписчики не превращаются в покупателей.', 'Контент делается «для красоты», без воронки: нет оффера, пути до заявки и работы с комментариями и директом.', 'Превращаем соцсети в канал продаж', ['Разбираем аудиторию и контент', 'Выстраиваем путь до заявки', 'Подключаем таргет на прогрев', 'Отрабатываем комментарии и директ']],
      ['Карточки на картах пустые', 'На Яндекс Картах и в 2ГИС у вас мало отзывов и фото, а клиенты выбирают соседей.', 'Карточки не заполнены и не продвигаются. Клиент сравнивает рейтинг и фото — и уходит к тем, у кого их больше.', 'Делаем карточки, которые выбирают', ['Заполняем и оформляем карточки', 'Собираем отзывы', 'Запускаем рекламу на картах', 'Следим за рейтингом']]
    ],
    site: [
      ['Сайт не конвертирует', 'Трафик на сайт идёт, а заявок почти нет — посетители уходят, ничего не оставив.', 'Сайт не отвечает на вопросы клиента и не ведёт к действию: слабый оффер, сложная форма, нет доверия.', 'Перестраиваем сайт под путь до заявки', ['Анализируем поведение посетителей', 'Усиливаем оффер и структуру', 'Упрощаем формы', 'Тестируем гипотезы по конверсии']],
      ['Сайт медленный и устаревший', 'Сайт долго грузится, плохо выглядит на телефоне, а вносить правки сложно и дорого.', 'Старая платформа и тяжёлый код. Каждая секунда загрузки отнимает заявки, а реклама дорожает.', 'Делаем быстрый и удобный сайт', ['Проводим технический аудит', 'Ускоряем загрузку', 'Адаптируем под мобильные', 'Переносим на удобную платформу']],
      ['Заявки теряются', 'Заявки приходят на почту, в мессенджеры и звонками — часть из них никто не обрабатывает.', 'Нет единой системы приёма заявок. Менеджеры не видят всех обращений, а скорость ответа низкая.', 'Собираем все заявки в одном месте', ['Подключаем CRM', 'Настраиваем уведомления', 'Автоматизируем ответы', 'Контролируем скорость обработки']],
      ['Долго отвечаем клиентам', 'Клиенты пишут вечером и в выходные, а ответ получают только на следующий день.', 'Пока менеджер не на связи, клиент уходит к тому, кто ответил быстрее.', 'Отвечаем клиентам сразу, даже ночью', ['Запускаем чат-бота', 'Подключаем ИИ-ассистента', 'Собираем частые вопросы', 'Передаём горячие заявки менеджеру']],
      ['Нет аналитики на сайте', 'Не знаете, откуда приходят посетители, что они делают на сайте и где уходят.', 'Метрика не настроена или настроена без целей. Без данных любые изменения — это догадки.', 'Настраиваем аналитику, которой можно доверять', ['Ставим счётчики и цели', 'Настраиваем электронную коммерцию', 'Подключаем вебвизор и карты кликов', 'Собираем понятный отчёт']]
    ]
  };

  var diag = document.querySelector('.diag');
  if (diag) {
    var list = diag.querySelector('.diag__list');
    var panel = diag.querySelector('.diag__panel');
    var cats = diag.querySelectorAll('.diag__cat');
    var curCat = 'money';

    function showItem(cat, i) {
      var d = DIAG[cat][i];
      panel.querySelector('.diag__symptom').textContent = d[1];
      panel.querySelector('.diag__cause').textContent = d[2];
      panel.querySelector('.diag__fix').textContent = d[3];
      // design order: 01 02 / 03 04 in two columns
      var steps = panel.querySelector('.diag__steps');
      steps.innerHTML = '';
      [0, 1, 2, 3].forEach(function (k) {
        var li = document.createElement('li');
        li.innerHTML = '<b>0' + (k + 1) + '</b>';
        li.appendChild(document.createTextNode(d[4][k]));
        steps.appendChild(li);
      });
      list.querySelectorAll('.diag__item').forEach(function (b, k) {
        b.classList.toggle('is-active', k === i);
        b.setAttribute('aria-selected', String(k === i));
      });
    }

    function showCat(cat) {
      curCat = cat;
      cats.forEach(function (c) {
        var on = c.dataset.cat === cat;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-selected', String(on));
      });
      list.innerHTML = '';
      DIAG[cat].forEach(function (d, i) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'diag__item';
        b.setAttribute('role', 'tab');
        b.innerHTML = '<img src="' + root + 'assets/img/complaint-' + ((i % 7) + 1) + '.png" alt="" width="56" height="56">';
        b.appendChild(document.createTextNode(d[0]));
        b.addEventListener('click', function () { showItem(curCat, i); });
        li.appendChild(b);
        list.appendChild(li);
      });
      showItem(cat, 0);
    }
    cats.forEach(function (c) { c.addEventListener('click', function () { showCat(c.dataset.cat); }); });
    showCat('money');
  }

  /* ---------- Audit quiz (services) ---------- */
  // Вопрос 1 — из макета. Вопросы 2–5 и логика рекомендаций — черновик, требует проверки заказчиком.
  var SVC = {
    marketing: ['Маркетинг', 'services/marketing/'], seo: ['SEO', 'services/seo/'], web: ['Сайты и веб-сервисы', 'services/development/'],
    ppc: ['Контекстная реклама', 'services/ppc/'], target: ['Таргетированная реклама', 'services/target/'], smm: ['SMM', 'services/smm/'],
    maps: ['Реклама на картах', 'services/maps/'], promo: ['ПромоСтраницы', 'services/promopages/'], serm: ['Управление репутацией бренда', 'services/serm/']
  };
  var QUIZ = [
    ['Что сейчас главная проблема?', [['Мало заявок', 'ppc maps seo'], ['Заявки есть, продаж нет', 'marketing web'], ['Заявки слишком дорогие', 'marketing ppc target'], ['Нас плохо знают', 'smm promo serm']]],
    ['Какой у вас бизнес?', [['Услуги рядом с клиентом', 'maps serm'], ['Интернет-магазин', 'seo ppc'], ['B2B и сложный продукт', 'promo ppc marketing'], ['Образование и онлайн-курсы', 'target smm promo']]],
    ['Что с сайтом?', [['Есть и приносит заявки', 'seo'], ['Есть, но заявок мало', 'web'], ['Только соцсети и карточки', 'web smm'], ['Пока ничего нет', 'web']]],
    ['Какой рекламный бюджет в месяц?', [['До 50 000 ₽', 'maps'], ['50–150 тысяч ₽', 'ppc'], ['150–500 тысяч ₽', 'ppc target'], ['Больше 500 тысяч ₽', 'marketing promo']]],
    ['Как вы считаете результат?', [['Сквозная аналитика', ''], ['Метрика и CRM отдельно', 'marketing'], ['По ощущениям', 'marketing'], ['Никак не считаем', 'marketing']]]
  ];
  document.querySelectorAll('.js-quiz').forEach(function (box) {
    var step = 0, score = {}, picked = [];
    function render() {
      var bars = '<div class="quiz__bars">' + QUIZ.map(function (_, i) { return '<i class="' + (i <= step ? 'is-on' : '') + '"></i>'; }).join('') + '</div>';
      if (step < QUIZ.length) {
        var q = QUIZ[step];
        box.innerHTML = '<p class="quiz__progress">Вопрос ' + (step + 1) + ' из ' + QUIZ.length + '</p>' + bars +
          '<p class="quiz__q">' + q[0] + '</p><div class="quiz__answers">' +
          q[1].map(function (a, i) { return '<button type="button" class="quiz__a" data-i="' + i + '">' + a[0] + '</button>'; }).join('') +
          '</div><p class="quiz__hint">Выберите один вариант, чтобы перейти к следующему вопросу</p>';
        box.querySelectorAll('.quiz__a').forEach(function (b) {
          b.addEventListener('click', function () {
            var a = q[1][+b.dataset.i];
            b.classList.add('is-active');
            picked.push(q[0] + ' — ' + a[0]);
            a[1].split(' ').filter(Boolean).forEach(function (k, n) { score[k] = (score[k] || 0) + 3 - Math.min(n, 2); });
            setTimeout(function () { step++; render(); }, 180);
          });
        });
      } else {
        var top = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; }).slice(0, 3);
        if (!top.length) top = ['marketing'];
        box.innerHTML = '<p class="quiz__progress">Готово</p>' + bars + '<div class="quiz__result"><h3>С этого стоит начать</h3><ul>' +
          top.map(function (k) { return '<li><a class="tag" href="' + root + SVC[k][1] + '">' + SVC[k][0] + '</a></li>'; }).join('') +
          '</ul><p>Это предварительный вывод по пяти ответам. Точный план составим, когда посмотрим ваши цифры — разбор бесплатный.</p>' +
          '<a class="btn2 btn2--hot" href="#request">Отправить ответы и получить разбор</a><br><button type="button" class="quiz__back">Пройти заново</button></div>';
        box.querySelector('.quiz__back').addEventListener('click', function () { step = 0; score = {}; picked = []; render(); });
        // prefill the lead form
        var form = document.querySelector('.js-lead-form');
        if (form) {
          form.querySelectorAll('input[name="interest[]"]').forEach(function (c) {
            c.checked = top.some(function (k) { return SVC[k][0] === c.value; });
          });
          if (form.elements.task && !form.elements.task.value) form.elements.task.value = 'Ответы опроса:\n' + picked.join('\n');
        }
      }
    }
    render();
  });

  /* ---------- Cases filter ---------- */
  var cgrid = document.querySelector('.js-ccards');
  if (cgrid) {
    var selects = document.querySelectorAll('.js-cf');
    var counter = document.querySelector('.js-cf-count');
    var plural = function (n) {
      var m10 = n % 10, m100 = n % 100;
      return n + ' ' + (m10 === 1 && m100 !== 11 ? 'кейс' : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'кейса' : 'кейсов');
    };
    var empty = document.createElement('p');
    empty.className = 'ccards__empty';
    empty.textContent = 'По этому сочетанию кейсов пока нет — расскажите о задаче, и мы покажем похожий опыт.';
    var apply = function () {
      var f = {};
      selects.forEach(function (s) { if (s.value) f[s.dataset.key] = s.value; });
      var n = 0;
      cgrid.querySelectorAll('.ccard').forEach(function (c) {
        var ok = (!f.industry || c.dataset.industry === f.industry) && (!f.service || c.dataset.service === f.service);
        c.hidden = !ok; if (ok) n++;
      });
      counter.textContent = plural(n);
      if (n) empty.remove(); else cgrid.appendChild(empty);
    };
    selects.forEach(function (s) { s.addEventListener('change', apply); });
  }

  /* ---------- FAQ: one open at a time per grid ---------- */
  document.querySelectorAll('.faq__grid, .js-accordion').forEach(function (grid) {
    grid.addEventListener('toggle', function (e) {
      if (!e.target.open) return;
      grid.querySelectorAll('details[open]').forEach(function (d) { if (d !== e.target) d.open = false; });
    }, true);
  });

  /* ---------- Lead forms ---------- */
  document.querySelectorAll('.js-lead-form').forEach(function (form) {
    var status = form.querySelector('.request__status');
    var btn = form.querySelector('[type=submit]');
    var pageField = form.querySelector('[name=page]');
    if (pageField) pageField.value = document.title + ' — ' + location.pathname;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
      ['name', 'contact'].forEach(function (n) {
        var f = form.elements[n];
        if (f && !f.value.trim()) { f.closest('.field').classList.add('is-invalid'); ok = false; }
      });
      var consent = form.elements.consent;
      if (consent && !consent.checked) { consent.closest('.consent').classList.add('is-invalid'); ok = false; }
      if (!ok) { setStatus('Заполните имя, контакт и подтвердите согласие', 'err'); return; }

      btn.disabled = true;
      setStatus('Отправляем…', '');
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (res) {
          if (!res || !res.ok) throw new Error((res && res.error) || 'send failed');
          form.reset();
          setStatus('Спасибо! Ответим в течение 40 минут в рабочее время.', 'ok');
          if (typeof window.ym === 'function' && window.YM_ID) window.ym(window.YM_ID, 'reachGoal', 'lead');
        })
        .catch(function () {
          setStatus('Не получилось отправить. Напишите нам в Telegram @stpug или на info@teamforbiz.ru', 'err');
        })
        .finally(function () { btn.disabled = false; });
    });

    function setStatus(text, kind) {
      status.textContent = text;
      status.className = 'request__status' + (kind ? ' is-' + kind : '');
    }
  });
})();
