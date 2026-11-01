import type { IsoDate, UnixTimestamp } from '@naturalcycles/js-lib/types'
import { describe, expect, test } from 'vitest'
import { groupReleases } from '#src/pages/releasesLoader.js'
import type { Release } from '#src/srv/model.js'

function release(
  repoFullName: string,
  tagName: string,
  published: number,
  avatarUrl?: string,
): Release {
  return {
    id: `${repoFullName}_${tagName}`,
    repoFullName,
    published: published as UnixTimestamp,
    v: tagName,
    tagName,
    descrHtml: '',
    author: 'a',
    avatarUrl,
  }
}

const d1 = '2026-10-25' as IsoDate
const d2 = '2026-10-24' as IsoDate
const d3 = '2026-10-23' as IsoDate

describe('groupReleases', () => {
  test('groups by repo in order of first appearance, latest release first in each group', () => {
    const byDay = {
      [d1]: [
        release('org/a', 'v3', 300, 'a.png'),
        release('org/b', 'v1', 250, 'b.png'),
        release('org/a', 'v2', 200, 'a.png'),
        release('org/a', 'v1', 100, 'a.png'),
      ],
      [d2]: [release('org/c', 'v1', 50)],
    }

    const groups = groupReleases([d1, d2, d3], byDay)

    expect(Object.keys(groups)).toEqual([d1, d2, d3])
    expect(groups[d1]!.map(g => g.repo)).toEqual(['org/a', 'org/b'])
    expect(groups[d1]![0]).toMatchObject({
      repo: 'org/a',
      avatarUrl: 'a.png',
      latestPublished: 300,
    })
    expect(groups[d1]![0]!.releases.map(r => r.tagName)).toEqual(['v3', 'v2', 'v1'])
    expect(groups[d1]![1]!.releases).toHaveLength(1)
    expect(groups[d2]![0]).toMatchObject({
      repo: 'org/c',
      avatarUrl: undefined,
      latestPublished: 50,
    })
  })

  test('days without releases produce empty groups', () => {
    expect(groupReleases([d1, d2], { [d2]: [] })).toEqual({ [d1]: [], [d2]: [] })
    expect(groupReleases([], {})).toEqual({})
  })
})
