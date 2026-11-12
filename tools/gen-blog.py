# Generates src/pages/blog.html from data extracted from Figma (frame 1:1560).
R = "{{root}}"
rubrics = [  # key, title, desc, count, icon
 ("marketing", "Маркетинг", "Про экономику, воронки и решения, которые принимают по цифрам, а не по ощущениям.", "2 материала"),
 ("seo", "SEO", "Апдейты, техническая оптимизация и разборы того, почему трафик уходит и как его вернуть.", "2 материала"),
 ("web", "Сайты", "Скорость, Core Web Vitals, архитектура и то, почему «переписать» иногда дешевле, чем чинить.", "1 материал"),
 ("ppc", "Контекст", "Ставки, аукционы, структура кампаний и способы не отдавать деньги за пустые клики.", "1 материал"),
 ("target", "Таргет", "Аудитории, креативы и настройки, после которых охват перестаёт быть просто охватом.", "1 материал"),
 ("smm", "SMM", "Форматы, которые дочитывают, и способы превратить подписчика в клиента.", "1 материал"),
 ("maps", "Карты", "Карточки, рубрики и приоритет: как попасть в первый экран у тех, кто ищет рядом.", "1 материал"),
 ("promo", "ПромоСтраницы", "Длинные тексты, тесты заголовков и честная цена дочитывания без округлений в свою пользу.", "1 материал"),
 ("serm", "Репутация", "Как выглядит ваша брендовая выдача со стороны и что с ней можно сделать законно.", "1 материал"),
]
names = {k: t for k, t, _, _ in rubrics}
posts = [  # key, date, title, desc
 ("marketing", "28 июля 2026 г.  ·  9 мин", "Юнит-экономика на салфетке: четыре числа, которые решают всё", "Если вы знаете средний чек, маржу, конверсию и стоимость клика — вы уже можете посчитать, окупится ли канал. Разбираем на живом примере."),
 ("seo", "21 июля 2026 г.  ·  12 мин", "Трафик упал после апдейта: что проверять в первые сутки", "Пошаговый разбор: как отличить санкции от переоценки контента и не наделать хуже, пока паникуете."),
 ("ppc", "14 июля 2026 г.  ·  7 мин", "Почему оптимизация на заявки убивает вашу рекламу", "Алгоритм честно приносит дешёвые заявки. Проблема в том, что дешёвая заявка и прибыльный клиент — разные вещи."),
 ("smm", "7 июля 2026 г.  ·  11 мин", "Telegram-канал с нуля: первые 100 дней без бюджета", "Что публиковать, когда подписчиков двадцать, и как не бросить на третьем месяце, когда кажется, что не работает."),
 ("serm", "30 июня 2026 г.  ·  8 мин", "Как отвечать на негативный отзыв, чтобы он работал на вас", "Разбор пяти реальных ответов: два сделали хуже, один спас клиента, два превратили жалобу в рекомендацию."),
 ("web", "23 июня 2026 г.  ·  14 мин", "Core Web Vitals: что чинить первым, если время есть только на одно", "LCP, CLS и INP по важности для конверсии, а не по порядку в документации."),
 ("target", "16 июня 2026 г.  ·  8 мин", "Похожие аудитории: где заканчивается сходство и начинается слив бюджета", "Алгоритм найдёт похожих на ваших клиентов. Вопрос в том, по какому признаку он их считает похожими — и совпадает ли этот признак с платёжеспособностью."),
 ("maps", "11 июня 2026 г.  ·  7 мин", "Карточка на картах: двенадцать полей, которые решают, позвонят вам или соседу", "Рубрика, часы, прайс, фото входа. Разбираем, что в карточке влияет на выдачу, что — на решение человека, а что не влияет ни на что."),
 ("marketing", "9 июня 2026 г.  ·  9 мин", "Сквозная аналитика без иллюзий: что она покажет, а что нет", "Подключить рекламу к CRM — половина дела. Вторая половина в том, чтобы менеджеры перестали закрывать сделки задним числом."),
 ("promo", "4 июня 2026 г.  ·  11 мин", "Цена дочитывания: почему дешёвый трафик из статьи бывает бесполезным", "Дочитывание за три рубля выглядит победой ровно до момента, когда смотришь, кто дочитал. Считаем канал по заявкам, а не по проценту."),
 ("seo", "2 июня 2026 г.  ·  13 мин", "Структура сайта важнее текстов: как кластеризовать семантику по намерению", "Частотность говорит, сколько людей ищет. Намерение — что они хотят. Ранжируется второе."),
]
chip_w = {"all": 68, "marketing": 111, "seo": 68, "web": 75, "ppc": 102, "target": 84, "smm": 68, "maps": 75, "promo": 147, "serm": 111}

