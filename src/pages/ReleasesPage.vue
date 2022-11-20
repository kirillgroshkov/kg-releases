<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { IsoDateString, LocalDate, localDate, pDelay } from '@naturalcycles/js-lib'
import { mdiChevronUp, mdiChevronDown } from '@mdi/js'
import { useStore } from '@/store'
import { withProgress } from '@/decorators/decorators'
import { ReleasesByDay } from '@/srv/model'
import { releasesService } from '@/srv/releases.service'
import { timeHM, unixtimePretty } from '@/filters/filters'

const expandedRows = ref(new Set<string>())
const maxReleases = ref(30)
const dayFirst = ref<IsoDateString>('')
const dayLast = ref<IsoDateString | null>('')
const dayLoading = ref<IsoDateString>('')
const dayMax = ref<IsoDateString>('')
const releasesByDay = ref<ReleasesByDay>({})

// const dayNext = computed((): IsoDateString => {
//   if (!dayLast.value) return ''
//
//   return localDate(dayLast.value).subtract(1, 'day').toISODate()
// })

const days = computed((): IsoDateString[] => {
  const days: IsoDateString[] = []
  if (!dayFirst.value || !dayLast.value) return []

  // range can be used here
  for (
    let day = localDate(dayFirst.value);
    day.toISODate() >= dayLast.value;
    day = day.subtract(1, 'day')
  ) {
    days.push(day.toISODate())
  }

  return days
})

useEventListener(document, 'visibilitychange', async () => {
  if (document.visibilityState !== 'visible') return
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
    const today = LocalDate.todayUTC()
    const todayStr = today.toISODate()
    dayMax.value = today.subtract(30, 'day').toISODate()
    releasesByDay.value = store.getReleasesByDay()
    dayFirst.value = todayStr
    dayLast.value = store.getReleasesLastDay() || todayStr

    await pDelay(1000) // give time for animations to finish
    dayLast.value = await loadDay(today, 0)
    dayLoading.value = ''
    // console.log('dayLast end: ' + this.dayLast)

    // cleanAfterLastDay
    store.cleanAfterLastDay(dayLast.value)
  })
  loading.value = false
}

async function loadDay(day: LocalDate, loaded: number): Promise<string> {
  const dayStr = day.toISODate()
  dayLoading.value = dayStr
  const nextDay = day.add(1, 'day')
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
    const yesterday = day.subtract(1, 'day')
    return await loadDay(yesterday, loaded)
  }

  return dayStr
}

async function loadMore(): Promise<void> {
  const releasesCount = Object.keys(store.releases).length
  maxReleases.value = releasesCount + 30
  dayMax.value = localDate(dayMax.value).subtract(30, 'day').toISODate()
  const dayNext = localDate(dayLast.value!).subtract(1, 'day')
  dayLast.value = await loadDay(dayNext, releasesCount)
  dayLoading.value = ''
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
                reload
              </v-btn>
            </td>
          </tr>
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
          <template v-for="day in days">
            <table
              v-if="(releasesByDay[day] || []).length"
              border="0"
              cellspacing="0"
              cellpadding="6"
              class="table1"
            >
              <tr>
                <td colspan="3" style="padding-left: 66px">
                  {{ day }}
                </td>
              </tr>
            </table>

            <table border="0" cellspacing="0" cellpadding="6" class="table1">
              <template v-for="r in releasesByDay[day]">
                <tr class="mainTr" @click="toggleClick(r.id, $event)">
                  <td style="width: 66px; padding: 8px 0 0px 12px; vertical-align: top">
                    <img :src="r.avatarUrl" style="width: 40px; height: 40px" loading="lazy" />
                  </td>
                  <td style="vertical-align: top; padding: 8px 0 0">
                    {{ r.repoFullName }} <br />
                    <span class="ver">{{ r.tagName }}</span>
                  </td>
                  <td style="width: 80px; text-align: right; vertical-align: top; padding-top: 7px">
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
                  <tr v-if="expandedRows.has(r.id)" @click="toggleClick(r.id, $event)">
                    <td colspan="3" style="padding: 0 10px 10px 16px; word-wrap: break-word">
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
                      </div>

                      <div class="md" @click="descrClick($event)" v-html="r.descrHtml" />
                    </td>
                  </tr>
                </transition>
              </template>
            </table>
          </template>

          <table
            v-if="!dayLoading && !store.getReleasesCount()"
            border="0"
            cellspacing="0"
            cellpadding="6"
            class="table1"
          >
            <tr>
              <td colspan="3">
                You have 0 releases in last 30 days. Either you have too few starred projects or
                maybe there's a glitch in the system, so check back in 10 minutes.
              </td>
            </tr>
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
                <v-btn color="primary" @click="loadMore()"> load more </v-btn>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/var';

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

  #{$active} {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.1s ease-in;
  }
}

.table1 {
  width: 100% !important;
  max-width: 500px;
  table-layout: fixed;
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
