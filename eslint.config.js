// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // Prefer generic array types (Array<T>) for new code.
      // Disable the default rule from eslint-config-expo that enforces T[].
      '@typescript-eslint/array-type': 'off',
    },
  },
]);
