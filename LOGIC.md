# Flashcards App — Logic Reference

> **Maintenance rule:** This file must be updated whenever a function's behavior,
> a component's inputs/outputs, a route, a data model, or the state flow changes.
> Treat it as living documentation of *how the app behaves*, not just its file
> layout (file layout/conventions belong in `CLAUDE.md`).

## 1. What the app is

A Hungarian↔English vocabulary trainer with four practice modes (flashcards,
pairing/matching, multiple-choice quiz, typed recall), all driven by word
lists pulled live from a Google Sheet. Two "profiles" (Gabi / Tomi) each have
their own sheet tab, split into a KNOWN list and an UNKNOWN list (two ranges
in the same sheet).

## 2. Actual stack notes (vs. CLAUDE.md conventions)

As of the 2026-07-22 refactor, the app follows CLAUDE.md's conventions:
zoneless (`provideZonelessChangeDetection()`, no `zone.js` dependency),
standalone-only bootstrap (`provideRouter`, `provideTranslateService` —
no NgModules anywhere), NgRx SignalStore for global state, `input()`/`output()`
signal APIs on every component, `ChangeDetectionStrategy.OnPush` everywhere,
and Bootstrap consumed as SCSS with utility classes instead of custom
spacing/layout CSS. Remaining, deliberate gaps:

- **No `features/<name>/state|services` folders** — this app has one shared
  global store and no feature-local state, so `pages/`/`components/`/
  `services/` were kept flat rather than forcing an artificial per-page
  feature-folder skeleton. Only the one real piece of global state lives
  under `core/state/`.
- **No `@defer` blocks** — no non-critical UI section exists in this small
  app to justify one.
- **No lint tooling configured** — `ng lint`/ESLint was never set up in this
  project (pre-existing gap, `package.json` has no lint script).
- **Security issue (pre-existing, flagged in code)**: `WordsApiService` hardcodes
  a Google Sheets API key directly in source (`words-api.service.ts`), with
  a `//TODO ezt ne rakd fel!!!!!` ("don't upload this!!!!!") comment. It's
  already committed. Do not extend this pattern to new code.

## 3. Data models

| Interface/Enum | File | Purpose |
|---|---|---|
| `Word { hu, en }` | `model/words.model.ts` | Canonical word pair. |
| `SheetsResponse { range, majorDimension, values }` | `model/words.model.ts` | Raw Google Sheets API v4 `values.get` response shape. |
| `ListTypeEnum` = `KNOWN \| UNKNOWN` | `model/header.model.ts` | Which half of the sheet is active. |
| `LIST_TYPES` | `model/header.model.ts` | Maps `ListTypeEnum` → `{ range, labelKey, iconClass }`. `KNOWN` = `A2:B999`, `UNKNOWN` = `C2:D999`. |
| `UsersEnum` = `Gabi \| Tomi` | `model/header.model.ts` | The two sheet tabs/profiles. |
| `WordCardModel { value?, visible?, activeClass?, speakable?, lang? }` | `components/word-card/word-card.model.ts` | View model for a single flashcard-style tile. `createSimpleWord(val, speakable)` factory sets `visible: true`, `activeClass: 'bg-dark'` (leaves `lang` unset). `lang` (BCP-47 code, e.g. `'hu'`/`'en'`) drives the tile's `[attr.lang]`, which enables correct browser hyphenation as a wrap fallback — see `WordCardComponent` and Learn Words §8.3. `activeClass`/`visible` are bound in the template via native `[class]`/`[class.invisible]`, not `NgClass`. |
| `LearnWordData { hu, en }` | `pages/learn-words/learn-word.model.ts` | Alias of `Word` used in the quiz page. `LangKey = 'hu' \| 'en'`. |

## 4. Global state — `WordsStore` (`core/state/words.store.ts`)

An NgRx `signalStore` (`providedIn: 'root'`), the single source of truth for
"which words are we currently practicing":

- `withState`: `selectedSheet` (default `UsersEnum.GABI`), `selectedListType`
  (default `ListTypeEnum.UNKNOWN`) — both read-only to consumers.
