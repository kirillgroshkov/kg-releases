/*

yarn ts-node --skip-project ./build/precacheManifest.ts

*/

import { distDir } from '../src/cnst/paths.cnst'
const workboxBuild = require('workbox-build')

const buildSW = () => {
  return workboxBuild.injectManifest({
    swSrc: `${distDir}/sw.js`,
    swDest: `${distDir}/sw2.js`,
    // swDest: 'build/sw.js',
    globDirectory: 'build',
    globPatterns: [
      '**\/*.{js,css,html,png}',
    ]
  }).then(({count, size, warnings}: any) => {
    // Optionally, log any warnings and details.
    warnings.forEach(console.warn)
    console.log(`${count} files will be precached, totaling ${size} bytes.`)
  })
}

buildSW()
