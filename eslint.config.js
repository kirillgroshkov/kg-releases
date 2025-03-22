import sharedConfig from '@naturalcycles/dev-lib/cfg/eslint.config.js'

export default [
  ...sharedConfig,
  {
    rules: {
      'vue/require-v-for-key': 0,
      'vue/valid-v-for': 0,
      'no-useless-assignment': 0, // doesn't work well in *.vue files
    },
  },
]