- `withProps`: builds `_wordsResource` by calling
  `WordsApiService.wordsResource(selectedSheet, rangeSignal)` — an
  `httpResource` that re-fetches automatically whenever `selectedSheet` or
  the derived range (from `selectedListType`) changes.
- `withComputed`: `words = computed(() => _wordsResource.value() ?? [])` —
  public readonly signal every page consumes. Resolves to `[]` while
  loading/on first paint (pages treat `undefined`/empty via
  `@if (actual(); as ...) { } @else { loading }` patterns, except
  Pairing/LearnWords which tolerate an empty array directly).
- `withMethods`: `toggleUser()` and `toggleListType()` — flip `selectedSheet`
  between `GABI`/`TOMI` and `selectedListType` between `KNOWN`/`UNKNOWN` via
  `patchState`, called by `HeaderComponent`. `setSheet(sheet: UsersEnum)` and
  `setListType(listType: ListTypeEnum)` set either field to an explicit
  value via `patchState`, called once at startup by `AppComponent` from the
  URL query params (see below). Together these four methods are the only way
  to mutate the store (SignalStore state signals aren't directly settable
  from outside).

This is the one piece of cross-page shared state; every page/`effect()`
re-derives its own local (shuffled, indexed, scored) state from
`wordStore.words()` whenever it changes.

### Initializing from URL query params
`AppComponent` (`app.component.ts`) reads `window.location.search` directly
via `URLSearchParams` in its constructor — a synchronous, one-time startup
read, not a live binding (the URL is not kept in sync with later toggles).
It deliberately does **not** go through `ActivatedRoute.queryParamMap`: that
observable is backed by the root route's params as of Router construction,
which is empty until the router's initial navigation resolves — asynchronous
relative to `AppComponent`'s constructor — so a naive `take(1)` subscribe
there grabs the pre-navigation empty value and silently no-ops. Reading
`window.location.search` sidesteps Router timing entirely. It reads two
optional params:
- `user` — matched case-insensitively against `UsersEnum` values
  (`Gabi`/`Tomi`); if it matches, calls `wordStore.setSheet(...)`.
- `list` — matched case-insensitively against `ListTypeEnum` values
  (`KNOWN`/`UNKNOWN`); if it matches, calls `wordStore.setListType(...)`.

An unrecognized or missing value for either param is silently ignored and
the store keeps its default (`Gabi`/`UNKNOWN`). This lets a link like
`?user=Tomi&list=KNOWN` be shared with a specific profile pre-selected —
e.g. one URL for Gabi, a different one for Tomi — without needing a
per-profile route. `HeaderComponent`'s toggle buttons still work as before
and are unaffected by how the initial values were set.

## 5. Services

### `WordsApiService` (`services/words-api.service.ts`)
- `wordsResource(sheet: Signal<string>, range: Signal<string>)` — returns an
  `httpResource<Word[]>` that calls
  `GET https://sheets.googleapis.com/v4/spreadsheets/{sheetId}/values/{sheet}!{range}?key={apiKey}`,
  re-fetching whenever the `sheet`/`range` signals change.
- `parse` maps each row `[en, hu]` → `{ en: row[0], hu: row[1] }`. **Column
  order in the sheet is en, then hu** — mind this if the sheet layout ever
  changes. `defaultValue: []` while loading/errored.

### `WordService` (`services/words.service.ts`)
- `shuffle<T>(array: T[]): void` — in-place Fisher–Yates shuffle. Mutates and returns nothing.
- `speakPhrase(text?)` — browser `speechSynthesis` TTS. No-ops on empty text.
  Cancels any in-flight utterance first. Prefers an `en-GB` voice if available,
  rate `0.9`.

