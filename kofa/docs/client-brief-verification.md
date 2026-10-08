# Client brief verification

Verified against `PRODUCT.md` and `docs/website-refresh-2026-09-15.md` on September 20, 2026. The September 19 photography request supersedes the earlier abstract-only direction. This is a current-source acceptance map; the existing build and desktop/mobile browser results are recorded in `README.md`. No new deployment or live browser run was performed for this document.

| Client requirement | Result | Evidence |
| --- | --- | --- |
| Homepage sequence: Home, Portfolio, Focus Areas, Contact only | Met | `app/page.tsx` renders the hero, `HomePortfolio`, Focus Areas, and `CTASection` in that order. It has no other homepage section. |
| About, Our Approach, Team, and News navigation; dedicated Focus Areas and Portfolio pages | Met | `data/site.ts` defines all seven destinations; `components/navigation/Navigation.tsx` renders them. Each requested route has an `app/<route>/page.tsx`. |
| Approved evergreen, early- to mid-stage medical-device positioning and three focus areas | Met | `data/site.ts` contains the firm positioning and the three focus-area records shared by `app/page.tsx` and `app/focus-areas/page.tsx`; About and Approach render as separate pages. |
| Active and Exits; only Alydia Health and Aria CV exit | Met | `data/portfolio.ts` has 16 companies: 14 Active and only those two Exits. `components/portfolio/PortfolioBrowser.tsx` and `components/home/HomePortfolio.tsx` expose status filters. |
| No green checkmarks, Our Conviction, or Portfolio Stories on the homepage | Met | The homepage portfolio cards and four-section `app/page.tsx` omit them. |
| Single News collection with KOFA News and Portfolio News filters | Met | `app/news/page.tsx` mounts one `NewsBrowser`; its tabs are All, KOFA News, and Portfolio News. |
| Team order and roles; preserve Jing bio; mark pending bios honestly | Met | `data/team.ts` sorts Renee Masi (Senior Managing Director), Jing Lin (Managing Director), then Dr. Meng Deng (Managing Director). Renee and Meng display explicit forthcoming placeholders; Jing retains her biography and portrait. |
| Prominent supplied red KOFA mark | Met | `components/ui/LogoMark.tsx` uses `/brand/kofa-symbol-supplied.png` with the red wordmark; `components/navigation/Navigation.tsx` gives the header lockup an 84 px mark on desktop and responsive sizing on mobile. |
| September 19 healthcare photography and simple outline icons | Met | `app/page.tsx` uses `clinical-collaboration-v2.png` in the hero, `device-research-v2.png` and `healthy-longevity-v2.png` in circular crops, plus `FocusGlyph` outline icons. No visible photo credits are rendered. |
| Six crawlable sitelink candidate routes | Met | About, Focus Areas, Team, Portfolio, Our Approach, and News have dedicated pages with metadata and are included through `app/sitemap.ts` and site navigation. Google chooses actual sitelinks; the site cannot guarantee their selection. |
| Desktop/mobile navigation, filters, contact validation, layout, build and TypeScript | Met within recorded checks | `README.md` records the completed production build, typecheck, desktop journeys, and an actual 390 × 844 mobile run. That mobile run did not separately measure portfolio page overflow or capture its console log; no broader page-wide claim is made here. |

Renee Masi's and Dr. Meng Deng's approved biographies and portraits remain pending as the brief explicitly permits. Their absence does not block this brief's placeholder requirement.
