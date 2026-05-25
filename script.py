from pathlib import Path

md = """# Phlocalyst Bio CMS Edit Checklist

**Purpose:** Edit the bio page at `https://kimchichichi.github.io/phlocalyst-new/Bio.html` to ensure all claims about Phlocalyst are accurate and supported by verified sources.

**Verified sources used:**
- Nettwerk artist page: https://nettwerk.com/artist/phlocalyst/ [web:43]
- Nettwerk Insights release article: https://nettwerk.com/flemish-trumpet-savant-jazz-hop-producer-phlocalyst-shares-insights-ep/ [web:37][web:96]
- Stereofox Page Break review: https://www.stereofox.com/album-reviews/album-review-phlocalyst-page-break/ [web:38]
- York Calling Page Break review: https://yorkcalling.co.uk/2023/07/04/album-review-phlocalyst-page-break/ [web:2]
- Last.fm wiki: https://www.last.fm/music/Phlocalyst/+wiki [web:1]
- YouTube Page Break visualizer: https://www.youtube.com/watch?v=8vR17P9QxH0 [web:101]
- SoundCloud: https://soundcloud.com/phlocalyst [web:54]
- Instagram: https://www.instagram.com/phlocalyst/ [web:13]

---

## Editorial Actions

| # | Website sentence / claim | Action | Replacement text (if applicable) |
|---|---|---|---|
| 1 | Phlocalyst is from Munich. | **DELETE** | |
| 2 | Phlocalyst is a classical trumpet player. | **KEEP** | |
| 3 | Phlocalyst is also a lo-fi / jazz-hop producer. | **KEEP** | |
| 4 | He performs with a professional orchestra in Munich. | **KEEP** | |
| 5 | He was born in Munich. | **DELETE** | |
| 6 | He is Belgian. | **REPLACE** | Phlocalyst is a Flemish artist based in Germany. |
| 7 | He started trumpet at age five. | **KEEP** | |
| 8 | He began making music in 2017. | **KEEP** | |
| 9 | Pete Rock and J Dilla influenced him. | **KEEP** | |
| 10 | Insights is his debut LP. | **REPLACE** | Insights is his debut release with Nettwerk. |
| 11 | Insights was released on December 16, 2022. | **KEEP** | |
| 12 | Insights is an eight-track release. | **KEEP** | |
| 13 | Page Break is his second full-length release with Nettwerk. | **KEEP** | |
| 14 | Page Break was released on June 30, 2023. | **KEEP** | |
| 15 | His catalog has over 200 million streams. | **KEEP** | |
| 16 | He is only a hobbyist producer. | **DELETE** | |
| 17 | He is only a classical musician. | **DELETE** | |
| 18 | Phlocalyst is the project of Michiel De Vleeschhouwer. | **KEEP** | |
| 19 | He has a TikTok account. | **KEEP** | (Verify exact handle before publishing) |
| 20 | His official social links are Instagram, Spotify, Apple Music, Facebook, TikTok, and SoundCloud. | **REPLACE** | His official social links include Instagram, Spotify, and SoundCloud. |

---

## Replacement bio paragraph (safe version)

Copy this paragraph to replace the main bio section if the current one has multiple issues:

> Phlocalyst is the project of Michiel De Vleeschhouwer, a Flemish trumpet player and producer based in Munich whose music blends classical performance with lo-fi and jazz-hop beatmaking [web:43][web:37][web:54][web:101].

---

## Items to verify before publishing

Verify separately before adding to the site:

- Exact birthplace (delete if not sourced from Nettwerk or an interview).
- Whether \"debut LP\" or \"debut EP\" is the intended label for *Insights* (\"debut release with Nettwerk\" is safest).
- Any personal-history details beyond trumpet age, influences, and Munich-based work.
- Any claim about \"current hiatus,\" future collaborations, or stream counts unless the page cites a source [web:37][web:38].

---

## Approved social links

Use only these social links that are clearly visible on official pages:

- Instagram: https://www.instagram.com/phlocalyst/ [web:13]
- Spotify: https://open.spotify.com/artist/5xJ9q1lHwa8AShRof94oIt [web:19]
- SoundCloud: https://soundcloud.com/phlocalyst [web:54]
- Bandcamp: https://phlocalyst.bandcamp.com [web:44][web:41]

Do not publish TikTok, Facebook, or Apple Music links unless they are visible on his official pages or a label page [web:101][web:13].
"""

path = Path('output/phlocalyst_cms_edit_checklist.md')
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(md, encoding='utf-8')
print(path)