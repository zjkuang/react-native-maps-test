# Setting Up the Test App

This app was created to reproduce and test a react-native-maps issue where Marker child components with remote images fail to render on Android with Fabric (New Architecture) enabled.

## 1. Create the Expo Project

Created a new Expo project inside the cloned GitHub repo:

```bash
cd ~/github/react-native-maps-test
npx create-expo-app .
```

This scaffolded an Expo SDK 54 project with React Native 0.81.5 and New Architecture enabled by default (`"newArchEnabled": true` in `app.json`).

## 2. Install react-native-maps

```bash
npx expo install react-native-maps
```

This installed v1.20.1 (the Expo SDK 54 compatible version). Later upgraded to v1.27.1:

```bash
npm install react-native-maps@1.27.1
```

## 3. Install react-native-fast-image (for bug reproduction)

```bash
npm install react-native-fast-image --legacy-peer-deps
```

`--legacy-peer-deps` was needed because FastImage's peer dependency (`react@"^17 || ^18"`) conflicts with React 19.1.0 in Expo SDK 54.

## 4. Generate Native Projects (Prebuild)

The managed Expo project runs via Expo Go, which doesn't allow native code modifications. To test native changes (API key, MapMarker.java patches), prebuilt to generate the `android/` and `ios/` directories:

```bash
npx expo prebuild
```

## 5. Update .gitignore

Expo's default `.gitignore` excludes `android/` and `ios/` (treating them as generated). Since we need custom native modifications, commented out those entries in `.gitignore` to track them in git.

## 6. Add Google Maps API Key

Google Maps SDK for Android requires an API key. Obtained from the [Google Cloud Console](https://console.cloud.google.com/):

1. Created a new project
2. Enabled **Maps SDK for Android**
3. Created an API key under **APIs & Services > Credentials**

Added the key to `android/app/src/main/AndroidManifest.xml`:

```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_API_KEY"/>
```

Note: `app.json`'s `android.config.googleMaps.apiKey` is the Expo-managed way, but since we prebuilt, the key was added directly to `AndroidManifest.xml`.

## 7. Add the Test Tab

Added a "Test" tab to the tab navigator:

- **`app/(tabs)/test.tsx`** — Full-screen `MapView` with a tap-to-place `Marker` containing a remote image and price text
- **`app/(tabs)/_layout.tsx`** — Added the Test tab between Home and Explore with a map icon
- **`components/ui/icon-symbol.tsx`** — Added `'map.fill': 'map'` icon mapping

## 8. Build and Run

```bash
npx expo run:android
```

## Key Findings

| react-native-maps version | `<Image>` (Fresco) in Marker | `<FastImage>` (Glide) in Marker |
|---|---|---|
| v1.27.1 | Works | Blank |

- v1.27.1 fixed the issue for React Native's built-in `<Image>` (Fresco-backed)
- Glide-backed image libraries (`react-native-fast-image`) remain broken on Fabric
- All other Marker child content (Views, Text, borders, backgrounds) renders correctly on both versions
