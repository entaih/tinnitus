// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const globals = require('globals');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', 'ios/*', 'android/*', 'docs/*'],
  },
  {
    // React Compiler is not enabled (app.json experiments.reactCompiler is unset), so the compiler-safety rules
    // are advisories here, not runtime defects. Keep them visible as warnings until the compiler is adopted.
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  },
]);
