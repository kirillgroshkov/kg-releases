import { expect, it } from 'vitest'
import { isCanonicalSemverTag } from '#src/srv/model.js'

// Same cases as in the Backend's test, keep in sync
const canonical = [
  '44.222.4',
  '3.2.0',
  'v7.4.2',
  'v1.2.0',
  'v2026.11.2',
  '1.2',
  'v1',
  '7',
  'V1.2.3',
  '0.0.0',
  // Prefixed (monorepos)
  'jackson-module-kotlin-3.3.0',
  'agent-skills-v0.4440.0',
  'router-utils@1.163.0',
  '@scope/pkg@1.2.3',
  'tools/v0.5.0',
  'release_1.2',
]

const nonCanonical = [
  '1.67.1.dev20261107',
  'cmux-app-ffi-b9867f610b6025ae8cd937a7b7bffea0aabbce8e',
  '2fc131eeb4a3-1794109014',
  '5e1a27a9bcc4-1794101135',
  'v0.0.0-0.nightly.2026.11.08',
  // Pre-releases and builds
  'v2.0.0-beta.1',
  '1.0.0-rc1',
  'v2.0.0-1',
  '1.2.3+build.5',
  // Not MAJOR.MINOR.PATCH
  '1.2.3.4',
  '2024.01.15', // leading zero
  'v01.2.3',
  'nightly',
  'latest',
  'v',
  '',
  // Prefixed bare number (build number / timestamp)
  'build-123',
  'pkg@7',
]

it.each(canonical)('should be canonical: %s', tag => {
  expect(isCanonicalSemverTag(tag)).toBe(true)
})

it.each(nonCanonical)('should not be canonical: %s', tag => {
  expect(isCanonicalSemverTag(tag)).toBe(false)
})
