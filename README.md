# Nico se Resepteboek

A recipe website with 64 traditional South African (boerekos) recipes in five
languages: Afrikaans, English, Portuguese (Portugal), Arabic (UAE) and Indonesian.

It is a plain static site: HTML, one stylesheet and three small scripts. There is
nothing to install and no server is needed.

## Opening the site

Double-click `index.html`. It opens the language chooser in your browser; pick a
language and you get that language's recipe list.

To put it online, upload the files listed under "What is in this folder" to any
web host, keeping the folders as they are.

## What is in this folder

| File or folder | What it is |
|---|---|
| `index.html` | The language chooser (start page) |
| `af/`, `en/`, `pt/`, `ar/`, `id/` | One folder per language. Each has its own `index.html` (the recipe list) and 64 recipe pages |
| `style.css` | The look of every page, including light and dark mode and the right-to-left Arabic layout |
| `units.js` | The Metric / Imperial toggle on recipe pages |
| `halaal.js` | The Original / Halaal toggle (English and Arabic only) |
| `flap.js` | The rolling-letter animation used by both toggles |

## What the site does

- **Five languages.** Every page links to the same page in the other four.
- **Translated recipe names.** English, Portuguese, Arabic and Indonesian show a translated
  name; Afrikaans keeps the original. Dishes with no real equivalent (Bobotie,
  Sosaties, Vetkoek, Koeksisters, Chakalaka) keep their own name.
- **Search and categories.** The recipe list has a search box and a row of
  category buttons that show one chapter at a time. Searching by the Afrikaans
  name works in every language.
- **Seven chapters,** in this order: Hoofgeregte, Braai & Bykos, Slaaie,
  Souse & Geurmiddels, Brood & Bak, Nageregte, Konfyt & Inmaak.
- **Metric / Imperial.** Converts ingredients, temperatures and sizes on a recipe
  page. Imperial amounts are rounded, so they are approximate.
- **Original / Halaal** (English and Arabic). Swaps pork, bacon, ham, wine,
  brandy and wine vinegar for alternatives in the 12 recipes that use them.
  Arabic starts on Halaal, English on Original.
- **Arabic digits.** The Arabic pages write all numbers as ٠١٢٣٤٥٦٧٨٩.
- **Remembered choices.** The unit and halaal choices are stored in the
  visitor's own browser, so they carry over from page to page.

## Things to know before publishing

- **The recipes have not been test-cooked.** The first 25 came from the original
  recipe book. The other 39 are standard versions written for this site.
- **The translations have not been checked by native speakers.** This matters
  most for the Arabic, Portuguese and Indonesian pages.
- **The halaal substitutions have not been reviewed** by anyone qualified to
  rule on them.
- **Tips are hidden.** Every recipe page still contains its tip, switched off by
  one marked line in `style.css` (`.tip { display: none; }`). Delete that line to
  show them again. A few tips mention brandy or gammon and have no halaal
  wording yet.

## Changing a recipe

Each recipe exists as five separate pages, one per language, for example
`af/21-melktert.html`, `en/21-melktert.html`, `pt/21-melktert.html`,
`ar/21-melktert.html` and `id/21-melktert.html`. A change made by hand has to be made in each of them.

The pages were produced by a build script that is not part of this folder.

Two details that can look like mistakes but are not:

- **File numbers and page numbers differ.** The number in a file name is the
  order the recipe was added. The number shown on the page is its position in
  the book. `58-aartappelslaai.html`, for instance, is shown as recipe 19.
- **File names are Afrikaans in every language folder,** so a page keeps the
  same address whichever language it is in.

## Files that are not part of the site

The working folder may also contain these. None of them is linked from the site
and none needs to be uploaded:

- `01-bobotie.html` to `25-brandewynpoeding.html` in the top folder: the
  original mixed-language pages from before the site was split by language.
- `Untitled-1.js`: an empty file.
- `.claude/`: settings for previewing the site locally.
