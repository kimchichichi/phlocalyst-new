from pathlib import Path
md = '''# Phlocalyst Artist Website Research

## Artist narrative
Phlocalyst is the artistic project of Michiel De Vleeschhouwer, a Flemish trumpet player and producer based in Munich/Germany whose music bridges orchestral discipline and lo-fi hip-hop ease. Trained in classical trumpet from a young age, he works professionally in orchestras while producing warm, sample-driven beats shaped by jazz, hip-hop, and a melodic trumpet voice [web:1][web:2][web:7][web:19].

## About Me copy
> Phlocalyst is the artistic project of Michiel De Vleeschhouwer, a trumpet player and producer based in Munich whose music blends classical training with lo-fi hip-hop, jazz textures, and warm melodic beats. Alongside his orchestral work, he creates instrumental tracks that connect the discipline of classical music with the freedom of beatmaking [web:1][web:2][web:7][web:19].

## Discography 2018–2026
| Year | Release | Type | Notes |
|---|---|---|---|
| 2018 | Fundamentals | LP / full album | Early full-length release [web:12] |
| 2018 | Balance | LP / full album | Early full-length release [web:18] |
| 2021 | Argo | Album | Listed on Spotify metadata [web:21] |
| 2021 | Relatives | EP | Listed on Spotify metadata [web:21][web:23] |
| 2021 | Roadwalks | EP | Confirmed by collaborator release page and YouTube metadata [web:6][web:24] |
| 2021 | Now / Again | Collaborative album | With Mr. Käfer [web:9] |
| 2022 | A Day in the Life | Release | Appears in Apple Music metadata [web:15] |
| 2022 | Insights | EP / album | Eight-track debut LP/EP on Nettwerk [web:37][web:43] |
| 2023 | Page Break | LP / album | Confirmed as his second LP [web:2] |
| 2023 | Now / Again II | Album | Appears in Viberate metadata [web:10] |
| 2023 | Patterns | EP | Appears in Apple Music metadata [web:15] |
| 2023 | Calm Land | EP | Appears in Apple Music metadata [web:15] |
| 2024 | Motifs | Album | Listed in Spotify release metadata [web:29] |
| 2024 | Get Together | Single | Listed in Spotify release metadata [web:21][web:29] |
| 2024 | Cerveja | Single | Listed in Spotify release metadata [web:21][web:25] |
| 2024 | Slow Mornings | Release | Appears in Apple Music metadata [web:15] |
| 2025 | New Scenes | Album | Listed in Spotify metadata [web:21][web:23][web:25] |
| 2025 | Afterglow EP | EP | Bandcamp page surfaced in search [web:26] |
| 2025 | City Street Lights | Single | Apple Music metadata [web:15] |
| 2025 | Impressions | Release | Apple Music metadata [web:15] |
| 2025 | Gloomy Nights | Single | Apple Music metadata [web:15] |
| 2025 | Distant Relatives | Collaborative album | With K. Sparks [web:28] |
| 2026 | Now And Then | EP | Listed in Spotify release metadata [web:23][web:27] |
| 2026 | Roadwalks | EP reissue/edition | Bandcamp page for Phlocalyst & Mr. Käfer [web:24] |
| 2026 | Cloves / Cinnamon | Collaborative 2-track album | With LBL [web:22] |
| 2026 | Once Upon a Time | Track / release from Distant Relatives | K. Sparks collaboration page [web:20] |

## Collaborators
- Mr. Käfer, especially on collaborative work like “Now / Again” and “Roadwalks” [web:9][web:24].
- K. Sparks, with whom he has an ongoing collaboration culminating in “Distant Relatives” and related tracks [web:4][web:20][web:28].
- Sátyr, visible in joint social/release activity and collaborative posting around “Paper Planes” [web:3].
- LBL, via “Cloves / Cinnamon” [web:22].
- Additional featured collaborators appearing in platform metadata include B-Side, xander., Erwin Do, and Viktor Minsky [web:25][web:27][web:16].

## Social links
- Instagram: [@phlocalyst](https://www.instagram.com/phlocalyst/) [web:13]
- Spotify: [Phlocalyst | Spotify](https://open.spotify.com/artist/5xJ9q1lHwa8AShRof94oIt) [web:19]
- Spotify playlist: [This Is Phlocalyst](https://open.spotify.com/playlist/37i9dQZF1DZ06evO3glz20) [web:46]
- Radio playlist: [Phlocalyst Radio](https://open.spotify.com/playlist/37i9dQZF1E4wLU2TdwhGaW) [web:48]

## Press photos
The safest public source for image assets is his official Instagram profile, which reflects his current visual branding and artist identity [web:13]. For a professional website, request a downloadable press-kit folder directly from him or his management, then use only approved images with usage rights and credit details [web:13].

## High-resolution album artwork
The most reliable public sources are his official release pages on Bandcamp and Spotify, plus label pages that show artwork credits [web:41][web:49][web:63]. For true print-grade files, request original cover files from the artist team rather than downloading display-sized web art [web:41][web:63].

## Insights
*Insights* is Phlocalyst’s eight-track debut LP, released on December 16, 2022 [web:37][web:43]. Tracklist: Blue Fraction, Daylight, Morning Stroll, Aries, One of Those Things, Zeal, Beautiful Second, and Moodswing [web:37].

## Spotify links and streams
- Artist page: [Phlocalyst | Spotify](https://open.spotify.com/artist/5xJ9q1lHwa8AShRof94oIt) [web:19]
- Essential playlist: [This Is Phlocalyst](https://open.spotify.com/playlist/37i9dQZF1DZ06evO3glz20) [web:46]
- Public analytics estimate: about 1.5M monthly listeners and 23K followers [web:47]

## Website-ready quote
“Classical training gave me structure; hip-hop gave me freedom.” This is a safe synthesis of his interview framing rather than a direct quotation [web:2][web:4][web:7].
'''
path = Path('output/phlocalyst_artist_research.md')
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(md, encoding='utf-8')
print(path)
