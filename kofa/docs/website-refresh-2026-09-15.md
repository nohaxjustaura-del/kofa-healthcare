# Website refresh September 15 2026

The September 15 request and supplied Word document define this update. The document supplies website copy; the email specifies page structure, portfolio classifications, team order, and visual changes. OrbiMed is a style and layout reference, not a source of KOFA facts or assets.

## Acceptance criteria

- The homepage contains Home, Portfolio, Focus Areas, and Contact, in that order.
- About, Our Approach, Team, and News are accessible through navigation. Focus Areas and Portfolio also have dedicated pages.
- Copy reflects the supplied document: early- to mid-stage medical devices, evergreen capital, the About and Approach narratives, and the three stated focus areas.
- Portfolio has Active and Exits views. Alydia Health and Aria CV are the only exits; the other fourteen companies are active. Company name blocks have no green checkmarks.
- The old Our Conviction and Portfolio Stories sections are removed from the homepage.
- News is one collection with KOFA News and Portfolio News filters.
- Team order is Renee Masi, Senior Managing Director; Jing Lin, Managing Director; Dr. Meng Deng, Managing Director. Jing's existing biography remains; Renee and Meng have explicit biography placeholders pending supplied copy.
- The KOFA logo is larger. The supplied red artwork remains the brand authority.
- The September 19 follow-up restores restrained healthcare photography in the homepage hero, Portfolio and Focus Areas image slots, with simple outline icons and no visible photo credits. This supersedes the earlier abstract-only interpretation. Existing company logos and the supplied team portrait remain.
- Navigation, filters, contact validation, and layouts are checked at desktop and mobile widths. The application passes its production build and TypeScript checks.

## Search appearance

About, Focus Areas, Team, Portfolio, Our Approach, and News need crawlable URLs, meaningful titles, and internal links. Google chooses sitelinks automatically; website code cannot guarantee their selection or order. See [Google Search Central](https://developers.google.com/search/docs/appearance/sitelinks).

## Remaining supplied content

Renee Masi's and Dr. Meng Deng's biographies and portraits are pending. Do not invent credentials or substitute unrelated portraits.

## Source files

- `Website contents 09152026.docx`, supplied from Downloads; text extracted to `output/website-content-source.txt` for implementation review.
- Supplied logo originals copied to `public/brand/kofa-symbol-supplied.png` and `public/brand/kofa-stacked-supplied.png`.

This record describes the requested change. Validation results are reported separately after implementation.
