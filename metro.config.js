const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Override the default resolver to force Metro to use the CommonJS version of tslib.
// The ESM version of tslib (modules/index.js) can cause `__extends` undefined errors
// when bundled for web with Apollo Client due to interop mismatch.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/tslib/tslib.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
