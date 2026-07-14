# Genera las páginas de país de Orígenes Coffee desde una plantilla común.
import html as H

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{desc}">
  <title>{title} — Orígenes Coffee</title>
  <meta name="theme-color" content="#faf7f1">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Orígenes Coffee">
  <meta property="og:title" content="{title} — Orígenes Coffee">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="{site}/assets/og/{slug}.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="{site}/{slug}">
  <script type="application/ld+json">{{"@context": "https://schema.org", "@type": "Article", "headline": "{title}", "description": "{desc}", "image": "{site}/assets/og/{slug}.jpg", "inLanguage": "en", "publisher": {{"@type": "Organization", "name": "Orígenes Coffee"}}, "mainEntityOfPage": "{site}/{slug}"}}</script>
  <link rel="preload" as="image" href="assets/img/{hero}.{hero_ext}" imagesrcset="assets/img/{hero}-sm.{hero_ext} 960w, assets/img/{hero}.{hero_ext} 1920w" imagesizes="100vw">
  <link rel="preload" as="font" type="font/woff2" href="assets/fonts/fraunces-normal-300.woff2" crossorigin>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
</head>
<body class="tema-{slug}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="topbar over-image" id="topbar">
    <div class="container topbar-inner">
      <a href="index.html" class="wordmark">Orígenes <em>Coffee</em></a>
      <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <ul class="topnav" id="topnav">
        <li><a href="index.html#atlas">The Atlas</a></li>
        <li><a href="#unete">Join la lista</a></li>
      </ul>
    </div>
  </header>

  <div class="progress" aria-hidden="true"><span id="progressBar"></span></div>

  <main id="main">
    <div class="feature-hero" id="featureHero">
      <img src="assets/img/{hero}.{hero_ext}"
           srcset="assets/img/{hero}-sm.{hero_ext} 960w, assets/img/{hero}.{hero_ext} 1920w"
           sizes="100vw" fetchpriority="high" alt="{hero_alt}">
      <div class="feature-shade"></div>
      <div class="feature-title container">
        <span class="label label-onimage">Origins · Vol. I — Nº {num}</span>
        <h1 class="stagger"><span class="line"><span>{name}</span></span></h1>
      </div>
    </div>

    <header class="feature-head">
      <div class="container">
        <p class="feature-deck">{deck}</p>
      </div>
    </header>

    <article class="article">
      <div class="narrow">
        {p_open}
        <h2 class="crosshead">{cross1}</h2>
        {p_mid}
      </div>

      <aside class="pullquote container">
        <p>{quote}</p>
        <footer>{quote_footer}</footer>
      </aside>

      <figure class="interlude">
        <img src="assets/img/{photo1}.{photo1_ext}" srcset="assets/img/{photo1}-sm.{photo1_ext} 800w, assets/img/{photo1}.{photo1_ext} 1200w" sizes="(max-width: 780px) 100vw, 1160px" alt="{photo1_alt}" loading="lazy">
        <figcaption>{photo1_cap}</figcaption>
      </figure>

      <div class="narrow">
        <h2 class="crosshead">{cross2}</h2>
        {p_cup}

        <dl class="facts">
          {facts}
        </dl>
      </div>

      <figure class="interlude tall">
        <img src="assets/img/{photo2}.{photo2_ext}" srcset="assets/img/{photo2}-sm.{photo2_ext} 800w, assets/img/{photo2}.{photo2_ext} 1200w" sizes="(max-width: 780px) 100vw, 680px" alt="{photo2_alt}" loading="lazy">
        <figcaption>{photo2_cap}</figcaption>
      </figure>
    </article>

    <nav class="country-next">
      <div class="container country-next-grid">
        <a href="{prev_slug}.html">
          <span class="label label-ink">← Previous origin</span>
          <h3>{prev_name}</h3>
        </a>
        <a href="{next_slug}.html" class="next">
          <span class="label label-ink">Next origin →</span>
          <h3>{next_name}</h3>
        </a>
      </div>
    </nav>

    <section class="lead-block" id="unete">
      <div class="container">
        <span class="label">Join la lista</span>
        <h2>Taste {name} the way your family remembers it.</h2>
        <p>
          We're launching soon. Leave your email to reserve the first
          roast of <em>Orígenes {name}</em> — and get every story before
          anyone else.
        </p>
        <form class="lead-form" id="leadForm" aria-live="polite" data-origen="{slug}">
          <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">
          <input type="email" name="email" placeholder="you@email.com" required aria-label="Email address" autocomplete="email" inputmode="email">
          <button type="submit">I want in</button>
        </form>
        <p class="lead-note">No spam. Solo café, historias reales y fotografía real — <em>nada de IA</em>.</p>
      </div>
    </section>
  </main>

  <a class="sticky-cta" id="stickyCta" href="#unete">Join la lista ↓</a>

  <footer class="footer">
    <div class="container footer-grid">
      <span>Orígenes Coffee — coffee with memory</span>
      <span>© <span id="year"></span> · Real photography via <a href="https://unsplash.com/license" target="_blank" rel="noopener">Unsplash</a> · No AI imagery, ever</span>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
