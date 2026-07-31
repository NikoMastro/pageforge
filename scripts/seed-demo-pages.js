/* Seed the four demo game pages through the backend API.
 * Steam screenshots/details are fetched live from the Steam store API.
 *
 * Usage:  node scripts/seed-demo-pages.js   (API_URL env overrides the target)
 *
 * (Origin: richer game pages — official trailer, real Steam screenshots, 4 detailed
 * feature rows, 6 FAQs, facts-enriched About. Saves as new versions via the API. */
const fs = require("fs");
const crypto = require("crypto");

const TEMPLATE = JSON.parse(fs.readFileSync(__dirname + "/seed-template.json", "utf8"));
const API = process.env.API_URL || "http://localhost:8080";
const CDN = (appid, img) => `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/${img}`;

const COPY = {
  hades: {
    appid: "1145360",
    theme: ["#2a0a10", "#0d0407"],
    trailerYt: "https://www.youtube.com/watch?v=Bz8l935Bv0Y",
    title: "Hades",
    tagline: "Defy the god of the dead.",
    about:
      "Hades is a god-like rogue-like dungeon crawler that combines the best aspects of Supergiant's critically acclaimed titles: the fast-paced action of Bastion, the rich atmosphere and depth of Transistor, and the character-driven storytelling of Pyre. Winner of over 50 Game of the Year awards.",
    features: [
      ["Battle out of hell", "As the immortal Prince of the Underworld, wield the powers and mythic weapons of Olympus to break free from the clutches of the god of the dead himself, growing stronger and unraveling more of the story with each unique escape attempt."],
      ["Unleash the fury of Olympus", "The Olympians have your back! Meet Zeus, Athena, Poseidon, and many more, and choose from their dozens of powerful Boons that enhance your abilities. There are thousands of viable character builds to discover as you go."],
      ["Befriend gods, ghosts, and monsters", "A fully-voiced cast of colorful, larger-than-life characters is waiting to get to know you. Grow your relationships with them through gifts and conversation, and experience thousands of unique story events as you delve deeper."],
      ["Nothing is wasted", "Permanent upgrades through the Mirror of Night, weapon Aspects that transform your arsenal, and the Pact of Punishment for players who want ever-greater heat — every run makes you stronger, whether you escape or fall."],
    ],
    faq: [
      ["What kind of game is Hades?", "A rogue-like dungeon crawler: every escape attempt from the Underworld is unique, and each defeat makes you stronger through permanent upgrades and story progression."],
      ["Do I need to know Greek mythology?", "Not at all — the game introduces its vivid cast of gods, ghosts, and monsters as you play."],
      ["Is there a story?", "Yes, a fully-voiced, character-driven story that advances whether you win or lose — defeat is part of the narrative."],
      ["How does progression work between runs?", "You collect Darkness, Keepsakes, and other resources on every attempt and spend them on permanent upgrades at the Mirror of Night, so no run is ever wasted."],
      ["Are there different weapons?", "Six Infernal Arms — sword, spear, shield, bow, fists, and rail — each with multiple Aspects that fundamentally change how they play."],
      ["I'm not great at action games. Can I still enjoy it?", "Yes — God Mode grants steadily increasing damage resistance every time you fall, letting you experience the full story at your own pace."],
    ],
  },
  "stardew-valley": {
    appid: "413150",
    theme: ["#14301c", "#081408"],
    trailerYt: "https://www.youtube.com/watch?v=ot7uXNQskhs",
    title: "Stardew Valley",
    tagline: "Build the farm of your dreams.",
    about:
      "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life. Can you learn to live off the land and turn these overgrown fields into a thriving home? One of the best-selling indie games of all time, created entirely by one developer.",
    features: [
      ["Turn fields into a home", "Raise animals, grow crops seasonally, start an orchard, craft useful machines, and design your farm your way — every choice shapes your corner of the valley."],
      ["Become part of the community", "Pelican Town is home to over 30 residents to befriend, seasonal festivals to join, and 12 marriage candidates — start a family and raise children on your farm."],
      ["Explore mysterious caves", "Descend into the mines to battle monsters, collect ore and geodes, and uncover what lurks in the deepest levels — then test yourself in the Skull Cavern."],
      ["There's more beneath the surface", "Master fishing across rivers, lakes and oceans; cook dishes from your harvest; brew artisan goods; restore the Community Center; donate to the museum; and sail to Ginger Island for a whole new adventure."],
    ],
    faq: [
      ["Is there an ending?", "You set your own goals — restore the Community Center, perfect your farm, conquer Skull Cavern, or simply live the quiet life."],
      ["Can I play with friends?", "Yes, up to 4 players can build a farm together in online co-op, sharing money and resources."],
      ["How big is the game?", "Hundreds of hours of content across farming, fishing, mining, combat, and relationships — plus regular free content updates."],
      ["Can I get married?", "There are 12 marriage candidates; your spouse moves in, helps around the farm, and you can raise children together."],
      ["Do the seasons change anything?", "Everything — each season has its own crops, fish, forage, and festivals, so the valley never plays the same twice."],
      ["Is there combat?", "Yes — the mines and Skull Cavern are full of monsters, with swords, rings, and food buffs to prepare you."],
    ],
  },
  "hollow-knight": {
    appid: "367520",
    theme: ["#101a2e", "#070c16"],
    trailerYt: "https://www.youtube.com/watch?v=UAO2urG23S4",
    title: "Hollow Knight",
    tagline: "Forge your own path in a vast, ruined kingdom.",
    about:
      "Hollow Knight is a classically styled 2D action adventure across a vast interconnected world. Explore twisting caverns, ancient cities and deadly wastes; battle tainted creatures and befriend bizarre bugs; and solve ancient mysteries at the kingdom's heart — all beneath the fading town of Dirtmouth.",
    features: [
      ["Explore Hallownest", "Descend into a sprawling underground kingdom of forgotten highways, overgrown wilds, fungal wastes and ruined cities — every path is yours to choose, and secrets hide behind every wall."],
      ["Evolve with new powers", "Gain spells, strength and speed. Leap to new heights on the wings of the Monarch. Blaze through caverns with the Crystal Heart, and slice through foes with a perfected nail."],
      ["Face 150 foes and 40 epic bosses", "Every enemy is hand-animated with its own patterns to learn. Equip Charms in countless combinations to build the knight that suits your style — aggressive, defensive, or something stranger."],
      ["A kingdom drawn by hand", "Traditional 2D animation, hand-painted backdrops, and Christopher Larkin's haunting orchestral score give Hallownest its unmistakable melancholy beauty — expanded by four free content packs."],
    ],
    faq: [
      ["How difficult is it?", "Challenging but fair — mastery of movement and combat is always rewarded, and every defeat teaches you something."],
      ["How long is the adventure?", "30+ hours for the main journey, with far more for completionists across the free content packs."],
      ["Is the world open?", "Hallownest is one interconnected map you unlock progressively as new abilities open previously unreachable paths."],
      ["What are Charms?", "Equippable trinkets that modify your abilities — attack speed, spell power, companions and more. Notch limits force meaningful build choices."],
      ["Are there multiple endings?", "Yes — your choices and discoveries in the deepest corners of Hallownest determine the kingdom's fate."],
      ["I'm lost. Is that normal?", "Perfectly — seek out Cornifer the cartographer in each region to chart your way, and remember: getting lost is half the adventure."],
    ],
  },
  celeste: {
    appid: "504230",
    theme: ["#251540", "#10081e"],
    trailerYt: "https://www.youtube.com/watch?v=FqBj2IGg6Uw",
    title: "Celeste",
    tagline: "Climb the mountain. Face yourself.",
    about:
      "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain, in this super-tight, hand-crafted platformer from the creators of multiplayer classic TowerFall. A love letter to precision platforming — and one of the most acclaimed indie games ever made.",
    features: [
      ["A narrative about climbing", "A touching story of anxiety, perseverance and self-discovery, starring a cast you won't forget — told through hundreds of hand-crafted challenges on the way to the summit."],
      ["Brutal but kind", "Instant respawns keep you in the flow, deaths are lessons rather than punishments, and Assist Mode tunes speed, stamina and more so every player can reach the top."],
      ["700+ screens of pure platforming", "Jump, air-dash, and climb through masterfully paced chapters where each screen is a puzzle with a dozen solutions — and B-Side and C-Side remixes await those who want the ultimate test."],
      ["A soundtrack that climbs with you", "Lena Raine's acclaimed score of synths and piano swells with Madeline's journey, while hidden strawberries, crystal hearts and cassette tapes reward the curious."],
    ],
    faq: [
      ["Is Celeste only for hardcore players?", "No — Assist Mode lets anyone adjust game speed, stamina, and dashes to experience the full story at their own pace."],
      ["What's a B-Side?", "A remixed, much harder version of each chapter, hidden behind a collectible cassette tape."],
      ["How many levels are there?", "Eight story chapters plus B/C-Sides and the free Farewell expansion — over 700 screens in total."],
      ["What are strawberries for?", "Pure bragging rights. They're optional, often devious to reach, and completely worth it."],
      ["How does the story handle its themes?", "Madeline's climb is an honest, warm-hearted portrayal of anxiety and self-doubt — the mountain is both literal and not."],
      ["Who made Celeste?", "Maddy Makes Games (now Extremely OK Games), the team behind TowerFall, with music by Lena Raine."],
    ],
  },
};

