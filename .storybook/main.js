// Storybook builds ONLY on GitHub Actions (Pages workflow) — never on the laptop (C-2).
module.exports = {
  stories: ['../src/**/*.stories.jsx'],
  addons: ['@storybook/addon-webpack5-compiler-babel'],
  framework: { name: '@storybook/react-webpack5', options: {} },
  core: { disableTelemetry: true },
  docs: { autodocs: false },
};
