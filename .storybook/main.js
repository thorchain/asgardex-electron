module.exports = {
  stories: ['../src/renderer/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-viewport',
    '@storybook/addon-knobs',
    '@react-theming/storybook-addon/register'
  ],
};
