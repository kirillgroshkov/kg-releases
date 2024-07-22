// prettier-ignore
module.exports = [
  ...require('@naturalcycles/dev-lib/cfg/eslint.config'),
  {
    rules: {
      'vue/require-v-for-key': 0,
      'vue/valid-v-for': 0,
      'no-useless-assignment': 0, // doesn't work well in *.vue files
    },
  },
]