"""

SITE = "https://origenes-coffee.vercel.app"  # actualizar si cambia el dominio

def fact(dt, dd):
    return f"<div><dt>{dt}</dt><dd>{dd}</dd></div>"

PAISES = [
    {
        "slug": "colombia", "num": "01", "name": "Colombia",
        "title": "Colombia — La tierra del tinto",
        "desc": "The history of coffee in Colombia: a priest's penance, the paisa mountains, and el tinto — the small cup that built a nation.",
        "hero": "colombia-hero",
        "hero_alt": "Colorful colonial street in Cartagena, Colombia",
        "deck": "A penance became an identity: how a small black cup came to carry an entire country.",
        "p_open": """
        <p>Legend has it that in the 1730s, in the town of Salazar de las
        Palmas, a priest named Francisco Romero listened to his
        parishioners' confessions and handed out an unusual penance: for
        every sin, plant coffee. Whether or not the story is true in every
        detail, Colombians have chosen to believe it — because it says
        something essential. In Colombia, coffee was never just a crop.
        It was an act of faith.</p>
        <p>The earliest reliable records place coffee in the east of the
        country, in the Santanderes, in the eighteenth century. But its
        great century was the nineteenth, when it crossed the country
        westward with the paisa settlers — families who cleared steep
        mountainsides in Antioquia and what is now the Eje Cafetero,
        planting coffee on slopes so steep that machines are useless
        there to this day. Every bean, then and now, is picked by hand.</p>
        """,
        "cross1": "The mule and the mountain",
        "p_mid": """
        <p>Colombian coffee traveled by mule down the cordilleras, then by
        river to the sea. By the twentieth century it had become the
        country's signature: the Federación Nacional de Cafeteros was
        founded in 1927 to defend the small growers — more than half a
        million families — and in 1958 a fictional cafetero named Juan
        Valdez, with his mule Conchita, taught the world to ask for
        <em>100% Colombian</em>.</p>
        <p>In 2011, UNESCO declared Colombia's Coffee Cultural Landscape a
        World Heritage Site — not for the coffee alone, but for the way
        of life built around it.</p>
        """,
        "quote": "In Colombia you are not asked if you want coffee. You are asked: ¿le provoca un tintico?",
        "quote_footer": "The daily language of el tinto",
        "photo1": "cerezas-rojas",
        "photo1_alt": "Ripe red coffee cherries on the branch",
        "photo1_cap": "Coffee cherries ripen unevenly on the mountain — the reason every Colombian bean is picked by hand.",
        "cross2": "La taza — El tinto",
        "p_cup": """
        <p>El tinto is Colombia's daily ritual: a small cup of black
        coffee, usually sweetened, poured from a thermos on a street
        corner, offered in every office, every bus terminal, every home.
        It is less a drink than a greeting. Refusing one is almost a
        social event.</p>
        <p>For those who grew up in the diaspora, el tinto is the
        after-lunch cup at your grandmother's table — the one that came
        with conversation you were finally old enough to join.</p>
        """,
        "facts": (
            fact("First plantings", "~1730s, los Santanderes") +
            fact("Regions", "Eje Cafetero, Huila, Nariño, Santander") +
            fact("The cup", "El tinto — small, black, ever-offered") +
            fact("Word to know", "«Tintico» — the affectionate diminutive")
        ),
        "photo2": "cafe-taza-vapor",
        "photo2_alt": "Steaming cup of black coffee surrounded by beans",
        "photo2_cap": "El tinto: the smallest cup with the longest conversations.",
        "prev_slug": "brasil", "prev_name": "Brasil",
        "next_slug": "mexico", "next_name": "México",
    },
    {
        "slug": "mexico", "num": "02", "name": "México",
        "title": "México — De contrabando y revolución",
        "desc": "The history of coffee in México: Veracruz, seeds smuggled into Chiapas, and café de olla — the clay-pot coffee of the Revolution.",
        "hero": "mexico-hero",
        "hero_alt": "Colorful hillside city of Guanajuato, México",
        "deck": "Seeds across a border, a clay pot on the fire: in México, coffee is a story of movement.",
        "p_open": """
        <p>Coffee entered México by sea, in the late years of the
        eighteenth century, landing near the port of Veracruz. The hills
        around Córdoba gave it a first home, and for decades that was the
        country's coffee heartland — humid, green, Atlantic.</p>
        <p>But the chapter Mexicans love to tell happened a century later,
        in the south. The story goes that coffee crossed into Chiapas from
        Guatemala — seeds carried quietly over the border, contraband of
        the most fragrant kind. What the smugglers could not have known is
        what the land would do with it: the volcanic soils of the
        Soconusco, rich in minerals, raised a coffee that would become
        legendary.</p>
        """,
        "cross1": "La revolución en una olla de barro",
        "p_mid": """
        <p>Then came the Revolution — and with it, café de olla. Brewed in
        a clay pot with canela and piloncillo, it is remembered as the
        coffee of las adelitas, the women who marched with the armies and
        kept them fed, warm and fighting. The clay gives it a taste no
        machine can copy; Mexicans call it simply <em>sabor de barro</em>,
        the flavor of the pot itself.</p>
        <p>Today México's coffee grows mostly in the south — Chiapas,
        Veracruz, Oaxaca — much of it in the hands of smallholder and
        indigenous communities, under the shade of taller trees, the old
        way.</p>
        """,
        "quote": "Coffee in México tastes like cinnamon, like piloncillo, like the pot it was made in.",
        "quote_footer": "El sabor de barro",
        "photo1": "historia-papel-picado",
        "photo1_alt": "Colorful papel picado banners against the sky",
        "photo1_cap": "Papel picado over the plaza — coffee in México is inseparable from celebration.",
        "cross2": "La taza — Café de olla",
        "p_cup": """
        <p>Café de olla is still made the same way: the clay pot, the
        cinnamon stick, the dark cone of piloncillo dissolving slowly. It
        arrives with pan dulce, and it stretches the meal into sobremesa —
        that untranslatable hour when the food is finished but nobody
        leaves the table.</p>
        <p>If your family is Mexican, you may not know the history. But
        you know the smell. That was the point of it all along.</p>
        """,
        "facts": (
            fact("Arrived", "~1780s–90s, by way of Veracruz") +
            fact("Regions", "Chiapas, Veracruz, Oaxaca") +
            fact("The cup", "Café de olla — clay pot, canela, piloncillo") +
            fact("Word to know", "«Sobremesa» — the hour after the meal")
        ),
        "photo2": "historia-zocalo",
        "photo2_alt": "The cathedral and flag at the Zócalo, Mexico City",
        "photo2_cap": "El Zócalo, Ciudad de México — every plaza in the country has its coffee.",
        "prev_slug": "colombia", "prev_name": "Colombia",
        "next_slug": "venezuela", "next_name": "Venezuela",
    },
    {
        "slug": "venezuela", "num": "03", "name": "Venezuela",
        "title": "Venezuela — El país del marrón y el guayoyo",
        "desc": "The history of coffee in Venezuela: the Orinoco missions, the Andean boom that rivaled Brazil, and the language of negrito, marrón and guayoyo.",
        "hero": "venezuela-hero",
        "hero_alt": "Angel Falls dropping from the tepui, Canaima National Park, Venezuela",
        "deck": "Before oil, Venezuela ran on coffee — and in its kitchens, it still does.",
        "p_open": """
        <p>Some of the earliest written records of coffee in South America
        come from Venezuela: the Jesuit priest José Gumilla, writing of
        the Orinoco missions in the 1730s, described coffee growing in
        that impossible green country of rivers and tepuis. From those
        mission gardens, coffee found its way west — and up.</p>
        <p>It was in the Andes — Táchira, Mérida, Trujillo — that Venezuela
        became a coffee power. Through the nineteenth century its harvests
        grew until the country stood among the world's great exporters,
        for a time second only to Brazil. Whole towns in the mountains
        lived by the harvest; the haciendas' stone patios, where coffee
        dried in the sun, are still there.</p>
        """,
        "cross1": "El gran café",
        "p_mid": """
        <p>In Caracas, coffee built a café culture of marble tables and
        long afternoons — el Gran Café tradition. Then, in the 1920s, oil
        arrived and eclipsed everything. Coffee stepped out of the export
        charts and back into the kitchen, where it had always ruled
        anyway.</p>
        <p>Because whatever the economy did, Venezuelans never stopped
        drinking coffee — and never stopped naming it with a precision no
        other country matches.</p>
        """,
        "quote": "Ask for a coffee in Venezuela and you'll be asked back: ¿negrito, marrón o con leche?",
        "quote_footer": "A whole language in one cup",
        "photo1": "tostadora-vintage",
        "photo1_alt": "Coffee beans pouring into an old roasting drum",
        "photo1_cap": "The roast — in Venezuelan homes, beans were often roasted and ground the same morning.",
        "cross2": "La taza — El guayoyo",
        "p_cup": """
        <p>Guayoyo: black coffee brewed light, often through a cloth
        filter, gentle enough to drink all day. Negrito: small and strong.
        Marrón: coffee with a little milk — claro or oscuro, depending on
        your soul. Con leche: milk with a serious amount of coffee in it.
        Ordering is a dialogue, and everyone has their word.</p>
        <p>For millions of Venezuelans now living abroad, the sound of the
        greca on the stove and the first guayoyo after the arepas is not
        breakfast. It is home.</p>
        """,
        "facts": (
            fact("First records", "~1730s, misiones del Orinoco") +
            fact("Regions", "Táchira, Mérida, Trujillo, Lara") +
            fact("The cup", "El guayoyo — light, all-day black coffee") +
            fact("Words to know", "«Negrito, marrón, guayoyo»")
        ),
        "photo2": "historia-amigos",
        "photo2_alt": "Three hands toasting with cups of coffee",
        "photo2_cap": "El cafecito is never drunk alone if it can be helped.",
        "prev_slug": "mexico", "prev_name": "México",
        "next_slug": "guatemala", "next_name": "Guatemala",
    },
    {
        "slug": "guatemala", "num": "04", "name": "Guatemala",
        "title": "Guatemala — Tierra de volcanes",
        "desc": "The history of coffee in Guatemala: the collapse of the dye trade, volcanic soils from Antigua to Atitlán, and coffee with tortillas at dawn.",
        "hero": "guatemala-hero",
        "hero_alt": "Lake Atitlán and its volcanoes, Guatemala",
        "deck": "When the dye trade collapsed, a country replanted itself in coffee — on the slopes of living volcanoes.",
        "p_open": """
        <p>Guatemala's coffee story begins with a catastrophe that had
        nothing to do with coffee. For generations the country had lived
        from dyes — indigo and cochineal, the deep red harvested from
        insects on the nopal. Then, in the mid-1800s, European chemists
        invented synthetic dyes, and that entire economy collapsed within
        a few years.</p>
        <p>Guatemala replanted itself in coffee. By the 1880s coffee made
        up the overwhelming majority of the country's exports, and it has
        shaped the highlands ever since — the terraces, the towns, the
        rhythm of the year bending around the harvest.</p>
        """,
        "cross1": "Ocho tierras, un grano",
        "p_mid": """
        <p>What makes Guatemalan coffee extraordinary is the land itself.
        Antigua's valley sits between three volcanoes — Agua, Acatenango,
        and Fuego, which still breathes ash over the fields, renewing the
        mineral soil. Around Lake Atitlán, coffee grows on the skirts of
        volcanoes above the water. In Huehuetenango, it climbs to some of
        the highest altitudes in Central America, ripening slowly in the
        thin air.</p>
        <p>The country counts eight growing regions, each with its own
        character — and behind an enormous share of the harvest are Maya
        smallholder families, picking by hand on slopes where nothing
        with wheels can follow.</p>
        """,
        "quote": "In Antigua, coffee ripens between three volcanoes — one of them still breathing fire.",
        "quote_footer": "Agua, Acatenango y Fuego",
        "photo1": "cerezas-rama",
        "photo1_alt": "Coffee cherries in shades of green, orange and red on the branch",
        "photo1_cap": "The cherries turn from green to red at their own pace — pickers pass the same tree several times each harvest.",
        "cross2": "La taza",
        "p_cup": """
        <p>In a Guatemalan kitchen, coffee is the smell of dawn — poured
        thin and sweet, next to fresh tortillas coming off the comal. It
        is the café con leche children are finally allowed to taste, the
        pot that never empties at a celebration, the cup that keeps a
        velorio company through the night.</p>
        <p>Far from home, that first cup of the morning is the fastest way
        back.</p>
        """,
        "facts": (
            fact("The boom", "1850s–60s, after the dye collapse") +
            fact("Regions", "Antigua, Atitlán, Huehuetenango, Cobán — 8 in all") +
            fact("The cup", "Morning coffee with fresh tortillas") +
            fact("Landmark", "Volcán de Fuego, still active over the fields")
        ),
        "photo2": "origen-costal",
        "photo2_alt": "Burlap sack full of roasted coffee beans",
        "photo2_cap": "El costal — the harvest, gathered.",
        "prev_slug": "venezuela", "prev_name": "Venezuela",
        "next_slug": "brasil", "next_name": "Brasil",
    },
    {
        "slug": "brasil", "num": "05", "name": "Brasil",
        "title": "Brasil — O gigante do cafezinho",
        "desc": "The history of coffee in Brazil: seedlings hidden in a bouquet, the fazenda empire, and o cafezinho — the tiny cup a whole country runs on.",
        "hero": "brasil-hero",
        "hero_alt": "Green valley of coffee farms among mountains, Brasil",
        "deck": "It began with a bouquet of flowers — and became the largest coffee nation on Earth.",
        "p_open": """
        <p>In 1727, a Portuguese-Brazilian officer named Francisco de Melo
        Palheta was sent to French Guiana to settle a border dispute. The
        French guarded their coffee plants jealously — export of seeds was
        forbidden. But the story Brazilians tell is that the governor's
        wife took a liking to Palheta, and when he left, she handed him a
        farewell bouquet. Hidden inside the flowers: coffee seedlings.</p>
        <p>He planted them in Pará, in the Amazonian north. It took a
        century for coffee to find its true home further south — the
        valley of the Paraíba, then the famous terra roxa, the purple-red
        earth of São Paulo — but by the 1840s Brasil was the largest
        coffee producer in the world. It has never given up the title.</p>
        """,
        "cross1": "O império do café",
        "p_mid": """
        <p>Coffee built modern Brazil in a very literal way: the railroads
        were laid to move it, the port of Santos grew to ship it, and for
        decades national politics was nicknamed <em>café com leite</em> —
        coffee and milk — after the two states, São Paulo and Minas
        Gerais, that traded the presidency between them.</p>
        <p>It also changed who Brazil is. Waves of immigrants — Italians,
        Japanese, and many others — arrived to work the fazendas, and
        stayed to remake the country's food, cities and surnames.</p>
        """,
        "quote": "Vem tomar um cafezinho — the smallest cup with the biggest history.",
        "quote_footer": "An invitation, not a beverage",
        "photo1": "brasil-cafetal",
        "photo1_alt": "Coffee trees and native forest in São Sebastião da Grama, São Paulo, Brasil",
        "photo1_cap": "Coffee country in São Sebastião da Grama, São Paulo — fotografía real de un cafetal brasileño.",
        "cross2": "A xícara — O cafezinho",
        "p_cup": """
        <p>O cafezinho is Brazil's universal gesture: a tiny cup, very
        hot, usually very sweet, offered before you have said why you
        came. In homes, in shops, in offices, at the mechanic's — refusing
        it is technically legal, but socially inadvisable.</p>
        <p>And if your family is Brazilian, you know it is not about the
        coffee at all. It is about sitting down. A vovó knew that better
        than anyone.</p>
        """,
        "facts": (
            fact("Arrived", "1727, Pará — hidden in a bouquet") +
            fact("Regions", "Minas Gerais, Mogiana, Cerrado, Espírito Santo") +
            fact("The cup", "O cafezinho — tiny, hot, ever-offered") +
            fact("Word to know", "«Saudade» — the longing a cafezinho cures")
        ),
        "photo2": "proceso-granos",
        "photo2_alt": "Close-up of roasted coffee beans",
        "photo2_cap": "The harvest that never stopped: Brasil has led the world since the 1840s.",
        "prev_slug": "guatemala", "prev_name": "Guatemala",
        "next_slug": "colombia", "next_name": "Colombia",
    },
]

import pathlib
out = pathlib.Path(__file__).resolve().parent
JPG_ONLY = {"venezuela-hero", "historia-zocalo"}  # AVIF salía más pesado

def ext(name):
    return "jpg" if name in JPG_ONLY else "avif"

for p in PAISES:
    p = dict(p, hero_ext=ext(p["hero"]), photo1_ext=ext(p["photo1"]), photo2_ext=ext(p["photo2"]))
    page = TEMPLATE.format(site=SITE, **p)
    (out / f"{p['slug']}.html").write_text(page)
    print(f"{p['slug']}.html", len(page), "bytes")