### `createShuffledWordList` (`utils/shuffled-word-list.ts`)
Shared factory (not an Angular class — a plain function that internally calls
`effect()`, so it must be invoked from a constructor/injection context, same
rule as calling `effect()` directly) used by Flashcards and Ask Words. Given a
`Signal<Word[]>` and a `shuffle` function, it registers an `effect()` that
reshuffles a copy into `shuffledWords` and resets `actualIdx` to 0 whenever
the source signal changes, and returns `{ shuffledWords, actualIdx,
actualWord, step(direction) }` (`step` is the same bounds-clamped ±1 index
move both pages used to hand-roll separately). Takes an optional `onReshuffle`
callback, used by Flashcards to reset `isFlipped` after a reshuffle. This is
the only piece of duplicated navigation logic that was factored out — Learn
Words' `effect()` has different semantics (maps `Word`→`LearnWordData`,
drives quiz `restart()`/score state) and Pairing pages 4 words at a time
rather than stepping one at a time, so neither uses it.

## 6. Routing (`app.routes.ts`, standalone `provideRouter`)

| Path | Component |
|---|---|
| `''` | `HomeComponent` |
| `'flashcards'` | `FlashcardsComponent` |
| `'pairing'` | `PairingComponent` |
| `'learn-words'` | `LearnWordsComponent` |
| `'ask-words'` | `AskWordsComponent` |

`HomeComponent` renders four `app-navigation-card`s whose `action` input is
the route segment to navigate to on click.

## 7. Shared components

### `HeaderComponent` (`components/header/`)
Always visible (rendered once in `app.component.html` above `<router-outlet>`).
- `changeUser()` — calls `wordStore.toggleUser()` (`Gabi`/`Tomi`).
- `changeList()` — calls `wordStore.toggleListType()` (`KNOWN`/`UNKNOWN`).
- `toHome()` — navigates to `/`.
- Both toggles patch state in `WordsStore`, which re-triggers its
  `httpResource`, so switching user/list re-fetches from the sheet and every
  page reacts via its own `effect()`.

### `WordCardComponent` (`components/word-card/`)
Dumb presentational tile bound to a `WordCardModel`.
- `word = input.required<WordCardModel>()`, `cardClicked = output<void>()`
  fired on tile click.
- `maxFontSize = input(40)`, `minFontSize = input(13)` (px) — bounds passed
  through to `appFitText` on the tile's `<h1>` (see `FitTextDirective` below).
  Callers with a different box shape (e.g. a near-full-screen single tile)
  can override these; unset, every consumer gets the same moderate default.
- `speak($event)` calls `WordService.speakPhrase(word().value)` and
  `stopPropagation()`s so clicking the speaker icon doesn't also fire `cardClicked`.
- Speaker button is hidden (`invisible`) unless `word().speakable`.
- Tile is hidden (`invisible`, but still occupies layout space) unless `word().visible`.
- Host element carries `d-block h-100` (Bootstrap utilities) instead of a
  custom `:host` CSS rule.
- The tile's `<h1>` gets `[appFitText]="word().value ?? ''"` (auto-sized font,
  see below) and `[attr.lang]="word().lang"` (unset if `lang` is omitted). In
  its own `.scss`: `overflow-wrap: normal; word-break: normal; hyphens: auto;`
  — text only ever breaks at whitespace/slash (the browser's default break
  opportunities) or, once those are exhausted for the current font size, at a
  language-correct hyphenation point (needs `lang` to be set; a no-op
  otherwise). It never falls back to cutting a word at an arbitrary character.

