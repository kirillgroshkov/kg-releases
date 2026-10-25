import { defineOxlintConfig, sharedConfig } from '@naturalcycles/dev-lib/cfg/oxlint.config.js'

// oxlint-disable-next-line no-default-export
export default defineOxlintConfig({
  plugins: [...sharedConfig.plugins!, 'react'],
  rules: {
    'react/rules-of-hooks': 2,
    'react/exhaustive-deps': 2,
    'react/jsx-key': 2,
  },
})
