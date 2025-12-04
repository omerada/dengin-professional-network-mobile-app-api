module.exports = function (api) {
  api.cache(true);

  const plugins = [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@features': './src/features',
          '@core': './src/core',
          '@shared': './src/shared',
          '@theme': './src/theme',
          '@contexts': './src/contexts',
          '@config': './src/config',
          '@assets': './assets',
        },
      },
    ],
  ];

  // Only add reanimated plugin in non-test environment
  if (process.env.NODE_ENV !== 'test') {
    plugins.push('react-native-reanimated/plugin');
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
