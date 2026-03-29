<script setup lang="ts">
import { mdiChevronUp, mdiChevronDown } from '@mdi/js'
import { localDate } from '@naturalcycles/js-lib/datetime'
import type { LocalDate } from '@naturalcycles/js-lib/datetime'
import type { IsoDate, UnixTimestamp } from '@naturalcycles/js-lib/types'
import { useEventListener } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { withProgress } from '@/decorators/decorators'
import { timeHM, unixtimePretty } from '@/filters/filters'
import type { Release, ReleasesByDay } from '@/srv/model'
import { releasesService } from '@/srv/releases.service'
import { useStore } from '@/store'

interface ReleaseGroup {
  repo: string
  avatarUrl?: string
  latestPublished: UnixTimestamp
  releases: Release[]
}

const expandedRows = ref(new Set<string>())
const expandedGroups = ref(new Set<string>())
const maxReleases = ref(30)
const dayFirst = ref<IsoDate>('' as IsoDate)
const dayLast = ref<IsoDate | null>('' as IsoDate)
const dayLoading = ref<IsoDate>('' as IsoDate)
const dayMax = ref<IsoDate>('' as IsoDate)
const releasesByDay = ref<ReleasesByDay>({})

// const dayNext = computed((): IsoDate => {
//   if (!dayLast.value) return ''
//
//   return localDate(dayLast.value).subtract(1, 'day').toISODate()
// })

const days = computed((): IsoDate[] => {
  if (!dayFirst.value || !dayLast.value) return []

  return localDate
    .range(dayLast.value, dayFirst.value, '[]')
    .map(d => d.toISODate())
    .reverse()
})

const groupsByDay = computed((): Record<IsoDate, ReleaseGroup[]> => {
  const result: Record<IsoDate, ReleaseGroup[]> = {}

  for (const day of days.value) {
    const releases = releasesByDay.value[day] || []
    const repoMap: Record<string, Release[]> = {}

    for (const r of releases) {
      ;(repoMap[r.repoFullName] ||= []).push(r)
    }

    result[day] = Object.entries(repoMap).map(([repo, groupReleases]) => ({
      repo,
      avatarUrl: groupReleases[0]!.avatarUrl,
      latestPublished: groupReleases[0]!.published,
      releases: groupReleases,
    }))
  }

  return result
})

function groupKey(day: IsoDate, repo: string): string {
  return `${day}_${repo}`
}

function toggleGroup(day: IsoDate, repo: string): void {
  const key = groupKey(day, repo)
  if (expandedGroups.value.has(key)) {
    expandedGroups.value.delete(key)
  } else {
    expandedGroups.value.add(key)
  }
  expandedGroups.value = new Set(expandedGroups.value)
}

let lastAutoReload = 0

useEventListener(document, 'visibilitychange', async () => {
  if (document.visibilityState !== 'visible') return
  if (Date.now() - lastAutoReload < 60_000) return
  lastAutoReload = Date.now()
  await reload()
})

onMounted(async () => {
  await reload()
})

const store = useStore()
const loading = ref(false)

async function reload(): Promise<void> {
  if (loading.value) return // don't start new request
  loading.value = true // a bit naive now
  await withProgress(async () => {
    maxReleases.value = 30
    const today = localDate.todayInUTC()
    const todayStr = today.toISODate()
    dayMax.value = today.minus(30, 'day').toISODate()
    releasesByDay.value = store.getReleasesByDay()
    dayFirst.value = todayStr
    dayLast.value = store.getReleasesLastDay() || todayStr

    // await pDelay(1000) // give time for animations to finish
    dayLast.value = await loadDay(today, 0)
    dayLoading.value = '' as IsoDate
    // console.log('dayLast end: ' + this.dayLast)

    // cleanAfterLastDay
    store.cleanAfterLastDay(dayLast.value)
  })
  loading.value = false
}

async function loadDay(day: LocalDate, loaded: number): Promise<IsoDate> {
  const dayStr = day.toISODate()
  dayLoading.value = dayStr
  const nextDay = day.plus(1, 'day')
  const nextDayStr = nextDay.toISODate()
  // this.loading = 'loading...'
  // _this.dayLast = dayStr
  dayLast.value = store.getReleasesLastDay()
  // console.log('dayLast: ' + this.dayLast)

  const { releases = [] } = await releasesService.fetchReleases(dayStr, nextDayStr)
  releasesByDay.value = store.getReleasesByDay()
  // this.loading = ''
  // const releasesCount = Object.keys(st().releases).length
  loaded += releases.length
  // console.log('loaded: ' + loaded)

  if (loaded < maxReleases.value && dayStr > dayMax.value) {
    const yesterday = day.minus(1, 'day')
    return await loadDay(yesterday, loaded)
  }

  return dayStr
}

async function loadMore(): Promise<void> {
  const releasesCount = Object.keys(store.releases).length
  maxReleases.value = releasesCount + 30
  dayMax.value = localDate(dayMax.value).minus(30, 'day').toISODate()
  const dayNext = localDate(dayLast.value!).minus(1, 'day')
  dayLast.value = await loadDay(dayNext, releasesCount)
  dayLoading.value = '' as IsoDate
}

