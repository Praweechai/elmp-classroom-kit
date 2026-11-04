const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('eslint', {
  rules: {
    'react/require-default-props': 'off',
  },
  overrides: [
    {
      files: ['src/**/*.test.js', 'src/**/*.test.jsx', 'src/testUtils.jsx', 'src/**/*.stories.jsx', 'src/__fixtures__/**', 'scripts/**'],
      rules: { 'import/no-extraneous-dependencies': ['error', { devDependencies: true }] },
    },
  ],
});
