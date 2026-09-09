---
name: testing-mobile-emulator
description: How to run and E2E-test the Expo/React Native app in mobile/ on the local Android emulator (Expo Go), including input quirks, permission testing and recording tips.
---

# Testing the Expo mobile app (mobile/) on the Android emulator

## Start / connect
- SDK: `/home/ubuntu/android-sdk` (adb at `platform-tools/adb`, emulator at `emulator/emulator`). AVD `pagodas` (API 35, 1080x2400).
- Boot: `emulator -avd pagodas &`, then `adb reverse tcp:8081 tcp:8081`.
- Metro: `cd mobile && npx expo start` (check `curl localhost:8081/status` → `packager-status:running`).
- Open app in Expo Go: `adb shell am start -a android.intent.action.VIEW -d "exp://localhost:8081"`. First render takes 40–90 s (blank brown screen is normal).
- Bring Expo Go back to the front after an external intent (Chrome/Maps/YouTube): `adb shell am start -n host.exp.exponent/.experience.ExperienceActivity`.
- If Expo Go shows "Something went wrong / Failed to download remote update": the `adb reverse` mapping is likely gone (it is dropped whenever the Expo Go process is killed, e.g. by `pm revoke`). Re-run `adb reverse tcp:8081 tcp:8081` and tap the reload icon.
- Ignore the "Cannot connect to Expo CLI" toast, the `'Splashscreen.setOptions' cannot be used in Expo Go` Metro WARN, and the floating gear (dev menu) button — dev-only artifacts.
- After a machine restart start Metro with `npx expo start --clear`; Expo Go may show "Expo Go isn't responding" ANR dialogs on first launch — tap Wait/Close and relaunch the exp:// intent.
- Google Maps (from the Directions button) is slow on the emulator: it asks for its own location permission and often ANRs ("Maps isn't responding"). Read the destination from the Maps search field / the `am start` intent URL in logcat, then `adb shell am force-stop com.google.android.apps.maps` and bring Expo Go back to the front.

## Input quirks
- Dev-mode JS on the software emulator lags: search results and chip toggles can take 5–15 s to update. Always wait before judging "not working"; a first tap after idle is often dropped — re-tap once before concluding.
- `adb shell input text RR` types into a focused TextInput — it does NOT reload JS. Use force-stop + `am start` to relaunch instead.
- `adb shell input text` cannot type Vietnamese diacritics; test diacritic-insensitive search with ASCII variants (e.g. `cao%slinh` — `%s` = space).
- Prefer `adb shell input tap X Y` with device coords found via `adb shell uiautomator dump` for small controls (e.g. the search "Clear" button at ~[969,361][1017,411]).
- Fast `adb shell input swipe` with short durations (<300 ms) can register as taps on list rows/links; use ≥400 ms durations for scrolling.
- The first tab-bar tap right after a theme/language change is often dropped (JS busy re-rendering); wait ~5 s and re-tap.
- To reach the end of the 100-item list quickly, fling with short swipes (`input swipe 540 2100 540 200 150` × ~25); slower 400 ms swipes are safer mid-list where rows/links could be hit.
- `adb shell input keyevent 4` (Back) exits the app to the launcher when no keyboard/modal is open; verify with `adb shell dumpsys window | grep mCurrentFocus`.

## Location / permissions
- Mock location: `adb shell appops set com.android.shell android:mock_location allow` + `cmd location providers add-test-provider ...` (Hải Phòng 20.8449,106.6297 was used).
- Denied flow: `adb shell pm revoke host.exp.exponent android.permission.ACCESS_FINE_LOCATION` (+COARSE). Android kills the app process on revoke ("permissions revoked" in logcat) — this is OS behaviour, not an app crash. Relaunch, then tap "Gần tôi" to get the system dialog. Re-grant with `pm grant`.
- System theme check: `adb shell cmd uimode night yes|no` toggles OS dark mode live.

## Recording
- Enlarge the emulator window for the recording: `wmctrl -i -r <emulator window id> -e 0,20,0,533,1185` and minimize Chrome (`xdotool windowminimize <id>`). Use computer-use `zoom` on region [13,0,354,760] to inspect the phone screen.

