# Generates src/pages/cases.html from case data extracted from Figma (frame 1:962).
cases = [
 ("Товары для дома","5 месяцев","Рулонные шторы · 2026","1&nbsp;229%","ROMI","Рулонные шторы: снизили стоимость продажи на 76% и увеличили ROMI с 300% до 1&nbsp;229%","Как сохранили объём продаж при сокращении рекламных расходов в 4 раза","ppc"),
 ("Образование","8 месяцев","MBA / бизнес-образование · 2025","17%","Конверсия заявки в продажу","MBA / бизнес-образование: самый высокий CR в продажу среди подрядчиков — 17%","Как в условиях перегретого аукциона и внутренней конкуренции сместили фокус с дешёвых лидов на аудиторию, которая реально покупает","ppc"),
 ("Финансы","2 недели","Финансовая ниша · 2026","−55%","CPA","Финансовая ниша: снизили CPA на 55% в перегретом аукционе","Как смена стратегии помогла получать больше заявок при меньших расходах","ppc"),
 ("Финансы","месяц","Финансовая ниша · 2025","+114%","Конверсии","Финансовая ниша: снизили CPA на 55% за счёт работы с платежеспособной аудиторией","Как исследование премиального сегмента помогло найти новые аудитории и получить в 2 раза больше трафика при меньших расходах.","ppc"),
 ("Образование","полтора месяца","Онлайн-колледж · 2026","736&nbsp;₽","CPA с НДС","Онлайн-колледж: CPA почти в 3 раза ниже KPI","Как за полтора месяца без исторических данных нашли эффективный сегмент и масштабировали его.","target"),
 ("Образование","месяц теста","Онлайн-школа дизайна · 2026","155%","ROMI","Школа дизайна: нашли новую аудиторию и вывели отдельную воронку на ROMI 155%","Как сначала проверили спрос на нерелевантной посадочной, а после подтверждения гипотезы запустили отдельное направление","target"),
 ("Финансы","4 месяца","Финтех-сервис · 2025","−62%","стоимость заявки","Снизили стоимость заявки в 2,6 раза и выдержали рост бюджета втрое","Клиент упёрся в потолок: при росте бюджета цена заявки поднималась быстрее объёма заявок. За четыре месяца перестроили экономику канала, и масштабирование открылось.","marketing"),
 ("E-commerce","12 месяцев","Интернет-магазин мебели · 2025","312%","рост органики за год","Вернули органику после апдейта и выросли выше прежнего","После обновления алгоритмов трафик просел на 54%. Нашли причину в дублях карточек и вернули позиции за пять месяцев.","seo"),
 ("Медицина","6 месяцев","Сеть медицинских клиник · 2024","4,8","рейтинг вместо 3,2","Подняли рейтинг с 3,2 до 4,8 и убрали негатив из топа","Брендовая выдача состояла из жалоб. За полгода изменили картину и настроили поток честных отзывов.","serm"),
 ("Образование","10 месяцев","Онлайн-школа · 2024","34%","продаж из канала","Собрали Telegram-канал на 42&nbsp;000 человек, который даёт треть продаж","Начали с нуля. Через десять месяцев канал стал основным источником заявок и снизил зависимость от платного трафика.","smm"),
 ("Логистика","3 месяца","Логистическая компания · 2025","2,2×","конверсия в заявку","Переписали сайт и подняли конверсию в заявку в 2,2 раза","Сайт сделали в 2016 году и с тех пор не трогали: на телефоне он не открывался, а заявки никто не считал.","web"),
 ("Услуги","5 месяцев","Сеть автосервисов · 2025","3,1×","рост звонков с карт","Собрали 14 точек в один реестр и утроили звонки с карт","Почти половина карточек в справочниках была заведена без компании: старые телефоны, закрытые адреса, дубли. Навели порядок и подключили приоритетное размещение.","maps"),
 ("Промышленность","6 месяцев","Производитель оборудования · 2025","−54%","стоимость заявки","Заменили выгоревший контекст статьями и снизили цену заявки вдвое","Спрос в поиске был выбран досуха: все, кто искал, уже приходили. Пошли к тем, кто ещё не искал, — через длинные тексты с оплатой за дочитывание.","promo"),
]
svcnames = {"ppc": "Контекстная реклама", "target": "Таргетированная реклама", "marketing": "Маркетинг", "seo": "SEO",
            "serm": "Управление репутацией", "smm": "SMM", "web": "Сайты и веб-сервисы", "maps": "Реклама на картах", "promo": "ПромоСтраницы"}