### `FitTextDirective` (`directives/fit-text.directive.ts`)
`[appFitText]` — standalone attribute directive, applied to `WordCardComponent`'s
`<h1>` and to Learn Words' `#actualHu` prompt. Sizes the host element's
`font-size` to the largest value (binary search in whole px, bounded by
`[minFontSize, maxFontSize]` inputs) at which the element's *rendered* content
(`scrollWidth`/`scrollHeight`, i.e. after wrapping/hyphenation at that size)
still fits inside `el.parentElement`'s `clientWidth`/`clientHeight` — a real
DOM measurement, not a character-count estimate, so it's correct regardless
of font metrics, language, or device. Re-runs (via Angular's `afterRenderEffect`,
`mixedReadWrite` phase) whenever the `appFitText` text input changes or a
`ResizeObserver` on the parent fires (e.g. orientation change).
- **If the parent's box is itself sized off the child's content (e.g. a plain
  flex row that just wraps its content, like Learn Words' `.prompt-row`), the
  directive's measurement isn't a meaningful ceiling** — the box grows to
  match whatever font is tried, so it always "fits" and the search just
  settles at `maxFontSize`, growing/wrapping the box to hug the content with
  no dead space. That's fine (desired, even) for a content-sized box.
  It's only actively harmful when the parent is a flex/grid item competing
  for a *fixed* pool of space via `flex: 1`/`1fr` (e.g. Learn Words'
  `.answers` grid, §8.3): flex/grid items default to a content-based
  automatic minimum size (`min-height: auto` / implicit track minimum) that
  overrides `flex-grow`/`fr` shrinking, so the same "box grows to match font"
  behavior there inflates the box *and* starves its siblings (or overflows
  the viewport) instead of just hugging its own content. Any such ancestor
  needs an explicit `min-height: 0` (flex) or `minmax(0, 1fr)` (grid track)
  to actually cap it at its allotted share — see `.answers` in §8.3.

### `NavigationFooterComponent` (`components/navigation-footer/`)
Generic prev/next footer bar used by Flashcards, Pairing, Ask-Words, Learn Words.
- `backDisabled = input(false)`, `nextDisabled = input(false)`.
- `backClicked = output<void>()`, `nextClicked = output<void>()`.
- `<ng-content>` in the middle slot — each page puts its own progress
  counter (`x / total`) there.

### `NavigationCardComponent` (`pages/home/navigation-card/`)
Big clickable tile on the home screen. `action`, `displayName`, `iconClass`
are all plain (non-required) `input<string>()` signals. `onClick()` navigates
to `action()`.

### `LoadingStateComponent` (`components/loading-state/`)
Dumb wrapper (`<div class="loading-state"><p><ng-content></ng-content></p></div>`)
used by Flashcards and Ask Words while their word list hasn't resolved yet.
Deliberately takes no `TranslatePipe` dependency of its own — the caller
projects already-translated text in (`<app-loading-state>{{ 'label.loading'
| translate }}</app-loading-state>`), same pattern as `NavigationFooterComponent`'s
middle slot. This isn't just style: a child component with its own
`TranslatePipe` import needs its own `TranslateService`, which the specs for
pages that render this synchronously (the `@else` branch, since the word
list's `httpResource` never resolves during a synchronous test) don't
provide — see §11's pre-existing `TranslateService` gap. Content-projecting
the already-piped text keeps that resolution in the parent, which the specs
already override correctly.

## 8. Pages — per-mode logic

### 8.1 Flashcards (`pages/flashcards/`)
Simple flip-card browsing, one word at a time.
- `shuffledWords`/`actualWordIdx`/`actualWord` come straight from
  `createShuffledWordList` (§7); its `onReshuffle` callback resets `isFlipped`
  to `false` on every reshuffle.
- `enWord`/`huWord` are `WordCardModel`s built via `createSimpleWord`;
  **only the English side is speakable**.
- `actual = isFlipped() ? huWord() : enWord()` — what's currently rendered.
- `flip()` toggles `isFlipped` (bound to `WordCardComponent`'s `cardClicked`).
- `step(direction)` calls the shared `nav.step(direction)` (±1, clamped to
  bounds) and, only if the index actually moved, resets `isFlipped` to false
  (flipping back to English when you navigate).
- Footer prev/next disabled at the array bounds.
- Renders `<app-loading-state>` until `actual()` is truthy (i.e. until the
  resource has resolved and produced at least one word).

### 8.2 Pairing (`pages/pairing/`)
Match English tiles to shuffled Hungarian tiles, 4 pairs per round (page).
- `displayedWordsCount = 4`. `actualStartIndex` is the paging offset into
  `wordStore.words()`.
- `currentPageWords` = slice of 4 words starting at `actualStartIndex`.
- `effect()` reshuffles `shuffledHuWords` from `currentPageWords()` any time
  the page's word slice changes (new round or new word source).
- `enCards`/`huCards` are computed `WordCardModel[]`: a tile becomes invisible
  once its `hu` value is in `matchedHuValues`; highlighted (`bg-info`) if it's
  the currently selected index on that side; English side is always speakable,
  Hungarian side never is.
- `wordClicked(lang, idx)` — records the selection for that side
  (`selectedEnIdx`/`selectedHuIdx`). Once both sides have a selection:
  - if `enWord.hu === huWord.hu`, add to `matchedHuValues` (hides both tiles).
    If that was the last unmatched pair in the round, auto-advance via
    `next()` after a 600 ms delay.
  - Regardless of match/mismatch, clear both selections after 400 ms (so a
    wrong pairing is visibly highlighted briefly, then resets).
- `next()`/`prev()` page by 4, via `resetRound(newIndex)`, which clamps the
  last page so it doesn't run past `totalLength()` (last round is shifted
  back to end exactly at the last word rather than left short), and clears
  matches/selections when the index actually changes.
- Footer prev/next disabled at the first/last page.

### 8.3 Learn Words — multiple choice quiz (`pages/learn-words/`)
- `questionLang` (default `'en'`) is the language shown as the prompt;
  `answerLang` is always the other one. `toggleLang()` flips it and calls
  `restart()`.
- `effect()` on `wordStore.words()`: maps to `{hu, en}`, shuffles, sets
  `cards`, and calls `restart()` — wrapped in `untracked()` so `restart()`'s
  own signal writes don't re-trigger this effect.
- `restart()`: reshuffles `cards`, resets `actualIdx`/`success`/`failed`/
  `wasFailed`/`feedbackState` to initial state, then calls `generateOptions()`.
- `currentWord` = `cards[actualIdx]`. `isGameOver` = `actualIdx >= cards.length`
  (only true once `cards` is non-empty, so it doesn't fire on an empty resource).
- `generateOptions()`: builds 4 answer options = the current target word plus
  3 random distractors from the rest of the deck, all shuffled together, into
  `currentOptions`.
- `handleWordClick(optionIdx, selectedWord)`:
  - Ignored if the current feedback state is already a correct answer
    (guards against double-fire while advancing).
  - Compares `selectedWord.en === target.en` (comparison is always on the
    `en` field regardless of which language is currently the question/answer
    side — correctness check is language-order-independent by design since
    `en`/`hu` pairs are unique together).
  - On correct: sets feedback, increments `success` **only if this word
    hadn't already been failed once this attempt** (`wasFailed` guards
    against a retry-after-fail still counting as a win), then advances via
    `nextWord()` after 500 ms.
  - On incorrect: sets feedback (marks that option red), increments `failed`
    and sets `wasFailed` only on the *first* wrong guess for this word, and
    clears the feedback highlight after 1000 ms (only if the user hasn't
    since clicked something else — checked via matching `clickedIndex`) so
    the user can try again on the same word without advancing.
- `nextWord()` clears feedback/`wasFailed`, increments `actualIdx`, generates
  new options for the next word.
- `getCardConfig(word, idx)` — builds the `WordCardModel` for an option tile:
  green (`bg-success`) if it's the clicked-correct tile, red (`bg-danger`) if
  it's the clicked-wrong tile, else default `bg-dark`. Value shown is in
  `answerLang()`; `lang` is also set to `answerLang()` so the tile hyphenates
  correctly (see `WordCardComponent` above). Font sizing is *not* computed
  here — each `app-word-card`'s `<h1>` sizes itself via `FitTextDirective`
  against its own grid-cell box (see `directives/fit-text.directive.ts` under
  §7), with `maxFontSize=34` passed explicitly (kept below the prompt row's
  ceiling, next) instead of `WordCardComponent`'s default of 40 — so an
  option tile's text never renders larger than the question prompt above it.
  The prompt word (`#actualHu`) uses the same directive directly, with
  `maxFontSize=40 minFontSize=13`, instead of `WordCardComponent`'s defaults.
- `.prompt-row` (the green header bar) is deliberately *not* height-constrained
  — no fixed height, no `h-100` on `.col-8` — so it hugs `#actualHu` at
  whatever size/line-count the directive settles on (in practice, almost
  always `maxFontSize=40`, since with no fixed ceiling the box just grows to
  match) instead of leaving dead space around a short prompt. It sits above
  `.answers` (`flex: 1`) in the flex column, so when a long prompt makes it
  taller, `.answers` (and the option cards' own `FitTextDirective` re-fit)
  simply absorb the difference — see the `FitTextDirective` caveat in §7 for
  why this box is safe to leave content-sized while `.answers` is not.
- The `.answers` grid (`grid-template-columns`/`grid-template-rows:
  repeat(2, minmax(0, 1fr))`, `min-height: 0`) is the box each option card's
  `FitTextDirective` measures against. The `minmax(0, 1fr)`/`min-height: 0`
  are load-bearing, not decorative: without them, a flex/grid item's
  content-based automatic minimum size wins over `flex: 1`/`1fr`, so the grid
  (and hence the fit-to-box measurement) would grow to whatever size the
  *current* font needs instead of being capped by actual remaining screen
  space — the box and the font-fit search would inflate each other with no
  ceiling, pushing the footer off-screen. See `FitTextDirective` (§7) for the
  general version of this constraint.
- `speak()` — always speaks the English form of the current word regardless
  of question/answer language.
- Score bar shows `success`/`failed` counts and current position; on game
  over, options are replaced with a restart button.

### 8.4 Ask Words — typed recall (`pages/ask-words/`)
- `shuffledWords`/`actualIdx`/`actualWord`/`step` all come straight from
  `createShuffledWordList` (§7) — no `onReshuffle` callback needed here.
- `actualWord` = word at `actualIdx`. Hungarian word is always shown as the
  prompt; user types the English translation into a template-driven
  (`ngModel`) text input bound to the `answer` signal.
- `check()` — case-insensitive compare of typed `answer` against
  `actualWord().en`. Correct → clears the "failed" invalid-state styling and
  auto-advances (`step(1)`). Incorrect → sets `isActualFailed` (red input
  border via `is-invalid` class), stays on the same word. Input is cleared
  either way.
- `help()` — reveals the correct English answer for 2 seconds
  (`helpDisplayed` signal), then hides it again.
- Renders `<app-loading-state>` until the resource has produced words.

## 9. i18n

`provideTranslateService({ lang: 'en', fallbackLang: 'en', loader: provideTranslateHttpLoader({...}) })`
in `main.ts` wraps `@ngx-translate/core` (standalone providers, no NgModule),
loading JSON from `./assets/i18n/{lang}.json`. Only `en.json` exists today
(`src/assets/i18n/en.json`); the provider config sets `'en'` as both
fallback and active language on startup (`TranslateService`'s constructor
calls `.use(lang)`/`.setFallbackLang(lang)` from this config) — there is no
language switcher in the UI for the *interface* language (the Hungarian text
is just the raw word data, not translated UI strings). Flag images
(`assets/images/en.svg`, `hu.svg` — vector, sourced from flagcdn.com; kept as
SVG rather than the previous 64×32 PNGs so the icon stays sharp at any
display size/DPI) are used only inside Learn Words' language-toggle button
icon.

## 10. Styling

Bootstrap is consumed as SCSS, not precompiled CSS. `src/styles/_variables.scss`
loads Bootstrap's `functions`/`variables` partials (via legacy `@import`,
since Bootstrap 5.3's own SCSS source isn't `@use`-safe in isolation — its
partials assume global scope from import order) so component `.scss` files
can `@use 'variables' as bs;` and reference `$spacer` etc. (enabled via
`stylePreprocessorOptions.includePaths: ["src/styles"]` in `angular.json`).
`src/styles.scss` pulls in the full `bootstrap/scss/bootstrap` for CSS output.

Layout/spacing is expressed as Bootstrap utility classes in templates (or via
`host: { class: '...' }` in `@Component` for what used to be `:host` rules)
rather than custom CSS — e.g. `d-flex flex-column flex-fill h-100` replaces
the old `.container-div`/`:host` flex rules on every page. Component `.scss`
files only keep rules with no Bootstrap utility equivalent (e.g. `word-card`'s
`width: 99%` speaker-button overlay and its own text-wrap/hyphenation rules on
`.card h1`; `learn-words`' `#actualHu` wrap rules and the `.answers` grid's
`minmax(0, 1fr)`/`min-height: 0` sizing, see §7/§8.3).

### iOS "Add to Home Screen" safe-area handling
`src/index.html`'s viewport meta has `viewport-fit=cover`, and carries
`apple-mobile-web-app-capable=yes` + `apple-mobile-web-app-status-bar-style=
black-translucent` — together these are what make iOS actually run the
home-screen-installed app edge-to-edge (fullscreen, no Safari chrome,
content drawn *under* the status bar/notch/Dynamic Island and home
indicator) instead of opening it as a normal Safari tab. Without both
`apple-mobile-web-app-capable` and `viewport-fit=cover`, `env(safe-area-inset-*)`
resolves to `0` and none of the padding below has any effect — iOS only
reports non-zero insets once the page opts into edge-to-edge rendering.
The safe-area padding must apply *only* when actually launched standalone
from the home screen — not in a normal Safari tab, where Safari's own chrome
already reserves the notch/home-indicator space and adding the padding again
would double it up. `src/index.html` has an inline `<script>` in `<head>`
that checks `window.navigator.standalone` (Apple's dedicated, WebKit-only
boolean for "was this page launched from a home-screen icon") and, if true,
adds an `ios-standalone` class to `<html>` — this runs before first paint
since it's an inline, blocking `<script>` ahead of any content. **Deliberately
not** used: the CSS `@media (display-mode: standalone)` feature — tried
first, but empirically didn't match on-device for this app's non-manifest,
meta-tag-only A2HS setup, silently zeroing out the padding it gated (the top
inset disappeared, status bar clock/icons drew directly over the header).
`window.navigator.standalone` is the older, iOS-specific, more reliable
signal for this exact case. `body` (`src/styles.scss`) pads itself on all
four sides with `env(safe-area-inset-top/right/bottom/left)`, scoped under
the `html.ios-standalone body` selector. Since `app-root` (`app.component.html`)
is a single `d-flex flex-column h-100` filling `body`, and neither
`HeaderComponent` nor any page's `app-navigation-footer` uses
`position: fixed`/`sticky` (they're just the first/last flex children,
visually pinned to the viewport edges by the `h-100` flex-column layout, not
by CSS positioning) — this one body-level padding is sufficient to inset
the whole app from the notch/rounded corners/home indicator; there's no
separate fixed/sticky element that needs its own safe-area padding. There is
no `manifest.json` in this project (Android/Chrome-style PWA install isn't
set up) — the iOS-only meta tags above are the only mechanism in play here.
`word-card.component.html`'s `position-absolute top-0` speaker button is
positioned relative to its own `.card` (which has `position-relative`), not
the viewport, so it doesn't touch a real screen edge and needs no safe-area
handling.

## 11. Known gaps / things to be aware of when changing code

- Hardcoded Google API key + sheet ID in `WordsApiService` — flagged by the
  author as not meant to be committed. Don't copy this pattern; if asked to
  fix it, move to environment config and mention it needs key rotation since
  the current key is already exposed in git history.
- Pre-existing test-infra gap: several `.spec.ts` files (`PairingComponent`,
  `HomeComponent`, `NavigationCardComponent`, all three `AppComponent` specs)
  fail with `NG0201: No provider found for TranslateService` because their
  `TestBed` module doesn't provide it and some only shallowly mock
  `TranslatePipe` on the component under test (not on child components that
  also use the real pipe, e.g. `NavigationCardComponent` inside `HomeComponent`).
  This predates the 2026-07-22 CLAUDE.md-compliance refactor and is unrelated
  to it (verified: identical 6-failure set before and after).
