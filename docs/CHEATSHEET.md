# Cheatsheet: Expo + npm Pitfalls & Solutions

## npm install

### `ERESOLVE` peer dependency conflict with react-native-fast-image

**Problem:** `npm install` fails because `react-native-fast-image` requires `react@^17 || ^18` but the project uses React 19.

**Solution:** Add a `.npmrc` file at the project root:
```
legacy-peer-deps=true
```
This applies automatically to every `npm install` in the project. Prefer this over passing `--legacy-peer-deps` on the command line, which can produce inconsistent dependency trees.

### Missing transitive dependencies after `--legacy-peer-deps`

**Problem:** After `npm install --legacy-peer-deps`, packages like `@expo/metro-runtime`, `@radix-ui/react-slot`, or `@radix-ui/react-compose-refs` are missing. Installing them individually leads to a chain of more missing packages.

**Solution:** Don't pass `--legacy-peer-deps` on the command line. Use the `.npmrc` approach instead, then do a clean install:
```bash
rm -rf node_modules package-lock.json && npm install
```

### Corrupted `package-lock.json` after deleting it

**Problem:** Deleting `package-lock.json` and running `npm install` can produce a broken dependency tree.

**Solution:** If possible, restore `package-lock.json` from git before reinstalling:
```bash
git checkout package-lock.json && rm -rf node_modules && npm install
```
Only delete `package-lock.json` as a last resort.

### `postinstall` (patch-package) doesn't run on `npm install <specific-package>`

**Problem:** Running `npm install react-native-maps` does NOT reliably trigger the `postinstall` script, so `patch-package` doesn't apply patches.

**Solution:** After installing a specific package, manually apply patches:
```bash
npx patch-package
```
Or do a full reinstall which reliably triggers `postinstall`:
```bash
rm -rf node_modules && npm install
```

## patch-package

### Creating a patch

After making changes to a file in `node_modules/`:
```bash
npx patch-package <package-name>
```
**Warning:** This generates a raw diff that may contain garbage entries (unrelated diffs). Open the generated file in `patches/` and manually clean it up, keeping only the intended changes.

### Applying patches

To apply all patches in `patches/`:
```bash
npx patch-package
```
Note: Do NOT pass a package name — that **creates** a patch instead of applying one.

### `npx patch-package <name>` overwrites existing patches

**Problem:** Running `npx patch-package react-native-maps` when `node_modules` has no local changes will overwrite your curated patch with an empty diff.

**Solution:** If this happens, restore from git:
```bash
git checkout patches/react-native-maps+1.27.1.patch
```

### Patch version must match installed version

**Problem:** A patch file named `react-native-maps+1.27.1.patch` only applies to v1.27.1. If you downgrade to v1.26.20, the patch is silently skipped.

**Solution:** Recreate the patch after changing versions, or maintain separate patch files per version.

## Expo

### `npx create-expo-app` creates a nested directory

**Problem:** Running `npx create-expo-app my-app` inside an existing `my-app/` directory creates `my-app/my-app/`.

**Solution:** Use `.` to scaffold into the current directory:
```bash
npx create-expo-app .
```

### `android/` and `ios/` directories not in git

**Problem:** Expo's default `.gitignore` excludes `android/` and `ios/` as generated directories.

**Solution:** If you need to track native modifications (API keys, patches, etc.), comment out these lines in `.gitignore`:
```
# /ios
# /android
```

### Expo Go vs. native builds

**Problem:** Expo Go (managed workflow) pre-bundles common native modules. You can't modify native code (e.g., `MapMarker.java`) without ejecting.

**Solution:** Generate native projects:
```bash
npx expo prebuild
```
Then build natively:
```bash
npx expo run:android --port 8083
```

### Google Maps API key not found (crash on Android)

**Problem:** The app crashes with "API key not found" when opening Google Maps.

**Solution:** Add the key directly to `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_KEY"/>
```
Note: `app.json`'s `android.config.googleMaps.apiKey` is the Expo-managed way but may not apply after `prebuild`.

### Port 8081 already in use

**Problem:** `npx expo run:android` prompts to switch ports because 8081 is occupied.

**Solution:** Specify the port directly:
```bash
npx expo run:android --port 8083
```
Note: `-p` shorthand does NOT work (throws `Unknown argument`).

## npm version pinning

### `^` prefix added automatically

**Problem:** `npm install react-native-maps@1.26.20` writes `"^1.26.20"` in `package.json`, which resolves to the latest 1.x.x (e.g., 1.27.1).

**Solution:** Use `--save-exact` to pin the exact version:
```bash
npm install react-native-maps@1.26.20 --save-exact
```
This writes `"1.26.20"` without the `^`.

## React Native / Fabric

### `tracksViewChanges` is essential for Marker child content on Fabric

**Problem:** On Android with Fabric, setting `tracksViewChanges={false}` on a `<Marker>` causes ALL child content (not just images) to be blank.

**Reason:** The initial bitmap capture during `addToMap` always fails because children have zero dimensions at that point. Content only appears through periodic re-capture via `tracksViewChanges`.

**Solution:** Keep `tracksViewChanges={true}` until all content (including images) has loaded, then set to `false` for performance.

### JS-only hot reload vs. native rebuild

**Problem:** Changes to JavaScript files are picked up by hot reload, but changes to native code (Java/Kotlin/Swift) in `node_modules/` or `android/` require a full native rebuild.

**Solution:** After modifying native files:
```bash
npx expo run:android --port 8083
```
