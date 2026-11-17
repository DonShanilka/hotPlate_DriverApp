const appJson = require("./app.json");

const appConfig = appJson.expo;
const mapsPlugin = [
  "react-native-maps",
  {
    androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
    iosGoogleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY,
  },
];

module.exports = {
  ...appConfig,
  ios: {
    ...(appConfig.ios || {}),
    bundleIdentifier: appConfig.ios?.bundleIdentifier || "com.hotplatedriverapp",
  },
  android: {
    ...(appConfig.android || {}),
    package: appConfig.android?.package || "com.hotplatedriverapp",
  },
  extra: {
    ...(appConfig.extra || {}),
    googleMapsIOSConfigured: Boolean(process.env.GOOGLE_MAPS_IOS_API_KEY),
  },
  plugins: [...(appConfig.plugins || []), "expo-notifications", mapsPlugin],
};
