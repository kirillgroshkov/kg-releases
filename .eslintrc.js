module.exports = {
  root: true,
  extends: [
    './node_modules/@naturalcycles/dev-lib/cfg/eslint.config.js',
    './node_modules/@naturalcycles/dev-lib/cfg/eslint-vue3.config.js',
  ],
  env: {
    browser: true,
  },
  rules: {
    'vue/require-v-for-key': 0,
    'vue/valid-v-for': 0,
    'no-useless-assignment': 0, // doesn't work well in *.vue files
  },
}
