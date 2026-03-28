import { defineOxlintConfig, sharedConfig } from '@naturalcycles/dev-lib/cfg/oxlint.config.js'

// oxlint-disable-next-line no-default-export
export default defineOxlintConfig({
  plugins: [...sharedConfig.plugins!, 'vue'],
  rules: {
    // Correctness
    'vue/no-arrow-functions-in-watch': 2,
    'vue/no-deprecated-destroyed-lifecycle': 2,
    'vue/no-export-in-script-setup': 2,
    'vue/no-import-compiler-macros': 2,
    'vue/no-lifecycle-after-await': 2,
    'vue/no-multiple-slot-args': 2,
    'vue/no-required-prop-with-default': 2,
    'vue/no-this-in-before-route-enter': 2,
    'vue/valid-define-emits': 2,
    'vue/valid-define-props': 2,
    // Style
    'vue/define-emits-declaration': 2,
    'vue/define-props-declaration': 2,
    'vue/prefer-import-from-vue': 2,
  },
})
