# VestoraX Android Release

This Android wrapper does not change the website deployment. The web app still builds from `dist`, and the Android app packages that same build with Capacitor.

## App identity

- App name: `VestoraX-all financial calculator`
- Android package: `com.vestorax.allfinancialcalculator`

## What is already set up

- Capacitor Android project in [android](./android)
- Web-to-Android sync script: `npm run cap:sync`
- Debug APK script: `npm run android:apk:debug`
- Release bundle script: `npm run android:bundle:release`
- Android launcher icons updated to VestoraX branding

## What is still needed on this machine

- Java JDK
- Android Studio
- Android SDK
- A release keystore for Play Store upload

## Build after Android Studio is installed

1. Install Android Studio with the Android SDK and a recent JDK.
2. Run `npm run cap:sync`
3. Run `npm run cap:open:android`
4. In Android Studio, let Gradle finish syncing.
5. Create a release keystore in Android Studio.
6. Build an Android App Bundle:
   `Build` -> `Generate Signed Bundle / APK` -> `Android App Bundle`
7. Upload the generated `.aab` file to Google Play Console.

## Play Store notes

- New Play Store apps must be uploaded as an Android App Bundle (`.aab`).
- Keep `versionCode` increasing for every Play Store upload.
- Store listing assets, privacy policy, data safety answers, and content rating are still required in Play Console.
