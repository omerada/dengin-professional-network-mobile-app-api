// metro.config.js
// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for additional extensions
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json', 'mjs'];

// Resolver config to handle problematic packages
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force @stomp/stompjs to use UMD bundle instead of ESM
  if (moduleName === '@stomp/stompjs') {
    const stompPath = path.join(
      __dirname,
      'node_modules',
      '@stomp',
      'stompjs',
      'bundles',
      'stomp.umd.js',
    );

    return {
      filePath: stompPath,
      type: 'sourceFile',
    };
  }

  // Default resolver
  return context.resolveRequest(context, moduleName, platform);
};

// Enable inline requires for better performance
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