function toggleClick(id: string, _$event: MouseEvent): void {
  // console.log($event)

  // if (($event?.target as any)?.nodeName === 'A') alert('target A!')
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id)
  } else {
    expandedRows.value.add(id)
  }
  expandedRows.value = new Set(expandedRows.value)
}

function unstarClick(repoFullName: string): void {
  globalThis.alert(`unstar ${repoFullName}: will be implemented later`)
}

function descrClick($event: MouseEvent): void {
  // $event.preventDefault()
  $event.stopImmediatePropagation()
}
</script>

<template>
  <div>
    <div>
      <div class="container releases">
        <table style="width: 100%; max-width: 500px">
          <tbody>
            <tr>
              <td>
                <pre>
  Last updated: {{ unixtimePretty(store.releasesUpdaterLastFinished) }}
  Starred repos: {{ store.userFM.starredReposCount }}
              </pre
                >
              </td>
              <td style="text-align: right; padding-right: 10px">
                <v-btn
                  color="primary"
                  style="margin-top: -12px"
                  :disabled="store.ghostMode"
                  @click="reload()"
                >
                  Reload
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>

        <!--
        <div v-if="false">
          dayFirst={{ dayFirst }}, dayLast={{ dayLast }}
          <div
            v-for="d in days"
            v-if="false"
          >
            {{ d }} {{ (releasesByDay[d] || []).length }}
          </div>
        </div>
        -->

        <div class="tableRow" style="margin: 0 -16px; padding-bottom: 80px">
          <template v-for="day of days" :key="day">
            <table
              v-if="(releasesByDay[day] || []).length"
              border="0"
              cellspacing="0"
              cellpadding="6"
              class="table1"
            >
              <tbody>
                <tr>
                  <td colspan="3" style="padding-left: 66px">
                    {{ day }}
                  </td>
                </tr>
              </tbody>
            </table>

            <table border="0" cellspacing="0" cellpadding="6" class="table1">
              <tbody>
                <template v-for="group of groupsByDay[day]" :key="group.repo">
                  <!-- Ungrouped: single release from this org, render as before -->
                  <template v-if="group.releases.length === 1">
                    <tr class="mainTr" @click="toggleClick(group.releases[0]!.id, $event)">
                      <td style="width: 66px; padding: 8px 0 0px 12px; vertical-align: top">
                        <img
                          :src="group.releases[0]!.avatarUrl + '&s=80'"
                          style="width: 40px; height: 40px"
                          loading="lazy"
                        />
                      </td>
                      <td style="vertical-align: top; padding: 8px 0 0">
                        {{ group.releases[0]!.repoFullName }} <br />
                        <span class="ver">{{ group.releases[0]!.tagName }}</span>
                      </td>
                      <td
                        style="
                          width: 80px;
                          text-align: right;
                          vertical-align: top;
                          padding-top: 7px;
                        "
                      >
                        {{ timeHM(group.releases[0]!.published) }}
                        <v-icon
                          v-if="expandedRows.has(group.releases[0]!.id)"
                          style="opacity: 0.4"
                          :icon="mdiChevronUp"
                        ></v-icon>
                        <v-icon v-else style="opacity: 0.4" :icon="mdiChevronDown"></v-icon>
                      </td>
                    </tr>

                    <transition name="slide">
                      <tr
                        v-if="expandedRows.has(group.releases[0]!.id)"
                        @click="toggleClick(group.releases[0]!.id, $event)"
                      >
                        <td colspan="3" style="padding: 0 10px 10px 16px; word-wrap: break-word">
                          <div>
                            <v-btn
                              style="margin-left: -4px; margin-top: 10px"
                              :href="`https://github.com/${group.releases[0]!.repoFullName}/releases/tag/${
                                group.releases[0]!.tagName || 'v' + group.releases[0]!.v
                              }`"
                              target="_blank"
                            >
                              view on github
                            </v-btn>
                            <v-btn
                              style="margin-left: 8px; margin-top: 10px"
                              @click.stop="unstarClick(group.releases[0]!.repoFullName)"
                            >
                              unstar
                            </v-btn>
                          </div>

                          <!-- eslint-disable-next-line vue/no-v-html -->
                          <div
                            class="md"
                            @click="descrClick($event)"
                            v-html="group.releases[0]!.descrHtml"
                          />
                        </td>
                      </tr>
                    </transition>
                  </template>

                  <!-- Grouped: multiple releases from this org -->
                  <template v-else>
                    <!-- Group header row -->
                    <tr class="mainTr" @click="toggleGroup(day, group.repo)">
                      <td style="width: 66px; padding: 8px 0 0px 12px; vertical-align: top">
                        <img
                          :src="group.avatarUrl + '&s=80'"
                          style="width: 40px; height: 40px"
                          loading="lazy"
                        />
                      </td>
                      <td style="vertical-align: top; padding: 8px 0 0">
                        {{ group.repo }}
                        <div class="groupTags">
                          <div
                            v-for="r of group.releases.slice(0, group.releases.length > 3 ? 2 : 3)"
                            :key="r.id"
                            class="ver"
                          >
                            {{ r.tagName }}
                          </div>
                          <div v-if="group.releases.length > 3" class="ver">
                            +{{ group.releases.length - 2 }} more
                          </div>
                        </div>
                      </td>
                      <td
                        style="
                          width: 80px;
                          text-align: right;
                          vertical-align: top;
                          padding-top: 7px;
                        "
                      >
                        {{ timeHM(group.latestPublished) }}
                        <v-icon
                          v-if="expandedGroups.has(groupKey(day, group.repo))"
                          style="opacity: 0.4"
                          :icon="mdiChevronUp"
                        ></v-icon>
                        <v-icon v-else style="opacity: 0.4" :icon="mdiChevronDown"></v-icon>
                      </td>
                    </tr>

                    <!-- Expanded group: individual releases -->
                    <template v-if="expandedGroups.has(groupKey(day, group.repo))">
                      <template v-for="r of group.releases" :key="r.id">
                        <tr class="mainTr groupChildTr" @click="toggleClick(r.id, $event)">
                          <td style="width: 66px; padding: 4px 0 4px 24px; vertical-align: middle">
                            <img
                              :src="r.avatarUrl + '&s=80'"
                              style="width: 32px; height: 32px; display: block"
                              loading="lazy"
                            />
                          </td>
                          <td style="vertical-align: middle; padding: 4px 0">
                            <span class="ver">{{ r.tagName }}</span>
                          </td>
                          <td
                            style="
                              width: 80px;
                              text-align: right;
                              vertical-align: middle;
                              padding: 4px 0;
                            "
                          >
                            {{ timeHM(r.published) }}
                            <v-icon
                              v-if="expandedRows.has(r.id)"
                              style="opacity: 0.4"
                              :icon="mdiChevronUp"
                            ></v-icon>
                            <v-icon v-else style="opacity: 0.4" :icon="mdiChevronDown"></v-icon>
                          </td>
                        </tr>

                        <transition name="slide">
                          <tr
                            v-if="expandedRows.has(r.id)"
                            class="groupChildTr"
                            @click="toggleClick(r.id, $event)"
                          >
                            <td
                              colspan="3"
                              style="padding: 0 10px 10px 24px; word-wrap: break-word"
                            >
                              <div>
                                <v-btn
                                  style="margin-left: -4px; margin-top: 10px"
                                  :href="`https://github.com/${r.repoFullName}/releases/tag/${
                                    r.tagName || 'v' + r.v
                                  }`"
                                  target="_blank"
                                >
                                  view on github
                                </v-btn>
                                <v-btn
                                  style="margin-left: 8px; margin-top: 10px"
                                  @click.stop="unstarClick(r.repoFullName)"
                                >
                                  unstar
                                </v-btn>
                              </div>

                              <!-- eslint-disable-next-line vue/no-v-html -->
                              <div class="md" @click="descrClick($event)" v-html="r.descrHtml" />
                            </td>
                          </tr>
                        </transition>
                      </template>
                    </template>
                  </template>
                </template>
              </tbody>
            </table>
          </template>

          <table
            v-if="!dayLoading && !store.getReleasesCount()"
            border="0"
            cellspacing="0"
            cellpadding="6"
            class="table1"
          >
            <tbody>
              <tr>
                <td colspan="3">
                  You have 0 releases in last 30 days. Either you have too few starred projects or
                  maybe there's a glitch in the system, so check back in 10 minutes.
                </td>
              </tr>
            </tbody>
          </table>

          <table
            border="0"
            cellspacing="0"
            cellpadding="6"
            class="table1"
            style="padding: 16px 16px"
          >
            <tr v-if="dayLoading">
              <td colspan="3">loading {{ dayLoading }}...</td>
            </tr>
            <tr v-else>
              <td colspan="3">
                <v-btn color="primary" @click="loadMore()">Load more</v-btn>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../scss/var' as var;

.releases {
  padding: 16px;
  // padding-top: 20px;
}

.ver {
  font-family: 'Courier New';
  font-size: 12px;
  font-weight: bold;
  color: #888;
  line-height: 1;
}

.mainTr {
  transition: all 0.3s ease-out;

  #{var.$active} {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.1s ease-in;
  }
}

.groupTags {
  margin-top: 2px;
  padding-bottom: 6px;
}

.groupChildTr {
  background-color: rgba(0, 0, 0, 0.025);
}

.table1 {
  width: 100% !important;
  max-width: 500px;
  table-layout: fixed;
}

.container pre {
  margin: 0;
}

@media (max-width: 800px) {
  .titleRow h1 {
    // color: pink;
    font-size: 24px;
  }
  .titleRow img {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 500px) {
  .titleRow h1 {
    // color: pink;
    font-size: 18px;
  }
  .titleRow img {
    width: 40px;
    height: 40px;
  }

  .descrRow {
    font-size: 15px;
  }
}
</style>
