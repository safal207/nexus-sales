const { Config } = require('jest-transform-css');
const path = require('path');

module.exports = new Config({
  // Add your PostCSS configuration here
  postcss: {
    plugins: [
      require('tailwindcss')({
        config: path.resolve(__dirname, 'tailwind.config.js'),
      }),
      require('autoprefixer'),
    ],
  },
  // Enable/disable specific features
  features: {
    // Enable/disable CSS modules
    cssModules: false,
    // Enable/disable CSS-in-JS
    cssInJs: false,
  },
});
