/*

yarn ts-node --skip-project ./build/fixPrecacheManifest.ts

*/

import * as fs from 'fs-extra'
import { distDir } from '../src/cnst/paths.cnst'

// console.log(distDir)
const precacheManifestFile = fs.readdirSync(distDir).find(f => f.startsWith('precache-manifest'))
console.log(precacheManifestFile)