## Audio (P3, expo-audio) testing
- The app streams MP3s from `${SITE_URL}/audio/kinh/<slug>.mp3`; until the PR is deployed serve them locally: repo root `npm run build && npx next start -p 3100`, check `curl -I http://localhost:3100/audio/kinh/chu-dai-bi.mp3` → 200 `audio/mpeg`, then start Metro with `EXPO_PUBLIC_AUDIO_BASE_URL=http://10.0.2.2:3100/audio npx expo start --clear` (10.0.2.2 = host loopback inside the emulator; env vars are baked in at bundle time, so restart Metro with `--clear` after changing them).
- You cannot hear the emulator; prove playback with the PlayerBar time/`Câu n/N` advancing, the highlighted verse moving, `adb shell dumpsys media_session` / `dumpsys audio` ("players: ... state:started") and by comparing to cue timings in `src/data/scripture-audio.json` (`node -e` to print `cues[i].start`).
- Short tracks for repeat tests: `chu-vang-sanh` (35 s, 9 cues), `luc-tu-dai-minh` (50 s, 7 cues). At 1.5× a 35 s track finishes in ~23 s.
- Expo Go (SDK 57) logs `Failed to start expo-audio playback service` / `Failed to activate lock screen controls - service binding failed` — expected there (config plugin not applied); audio still plays. Playback keeps running after `input keyevent KEYCODE_HOME`, but round-boundary auto-repeat may not fire while backgrounded.
- Offline test: `adb shell svc wifi disable && adb shell svc data disable` (re-enable afterwards). Downloads live in the app's `Paths.document/audio/`; Cá nhân shows `n bài · size`.
- `am force-stop host.exp.exponent` + relaunch is the way to verify `vp-listen-history` persistence (Home "Tiếp tục nghe" card).
- Resume ("Nghe tiếp từ m:ss" pill / Home card): test streamed AND downloaded (file://) sources separately, and for chant AND AI — they take different code paths. Sample the PlayerBar time ~1 s and ~4 s after tapping; a seek that lands only after ~10 s of audible 0:00 is worth reporting.
- Tap-to-seek proof on short AI tracks: auto-follow re-scrolls the list between your screenshot and tap, so tap a verse *behind* the current one (backward jump, e.g. verse 2 while at Câu 8) after a manual scroll (which pauses auto-follow 4 s) — a forward jump can be confused with natural progression.
- Stale bundle trap: if the device shows old strings although the curl'd Metro bundle is new, restart Metro with `--clear` and force-stop/relaunch Expo Go; verify by a visible string from the newest commit before recording.
- Metro started with `CI=1` does NOT watch files ("reloads are disabled"): after any new commit a plain Expo Go relaunch still gets the old graph for Expo Go's bundle params, while a `curl` of the bundle with *different* params may build a fresh graph and misleadingly show the new code. Always restart Metro with `--clear` (in a persistent shell, `timeout=0`) after the working tree changes, then force-stop/relaunch Expo Go, and confirm a full "Android Bundled … (≈1581 modules)" line.
- Killing the Metro shell does not free port 8081 (the node child survives): find it with `ss -ltnp | grep :8081` and kill that pid before restarting, otherwise `expo start` prompts for port 8082 and exits in CI mode.
- To check a runtime value that has no UI (e.g. `Constants.appOwnership` / `executionEnvironment` in Expo Go), add a temporary `console.log("[DIAG] …")` at module top, restart Metro `--clear`, relaunch; the ` LOG  [DIAG] …` line shows up in the Metro log (`adb logcat -s ReactNativeJS` also has it). Revert the edit afterwards (`git status --short` must be clean). In Expo Go SDK 57: `appOwnership=expo`, `executionEnvironment=storeClient`.
- Expo Go's red "Failed to start the expo-audio playback service" / "Failed to activate lock screen controls" LogBox entries come only from the native `setActiveForLockScreen` path (no media service in Expo Go). Since commit 1a9a279 the app skips those calls in Expo Go, so a red toast after Phát/× now indicates a stale bundle or a regression, not an expected environment error.
- PlaybackSheet quirks: the sheet's height changes with content (AI note, download row) so chip y-positions shift — screenshot before each tap and re-tap if `1 lần`/chip is still active. The options icon and chips may need a second tap right after a round restart/reload spinner.
- Layout shifts: when the red offline caption is visible the PlayerBar buttons sit ~20 px higher; the Expo Go toast's × overlaps the PlayerBar × — if the toast fades right before your tap you stop the track instead. Safe way to clear the toast stack: tap the toast *body* (opens LogBox) then press "Dismiss" once per entry — never tap the toast × while a PlayerBar is showing. Each fresh `replace()` adds a new lock-screen toast, so a rising toast counter is itself evidence that the source was reloaded (useful for offline→online recovery checks).
- Streamed sources buffer for a while after a seek/reload on the emulator (≈5 s after tap-to-seek, ≈10 s on a resume, up to ≈20 s right after re-enabling wifi/data): the time label shows the target position immediately with a spinner and only advances afterwards — wait it out before calling it a failure. Downloaded (file://) sources land within ~1–2 s.
- Typing Vietnamese diacritics via xdotool `type` opens the emulator Extended Controls; use accent-free search terms ("thap chu", "vang sanh") — the search is diacritic-insensitive. Search results briefly show the whole list before the debounce settles.
- Setting repeat after a track has already ended shows `Biến 1/3` with ▶ but does not auto-restart; press ▶. Pressing × exactly at a round boundary was undone by the auto-repeat restart before 07063b3 — to reproduce/verify, watch the MiniPlayer counter on a short AI track (Chú Vãng Sanh 0:35) and tap × when it reads 0:34.
- Web player (`/[locale]/kinh/[slug]`): Chrome may be launched with `--mute-audio`; rely on the sticky player's `m:ss / M:SS`, `· n/N` title and the amber-ringed `li[data-cue-start]`. Auto-scroll re-centres the active verse on every cue change while playing, so scroll-then-click can hit a different verse than intended — pause first or click quickly.

## Data facts useful for assertions (as of PR #18)
- 3,395 sites (3,324 with coordinates → near-me/map counts show 3.324), 34 provinces (Hà Nội 630, Hải Phòng 117, TP. HCM 1018), 100-item pagination ("Xem thêm (3.295)").
- `chua-cao-linh` has null lat/lng → no Directions button and no mini-map on its detail page; use `dinh-tram-bac` (Hải Phòng, 20.85403/106.57380) or `chua-con-son` to test Directions/mini-map.
- Lunar calendar assertions depend on the emulator clock (UTC). Compute expectations with `node -e` against `mobile/src/lib/lunar.ts` (e.g. 2026-09-08 → 27/7 Bính Ngọ); lunar month 7 has no festivals in the dataset, so the Lịch "Lễ hội" section shows a fallback card with a button instead of rows.
- Favorites/visited persist in AsyncStorage across runs — record the baseline counts on Cá nhân before toggling.

## Devin Secrets Needed
- none
