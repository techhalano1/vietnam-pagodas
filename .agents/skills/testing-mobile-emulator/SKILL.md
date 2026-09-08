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

## Data facts useful for assertions (as of PR #18)
- 3,395 sites (3,324 with coordinates → near-me/map counts show 3.324), 34 provinces (Hà Nội 630, Hải Phòng 117, TP. HCM 1018), 100-item pagination ("Xem thêm (3.295)").
- `chua-cao-linh` has null lat/lng → no Directions button and no mini-map on its detail page; use `dinh-tram-bac` (Hải Phòng, 20.85403/106.57380) or `chua-con-son` to test Directions/mini-map.
- Lunar calendar assertions depend on the emulator clock (UTC). Compute expectations with `node -e` against `mobile/src/lib/lunar.ts` (e.g. 2026-09-08 → 27/7 Bính Ngọ); lunar month 7 has no festivals in the dataset, so the Lịch "Lễ hội" section shows a fallback card with a button instead of rows.
- Favorites/visited persist in AsyncStorage across runs — record the baseline counts on Cá nhân before toggling.

## Devin Secrets Needed
- none