async function fetchSteamData(appid) {
  const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}`);
  const d = (await res.json())[appid].data;
  const https = (u) => (u || "").replace(/^http:/, "https:");
  return {
    screenshots: (d.screenshots || []).map((s) => https(s.path_full)),
    trailer: https(d.movies?.[0]?.mp4?.max || d.movies?.[0]?.mp4?.["480"] || ""),
    developers: (d.developers || []).join(", "),
    release: d.release_date?.date || "",
    genres: (d.genres || []).map((g) => g.description).join(", "),
  };
}

function stableStringify(value) {
  const sortObj = (v) => {
    if (Array.isArray(v)) return v.map(sortObj);
    if (v && typeof v === "object") {
      return Object.keys(v).sort().reduce((acc, k) => { acc[k] = sortObj(v[k]); return acc; }, {});
    }
    return v;
  };
  return JSON.stringify(sortObj(value));
}

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clone = (o) => JSON.parse(JSON.stringify(o));
const FONT = "Inter, sans-serif";
const DARK = "#0b0f19";

async function buildPage(page, game) {
  const steam = await fetchSteamData(game.appid);
  const shots = steam.screenshots;
  const lp = clone(TEMPLATE.landingPageData);
  const get = (t) => lp.sections.find((s) => s.type === t);

  lp.metadata = {
    title: game.title,
    description: game.tagline,
    preset: "full-content",
    group: "games",
    layoutMode: "phone",
  };

  const bg = get("background");
  bg.props.src = CDN(game.appid, "library_hero.jpg");
  bg.props.phoneSrc = CDN(game.appid, "library_600x900.jpg");
  bg.props.alt = `${game.title} key art`;

  const hero = get("hero");
  hero.props.heading = game.title;
  hero.props.subheading = game.tagline;
  hero.props.headingClassName = "font-bold mb-4 text-4xl md:text-5xl text-white";
  hero.props.subheadingClassName = "mb-8 text-xl md:text-2xl text-gray-200";
  hero.props.headingStyle = { color: "#ffffff", fontFamily: FONT, fontWeight: "700", textShadow: "0 2px 12px rgba(0,0,0,0.6)" };
  hero.props.subheadingStyle = { color: "#e5e7eb", fontFamily: FONT, fontWeight: "400", textShadow: "0 1px 8px rgba(0,0,0,0.6)" };

  const widget = {
    type: "widget",
    props: {
      gameId: game.appid, width: 646, height: 190, enabled: true, type: "full",
      scale: 1, alignX: "center", alignY: "middle", positionX: 0, positionY: 0,
      shadowIntensity: 0.25,
      utm: { source: "pageforge", campaign: page, medium: "landing", content: "", term: "" },
      display: true,
    },
  };

  const [t1, t2] = game.theme;
  const titleTxt = {
    type: "titleTxt",
    props: {
      title: `About ${game.title}`,
      subtext: `${game.about}  Developed by ${steam.developers} · Released ${steam.release} · ${steam.genres}.`,
      // Steam's own store-page background art — made to sit behind text
      background: { type: "image", image: { url: CDN(game.appid, "page_bg_generated_v6b.jpg"), fit: "cover", position: "center" } },
      backgroundColor: t2, titleColor: "#ffffff", subtextColor: "#c7cdd6",
      titleFontSize: "40px", subtextFontSize: "20px",
      fontFamily: FONT, fontWeight: "400", display: true,
    },
  };

  const videoPlayer = game.trailerYt
    ? {
      type: "videoPlayer",
      props: {
        background: { type: "gradient", gradient: { type: "linear", direction: "180deg", colors: [t2, t1] } },
        videoSource: { type: "url", url: game.trailerYt },
        videoWidth: "100%", videoHeight: "auto", aspectRatio: "16/9",
        autoPlay: false, loop: false, muted: true, controls: true, playsInline: true,
        poster: shots[0] || CDN(game.appid, "header.jpg"),
        fontFamily: FONT, fontWeight: "400",
        display: true,
        button: { display: false },
      },
    }
    : null;

  const carousel = {
    type: "carousel",
    props: {
      images: shots.slice(0, 6).map((url, i) => ({ path: url, alt: `${game.title} screenshot ${i + 1}` })),
      orientation: "horizontal",
      autoScrollInterval: 4000,
      height: 460, width: null, imageHeight: 400, imageWidth: null,
      showControls: true, showDots: true,
      fontFamily: FONT, fontWeight: "400",
      display: true,
      background: { type: "gradient", gradient: { type: "linear", direction: "180deg", colors: [t1, t2] } },
      button: { display: false },
    },
  };

  const columnTxt = {
    type: "columnTxt",
    props: {
      rows: game.features.map(([title, text], i) => ({
        id: `row-${i + 1}`,
        title,
        text,
        imageUrl: shots[i + 6] || shots[i] || CDN(game.appid, "header.jpg"),
        imageAlt: `${game.title} — ${title}`,
        layout: i % 2 === 0 ? "text-left" : "text-right",
      })),
      background: { type: "gradient", gradient: { type: "linear", direction: "135deg", colors: [t1, t2] } },
      backgroundColor: t2, textColor: "#e5e7eb", fontSize: "16px",
      fontFamily: FONT, fontWeight: "400",
      imageWidth: "50%", imageHeight: "auto", gap: 32, padding: "40px 20px",
      display: true,
    },
  };

  const mediaShowcase = {
    type: "mediaShowcase",
    props: {
      items: [
        { id: "m1", url: CDN(game.appid, "library_hero.jpg"), type: "image", alt: `${game.title} hero art`, startRow: 1, startCol: 1, rowSpan: 1, columnSpan: 2 },
        { id: "m2", url: shots[1] || CDN(game.appid, "header.jpg"), type: "image", alt: `${game.title} screenshot`, startRow: 1, startCol: 3, rowSpan: 1, columnSpan: 1 },
        { id: "m3", url: shots[2] || CDN(game.appid, "header.jpg"), type: "image", alt: `${game.title} screenshot`, startRow: 2, startCol: 1, rowSpan: 1, columnSpan: 1 },
        { id: "m4", url: CDN(game.appid, "capsule_616x353.jpg"), type: "image", alt: `${game.title} capsule art`, startRow: 2, startCol: 2, rowSpan: 1, columnSpan: 1 },
        { id: "m5", url: shots[3] || CDN(game.appid, "header.jpg"), type: "image", alt: `${game.title} screenshot`, startRow: 2, startCol: 3, rowSpan: 1, columnSpan: 1 },
      ],
      title: "Screenshots & Art",
      // Blurred hero art as a soft image backdrop for the grid
      background: { type: "image", image: { url: CDN(game.appid, "library_hero_blur.jpg"), fit: "cover", position: "center" } },
      rows: 2, columns: 3, gap: 10,
      backgroundColor: t2, padding: "40px 20px", cellHeight: "240px",
      fontFamily: FONT, fontWeight: "400", display: true,
    },
  };

  const faq = {
    type: "faq",
    props: {
      items: game.faq.map(([question, answer], i) => ({ id: `q${i + 1}`, question, answer })),
      title: "Frequently Asked Questions",
      background: { type: "gradient", gradient: { type: "radial", direction: "circle at 50% 0%", colors: [t1, t2] } },
      backgroundColor: t2, textColor: "#ffffff",
      questionFontSize: "18px", answerFontSize: "16px",
      fontFamily: FONT, fontWeight: "400",
      padding: "60px 20px", maxWidth: "1000px",
      separatorColor: "#1f2937", iconColor: "#9ca3af",
      display: true,
    },
  };

  const footer = get("footer");
  const cookies = get("cookiesBanner");
  const navbar = get("navbar");
  lp.sections = [bg, navbar, hero, widget, titleTxt, videoPlayer, carousel, columnTxt, mediaShowcase, faq, footer, cookies].filter(Boolean);

  const htmlConfig = {
    title: game.title, faviconLink: "/favicon.ico", tagline: game.tagline,
    usePixelScript: false, pixelMode: "none", gameId: "", partnerId: "", isTest: true,
  };
  const generatedHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>${escapeHtml(game.title)}</title></head><body><div id="app-root" data-lp='${JSON.stringify({ landingPageData: lp }).replace(/'/g, "&#39;")}'></div></body></html>`;
  return { landingPageData: lp, htmlConfig, generatedHtml };
}

async function main() {
  for (const [page, game] of Object.entries(COPY)) {
    const { landingPageData, htmlConfig, generatedHtml } = await buildPage(page, game);
    const lp_json = JSON.stringify({ landingPageData, htmlConfig, generatedHtml });
    const hashid = crypto.createHash("sha256")
      .update(stableStringify({ page_name: page, landingPageData, htmlConfig, generatedHtml }))
      .digest("hex");
    const metadata = {
      user: "demo@example.com",
      type: "update",
      commit: `feat: expand ${game.title} page — trailer, screenshots, features, FAQ`,
      timestamp: new Date().toISOString(),
      page_name: page,
      lp_json, hashid,
    };
    const res = await fetch(`${API}/lp/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metadata }),
    });
    console.log(`${page}: ${res.status}`, JSON.stringify(await res.json()));
  }
  const list = await fetch(`${API}/lp/all`);
  console.log("list:", JSON.stringify(await list.json()));
}

main().catch((e) => { console.error(e); process.exit(1); });
