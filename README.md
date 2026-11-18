# Gitanjali Tickets

An offline Android ticket-booking app for **Gitanjali Cinema Hall, Santiniketan**
(single screen, low-price tickets). No server, no login, no internet needed —
the whole app is a small WebView shell around a bundled web app, and bookings
are kept on the phone.

- **Package** `com.santiniketan.gitanjali`
- **Min Android** 5.0 (API 21) · **Target** Android 15 (API 35)
- **APK size** ~66 KB
- English + বাংলা toggle inside the app

## What it does

1. **Now Showing** — films with certificate, genre, runtime, rating and the
   "from ₹40" price.
2. **Date + show** — today and the next 3 days; Matinee / Afternoon / Evening /
   Night slots, each with its own price.
3. **Seat map** — Stalls rows A–F (12 seats) and Balcony rows G–H (10 seats),
   with seats already sold shown greyed out. Up to 6 seats per booking.
4. **Booking form** — name and 10-digit mobile number, validated; payment by
   UPI or cash at the counter.
5. **Ticket** — booking ID with a tear-off stub, plus a *My Tickets* tab where a
   booking can be viewed or cancelled (cancelling frees the seats again).

Prices in the demo schedule: Stalls ₹40–₹60, Balcony ₹60–₹80. No booking fee.

## Prices and the schedule are data, not code

Everything the hall changes week to week lives in
[`assets/www/data.js`](assets/www/data.js):

```js
shows: [
  { id: "s1", time: "11:00 AM", slot: "matinee", stalls: 40, balcony: 60 },
  ...
],
schedule: { m1: ["s1", "s3"], ... }   // which film runs in which slot
```

Edit that file, run `./build.sh`, and the APK has the new prices.

> The four films in the demo catalogue are placeholders. Replace the titles,
> blurbs and posters colours with the real release before giving the app to
> the hall. Seat occupancy shown as "already booked" is a stable
> pseudo-random demo pattern, not real data.

## Build

No Android Studio, no Gradle. The APK is assembled with the SDK's own
`aapt2` → `javac` → `d8` → `zipalign` → `apksigner` pipeline.

```bash
./setup_toolchain.sh      # JDK 17 + build-tools 34 + platform 35 (~450 MB, once)
./build.sh                # -> build/GitanjaliTickets.apk
```

If the toolchain lives elsewhere:

```bash
TOOLS=/path/to/tools ./build.sh
```

`build.sh` also generates the launcher icons from `make_icons.py` (needs
Pillow), so the icon is code too — that is why the PNGs are not committed.

## Signing

`build.sh` generates a demo signing key the first time it runs
(`keystore.jks`, alias `gitanjali`, password `gitanjali`, 30-year validity) and
reuses it afterwards, so rebuilt APKs install as updates of the same app.

That key is gitignored on purpose: a keystore whose password is written in a
README is not a secret. Generate your own key and keep it somewhere safe before
publishing the app anywhere:

```bash
keytool -genkeypair -keystore my-release.jks -alias gitanjali \
  -keyalg RSA -keysize 2048 -validity 10950
```

## Install

1. Copy `GitanjaliTickets.apk` to the phone.
2. Open it; allow "Install unknown apps" for the file manager / browser when
   asked.
3. Android may show a Play Protect prompt for an app it has not seen before —
   choose *Install anyway*.

## Layout

```
AndroidManifest.xml                     package, launcher activity
src/com/santiniketan/gitanjali/
  MainActivity.java                     WebView host, back handling, insets
assets/www/
  index.html                            screen shells
  styles.css                            dark cinema theme
  data.js                               films, shows, prices, seat layout
  app.js                                state, seat maths, rendering, i18n
res/                                    launcher icons, app name
make_icons.py                           draws the launcher icon
build.sh  setup_toolchain.sh
```

## Limitations (honest list)

- Bookings live only on the device (`localStorage`). Nothing reaches the hall,
  so the counter does not see them — this is a front-of-house demo, not a
  ticketing backend.
- No online payment is taken; UPI is recorded as the chosen method only.
- No seat-level sync between two phones.
- The counter's own seat sales are not in the app.

To make it real you would need a small backend (show, seat-lock and booking
endpoints) plus a counter-side screen — the app's data layer is the only part
that would change.