rub_html = "\n".join(f'''      <button type="button" class="rubric js-rubric" data-cat="{k}">
        <img src="{R}assets/img/blog-ic-{k}.png" alt="" loading="lazy">
        <h3>{t}</h3>
        <p>{d}</p>
        <span class="rubric__count">{c}</span>
        <span class="rubric__go" aria-hidden="true">→</span>
      </button>''' for k, t, d, c in rubrics)

chips = [f'<button type="button" class="bchip is-active" data-cat="all" style="width:{chip_w["all"]}px">Все</button>'] + \
        [f'<button type="button" class="bchip" data-cat="{k}" style="width:{chip_w[k]}px">{names[k]}</button>' for k, *_ in rubrics]

post_html = "\n".join(f'''      <article class="post" data-cat="{k}">
        <span class="post__cat">{names[k]}</span>
        <p class="post__date">{d}</p>
        <h3 class="post__title">{t}</h3>
        <p class="post__desc">{x}</p>
        <p class="post__more">Читать статью <span aria-hidden="true">→</span></p>
      </article>''' for k, d, t, x in posts)

request = ('<!-- @include request {"title":"Разберём вашу<br>задачу","lead":"Читать полезно, считать — полезнее. Пришлите ситуацию, вернёмся с цифрами.",'
           '"tstyle":"font-size:56px;line-height:62px;letter-spacing:-1.1px","lstyle":"top:330px;line-height:29px","c-marketing":"checked"} -->')

page = f'''<!doctype html>
<html lang="ru">
<head>
<!-- @include head {{"title":"Блог TeamForBiz — маркетинг, SEO, реклама и сайты на практике","description":"Пишем о том, что делаем руками: юнит-экономика, апдейты поисковиков, контекст, таргет, SMM, карты, ПромоСтраницы и репутация. Ошибки клиентов и цифры, которые можно проверить."}} -->
</head>
<body>
<!-- @include header {{"active":"blog"}} -->
<main>

<section class="section">
  <div class="stage" style="height:760px">
    <img class="bgword" src="{R}assets/img/word-blog.svg" alt="" style="left:860px">
    <img class="deco" src="{R}assets/img/cube-white-sm.svg" alt="" style="left:23.6px;top:79.8px">
    <img class="deco" src="{R}assets/img/cube-white-sm.svg" alt="" style="left:1355.8px;top:604.6px">
    <h1 class="a blog-h1" style="left:70px;top:164px;width:700px"><span class="red">Пишем о том,</span><br>что делаем руками</h1>
    <p class="a lead20" style="left:70px;top:334px;width:590px;line-height:31px;color:#575761">Разбираем то, через что прошли сами: ошибки, которые чаще всего видим у клиентов, и цифры, которые можно проверить.</p>
    <div class="a anons" style="left:790px;top:215px">
      <a class="anon" href="#fresh" style="--acc:#ff9a18"><span class="anon__cat">Маркетинг</span><span class="anon__date">28 июля · 9 мин</span><b>Юнит-экономика на салфетке: четыре числа, которые решают всё</b></a>
      <a class="anon" href="#fresh" style="--acc:#c9140a;margin-left:34px"><span class="anon__cat">SEO</span><span class="anon__date">21 июля · 12 мин</span><b>Трафик упал после апдейта: что проверять в первые сутки</b></a>
      <a class="anon" href="#fresh" style="--acc:#ff9a18;margin-left:68px"><span class="anon__cat">Контекст</span><span class="anon__date">14 июля · 7 мин</span><b>Почему оптимизация на заявки убивает вашу рекламу</b></a>
    </div>
  </div>
</section>

<section class="section">
  <div class="stage" style="height:1190px">
    <img class="deco" src="{R}assets/img/cube-orange-lg.svg" alt="" style="left:1318.9px;top:89.4px">
    <h2 class="a t48" style="left:70px;top:122px;width:820px;color:#131316">Выберите направление</h2>
    <div class="a rubrics" style="left:70px;top:230px">
{rub_html}
    </div>
  </div>
</section>

<section class="section" id="fresh">
  <div class="stage blog-fresh" style="height:2700px">
    <img class="deco" src="{R}assets/img/cube-white-sm.svg" alt="" style="left:14.2px;top:117.9px">
    <img class="deco" src="{R}assets/img/cube-white-sm.svg" alt="" style="left:1396.2px;top:2388.9px">
    <h2 class="a t48" style="left:70px;top:126px;width:500px;color:#131316">Свежее</h2>
    <div class="a bchips" style="left:70px;top:205px" role="toolbar" aria-label="Рубрики">
      {"".join(chips)}
    </div>
    <div class="a posts js-posts" style="left:70px;top:290px">
{post_html}
    </div>
  </div>
</section>

{request}

</main>
<!-- @include footer -->
<!-- @include scripts -->
</body>
</html>
'''
open('src/pages/blog.html', 'w', encoding='utf-8').write(page)
print('ok')