def card(c):
    return f'''      <article class="ccard" data-industry="{c[0]}" data-service="{c[7]}">
        <p class="ccard__ind"><i></i>{c[0]}</p><p class="ccard__dur">{c[1]}</p>
        <p class="ccard__client">{c[2]}</p>
        <p class="ccard__metric">{c[3]}</p>
        <p class="ccard__label">{c[4]}</p>
        <h3 class="ccard__title">{c[5]}</h3>
        <p class="ccard__desc">{c[6]}</p>
      </article>'''

def uniq(xs):
    out = []
    for x in xs:
        if x not in out: out.append(x)
    return out

ind_opts = "\n".join(f'          <option value="{i}">{i}</option>' for i in uniq(c[0] for c in cases))
svc_opts = "\n".join(f'          <option value="{s}">{svcnames[s]}</option>' for s in uniq(c[7] for c in cases))
R = "{{root}}"
request = '<!-- @include request {"title":"Разберём<br>вашу задачу<br>бесплатно<br>за <span class=\\"hl\\">30 минут</span>","lead":"Без презентаций и «пакетов услуг». Зададим<br>вопросы, посчитаем на месте и скажем,<br>за что стоит браться, а за что нет.","c-marketing":"checked"} -->'
cards = "\n".join(card(c) for c in cases)

page = f'''<!doctype html>
<html lang="ru">
<head>
<!-- @include head {{"title":"Кейсы — результаты клиентов TeamForBiz","description":"Кейсы с подтверждёнными результатами: ROMI 1 229%, конверсия в продажу 17%, CPA −55%. Задача, причина проблемы и цифры из рекламных кабинетов и аналитики."}} -->
</head>
<body>
<!-- @include header {{"active":"cases"}} -->
<main>

<section class="section">
  <div class="stage" style="height:760px">
    <img class="bgword" src="{R}assets/img/word-cases.svg" alt="" style="left:730px">
    <img class="stair" src="{R}assets/img/cases-stair-mixed.svg" alt="" style="left:1380px;top:80px">
    <img class="stair" src="{R}assets/img/stair-white.svg" alt="" style="left:-132px;top:556px">
    <h1 class="a" style="left:70px;top:82px;width:650px;font-size:66px;line-height:68px"><span class="red">Результаты наших клиентов</span><br>и как мы их достигли</h1>
    <p class="a lead20" style="left:70px;top:380px;width:610px;line-height:31px;color:#626773">В каждом кейсе есть задача, настоящая причина проблемы и цифры на выходе. Названия компаний скрыты по просьбе клиентов, а цифры взяты из рекламных кабинетов и систем аналитики.</p>
    <div class="cases-hero" aria-hidden="true">
      <img class="deco" src="{R}assets/img/cases-mascot.png" alt="" style="left:905px;top:275px;width:320px;height:302px" fetchpriority="high">
      <img class="deco" src="{R}assets/img/cases-chart.png" alt="" style="left:790px;top:360px;width:132px;height:132px">
      <div class="kpi" style="left:802px;top:143px;width:170px"><b>1&nbsp;229%</b><span>ROMI</span></div>
      <div class="kpi" style="left:990px;top:125px;width:145px"><b>17%</b><span>конверсия в продажу</span></div>
      <div class="kpi" style="left:1155px;top:177px;width:150px"><b>−55%</b><span>CPA</span></div>
      <i class="px" style="left:1236px;top:481px;background:#ff9a18"></i><i class="px" style="left:1266px;top:511px"></i><i class="px" style="left:1236px;top:541px"></i>
    </div>
  </div>
</section>

<section class="section" id="catalog">
  <div class="stage cases-cat" style="height:2510px">
    <img class="bgword" src="{R}assets/img/word-results.svg" alt="" style="left:354px;height:144px">
    <img class="stair" src="{R}assets/img/cases-stair-mixed.svg" alt="" style="left:1332px;top:24px">
    <img class="stair" src="{R}assets/img/stair-white.svg" alt="" style="left:1176px;top:2306px">
    <i class="bar" style="left:70px;top:92px;background:#ff5218"></i>
    <h2 class="a t48" style="left:70px;top:126px;width:820px">Кейсы с подтверждёнными результатами</h2>
    <div class="a cfilters" style="left:70px;top:250px;width:1300px">
      <label class="cselect"><span class="visually-hidden">Отрасль</span>
        <select class="js-cf" data-key="industry">
          <option value="">Отрасль</option>
{ind_opts}
        </select>
      </label>
      <label class="cselect"><span class="visually-hidden">Услуга</span>
        <select class="js-cf" data-key="service">
          <option value="">Услуга</option>
{svc_opts}
        </select>
      </label>
      <p class="cfilters__count js-cf-count">{len(cases)} кейсов</p>
    </div>
    <div class="a ccards js-ccards" style="left:70px;top:335px">
{cards}
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
open('src/pages/cases.html', 'w', encoding='utf-8').write(page)
print('ok')
