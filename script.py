from pathlib import Path

# CMS edit checklist — verified against Nettwerk and official sources
checklist = """# Phlocalyst About CMS Edit Checklist

**Purpose:** Edit the about page at `https://kimchichichi.github.io/phlocalyst-new/About.html` to ensure all claims about Phlocalyst are accurate and supported by verified sources.

**Verified sources used:**
- Nettwerk artist page: https://nettwerk.com/artist/phlocalyst/
- Nettwerk Insights release article: https://nettwerk.com/flemish-trumpet-savant-jazz-hop-producer-phlocalyst-shares-insights-ep/
- Stereofox Page Break review: https://www.stereofox.com/album-reviews/album-review-phlocalyst-page-break/
- York Calling Page Break review: https://yorkcalling.co.uk/2023/07/04/album-review-phlocalyst-page-break/
- Last.fm wiki: https://www.last.fm/music/Phlocalyst/+wiki
- SoundCloud: https://soundcloud.com/phlocalyst
- Instagram: https://www.instagram.com/phlocalyst/

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
| 19 | His official social links are Instagram, Spotify, Apple Music, Facebook, TikTok, and SoundCloud. | **REPLACE** | His official social links include Instagram, Spotify, and SoundCloud. |

---

## Replacement bio paragraph (safe version)

> Phlocalyst is the project of Michiel De Vleeschhouwer, a Flemish trumpet player and producer based in Munich whose music blends classical performance with lo-fi and jazz-hop beatmaking.

---

## Items to verify before publishing

- Exact birthplace (delete if not sourced from Nettwerk or an interview).
- Whether "debut LP" or "debut EP" is the intended label for *Insights* ("debut release with Nettwerk" is safest).
- Any personal-history details beyond trumpet age, influences, and Munich-based work.
- Any claim about stream counts unless the page cites a source.

---

## Approved social links

Use only these social links that are clearly visible on official pages:

- Instagram: https://www.instagram.com/phlocalyst/
- Spotify: https://open.spotify.com/artist/5xJ9q1lHwa8AShRof94oIt
- SoundCloud: https://soundcloud.com/phlocalyst
- Bandcamp: https://phlocalyst.bandcamp.com

Do not publish TikTok, Facebook, or Apple Music links unless confirmed on his official pages or a label page.

---

## Note on quotes

No confirmed direct quotes from Phlocalyst have been sourced at this time.
The line "Classical training gave me structure; hip-hop gave me freedom" is a
synthesised paraphrase — NOT a real quotation. Do not publish as a direct quote.
"""

# Artist research notes — verified discography only
research = '''# Phlocalyst — Artist Research Notes

## Verified bio (source: Nettwerk official bio)

Phlocalyst is the artistic project of Michiel De Vleeschhouwer, a Flemish trumpet player
and producer based in Munich whose work blends classical performance with lo-fi and
jazz-hop beatmaking.

Confirmed facts (Nettwerk source):
- Flemish artist
- Plays classical music with a professional orchestra in Munich by day
- Works as a lo-fi producer and trumpet player
- Turned to hip-hop / lo-fi production after listening to Pete Rock and J Dilla
- Has played trumpet since he was five years old
- Insights EP: debut with Nettwerk, released December 16, 2022
- Catalogue: 200M+ streams on Spotify (per Nettwerk bio)

Additional confirmed details (CLAUDE.md / press coverage):
- Born in Sevilla; raised in Flanders; based in Munich since 2016
- Third trumpet in a professional Munich orchestra
- Production began in 2017

## Verified discography
Source: Bandcamp, Discogs, Nettwerk, Apple Music, Lofi Girl.
See output/discography.md for full tracklists.

### Pre-Nettwerk — S!X - Music
| Year | Title | Format |
|---|---|---|
| 2018 | Fundamentals | LP |
| 2018 | Serendipity (w/ LESKY) | EP |
| 2018 | Balance | LP |
| 2019 | Entity | LP |
| 2019 | Distant Relatives (w/ K. Sparks) | EP |
| 2020 | Arise | LP |

### Lofi Records / Lofi Girl
| Year | Title | Format |
|---|---|---|
| 2021 | Argo (Sátyr & Phlocalyst) | LP |
| 2023 | End Of The Road | EP |

### Nettwerk Music Group
| Year | Title | Format |
|---|---|---|
| 2022 | Insights | EP |
| 2023 | Page Break | LP |

## Releases requiring verification
The following titles appeared in streaming metadata but have NOT been
cross-checked against Bandcamp, Discogs, or Nettwerk press releases.
Do not publish to the website without confirming via primary sources:

- Roadwalks (EP — Mr. Käfer collab)
- Now / Again Vol. 1 & II (w/ Mr. Käfer, Melting Pot Music)
- A Day in the Life
- Patterns / Calm Land / Motifs / New Scenes / Afterglow EP
- City Street Lights / Impressions / Gloomy Nights / Now And Then
- Cloves / Cinnamon (w/ LBL)
'''

out = Path('output')
out.mkdir(parents=True, exist_ok=True)
(out / 'phlocalyst_cms_edit_checklist.md').write_text(checklist, encoding='utf-8')
(out / 'phlocalyst_artist_research.md').write_text(research, encoding='utf-8')
print('output/phlocalyst_cms_edit_checklist.md')
print('output/phlocalyst_artist_research.md')
