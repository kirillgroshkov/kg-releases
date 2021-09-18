module.exports = {
  extends: './node_modules/@naturalcycles/dev-lib/cfg/eslint.config.js',
  env: {
    browser: true,
  },
  rules: {
    'vue/require-v-for-key': 0,
    'vue/valid-v-for': 0,
  },
}
