<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getVideos, getCrawlerStatus, runCrawler, type Video, type CrawlerStatus } from '../api/video'

const videos = ref<Video[]>([])
const crawlerStatus = ref<CrawlerStatus>({ running: false, last_run: null, videos_collected: 0, current_platform: null, supported_platforms: {} })
const loading = ref(false)
const selectedVideo = ref<Video | null>(null)
const searchQuery = ref('')
const activeTab = ref<'best' | 'all'>('best')
const viewMode = ref<'masonry' | 'timeline'>('masonry')
const selectedPlatform = ref('bilibili')
const showPlatformMenu = ref(false)

const totalVideos = computed(() => videos.value.length)

const filteredVideos = computed(() => {
  if (!searchQuery.value) return videos.value
  const query = searchQuery.value.toLowerCase()
  return videos.value.filter(v =>
    v.title.toLowerCase().includes(query) ||
    v.author?.toLowerCase().includes(query)
  )
})

// 双周最佳（2周内热度最高的12篇）
const bestOfWeek = computed(() => {
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  return filteredVideos.value
    .filter(v => new Date(v.collected_at) >= twoWeeksAgo)
    .sort((a, b) => b.play_count - a.play_count)
    .slice(0, 12)
})

// 按日期分组（最新在前，去掉"本周"）
const groupedByDate = computed(() => {
  const groups: { label: string; date: string; videos: Video[] }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const oneDay = 24 * 60 * 60 * 1000

  filteredVideos.value.forEach(video => {
    const videoDate = new Date(video.collected_at)
    videoDate.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((today.getTime() - videoDate.getTime()) / oneDay)

    let label = ''
    let dateKey = videoDate.toISOString().split('T')[0]

    if (diffDays === 0) {
      label = '今天'
    } else if (diffDays === 1) {
      label = '昨天'
    } else {
      const month = videoDate.getMonth() + 1
      const day = videoDate.getDate()
      label = `${month}月${day}日`
    }

    let group = groups.find(g => g.date === dateKey && g.label === label)
    if (!group) {
      group = { label, date: dateKey, videos: [] }
      groups.push(group)
    }
    group.videos.push(video)
  })

  // 按日期排序（最新在前）
  groups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return groups
})

// 当前显示的视频列表 (用于调试)
// const displayVideos = computed(() => {
//   if (activeTab.value === 'best') {
//     return bestOfWeek.value
//   }
//   return filteredVideos.value
// })

const formatNumber = (num: number): string => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

const getCoverUrl = (video: Video): string => {
  if (video.qiniu_cover_url) return video.qiniu_cover_url
  if (video.cover_url) {
    if (video.cover_url.startsWith('//')) return 'https:' + video.cover_url
    return video.cover_url
  }
  return 'https://via.placeholder.com/300x200?text=No+Cover'
}

const getBilibiliEmbedUrl = (video: Video): string => {
  const bvid = video.url.split('/video/')[1]?.split('?')[0] || ''
  return `https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=1&high_quality=1`
}

// 生成简介（从AI摘要或标题生成）
const getDescription = (video: Video): string => {
  if (video.ai_summary) {
    return video.ai_summary.length > 50 ? video.ai_summary.slice(0, 50) + '...' : video.ai_summary
  }
  // 从标题生成简介
  const title = video.title
  if (title.length <= 50) return title
  return title.slice(0, 47) + '...'
}

const loadVideos = async () => {
  loading.value = true
  try {
    const res = await getVideos(100)
    // 按时间排序（最新在前）
    videos.value = res.data.sort((a, b) =>
      new Date(b.collected_at).getTime() - new Date(a.collected_at).getTime()
    )
  } catch (e) {
    console.error('加载视频失败', e)
  }
  loading.value = false
}

const loadStatus = async () => {
  try {
    crawlerStatus.value = await getCrawlerStatus()
  } catch (e) {
    console.error('获取状态失败', e)
  }
}

const triggerCrawler = async () => {
  try {
    await runCrawler(selectedPlatform.value)
    await loadStatus()
  } catch (e) {
    console.error('触发爬虫失败', e)
  }
}

const selectPlatform = (platform: string) => {
  selectedPlatform.value = platform
  showPlatformMenu.value = false
}

const openVideo = (video: Video) => {
  selectedVideo.value = video
}

const closeModal = () => {
  selectedVideo.value = null
}

const openBilibili = (video: Video) => {
  window.open(video.url, '_blank')
}

// Pinterest风格瀑布流分列（按高度平衡）
const getColumns = (videoList: Video[]) => {
  const cols: Video[][] = [[], [], [], [], []]
  const colHeights = [0, 0, 0, 0, 0]

  videoList.forEach((video) => {
    const minHeightIndex = colHeights.indexOf(Math.min(...colHeights))
    cols[minHeightIndex].push(video)
    const estimatedHeight = 200 + (video.play_count > 100000 ? 50 : 0)
    colHeights[minHeightIndex] += estimatedHeight
  })

  return cols
}

onMounted(() => {
  loadVideos()
  loadStatus()
})
</script>

<template>
  <div class="pinterest-app">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">✨</span>
          <span class="logo-text">AIGC创意</span>
        </div>

        <div class="search-bar">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索AI创意视频..."
            class="search-input"
          />
        </div>

        <div class="header-actions">
          <span class="status-badge">
            {{ crawlerStatus.running ? `🔄 ${crawlerStatus.current_platform || '同步中'}...` : `${totalVideos} 个视频` }}
          </span>

          <button class="btn-refresh" @click="loadVideos" :disabled="loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
            </svg>
          </button>

          <!-- 平台选择 -->
          <div class="platform-selector">
            <button
              class="btn-platform"
              @click="showPlatformMenu = !showPlatformMenu"
              :disabled="crawlerStatus.running"
            >
              {{ crawlerStatus.supported_platforms?.[selectedPlatform] || 'B站' }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div v-if="showPlatformMenu" class="platform-menu">
              <button
                v-for="(name, key) in crawlerStatus.supported_platforms"
                :key="key"
                :class="['platform-option', { active: selectedPlatform === key }]"
                @click="selectPlatform(key)"
              >
                {{ name }}
              </button>
            </div>
          </div>

          <button class="btn-primary" @click="triggerCrawler" :disabled="crawlerStatus.running">
            抓取新视频
          </button>
        </div>
      </div>
    </header>

    <!-- TAB导航 -->
    <nav class="tab-nav">
      <div class="tab-container">
        <button
          :class="['tab-btn', { active: activeTab === 'best' }]"
          @click="activeTab = 'best'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          双周最佳
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'all' }]"
          @click="activeTab = 'all'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          全部视频
        </button>

        <!-- 视图切换（仅在全部视频时显示） -->
        <div v-if="activeTab === 'all'" class="view-toggle">
          <button
            :class="{ active: viewMode === 'masonry' }"
            @click="viewMode = 'masonry'"
            title="瀑布流"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="10"></rect>
              <rect x="14" y="3" width="7" height="6"></rect>
              <rect x="14" y="13" width="7" height="8"></rect>
              <rect x="3" y="17" width="7" height="4"></rect>
            </svg>
          </button>
          <button
            :class="{ active: viewMode === 'timeline' }"
            @click="viewMode = 'timeline'"
            title="时间线"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="2" x2="12" y2="22"></line>
              <circle cx="12" cy="6" r="3"></circle>
              <circle cx="12" cy="12" r="3"></circle>
              <circle cx="12" cy="18" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 双周最佳 -->
      <template v-if="activeTab === 'best'">
        <div class="best-section">
          <div class="best-header">
            <h2>🔥 双周最佳</h2>
            <p>过去14天热度最高的12个AI创意视频</p>
          </div>

          <div class="masonry-grid best-grid">
            <div class="masonry-column" v-for="(col, i) in getColumns(bestOfWeek)" :key="i">
              <div
                class="pin-card best-card"
                v-for="video in col"
                :key="video.id"
                @click="openVideo(video)"
              >
                <div class="rank-badge" v-if="video === bestOfWeek[0]">TOP 1</div>
                <div class="pin-image-wrapper">
                  <img
                    :src="getCoverUrl(video)"
                    :alt="video.title"
                    loading="lazy"
                    class="pin-image"
                    @error="(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error'"
                  />
                  <div class="pin-overlay">
                    <button class="overlay-btn" @click.stop="openBilibili(video)">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 9l-7 5-7-5V7l7 5 7-5v2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="pin-info">
                  <h3 class="pin-title">{{ video.title }}</h3>
                  <p class="pin-desc">{{ getDescription(video) }}</p>
                  <div class="pin-meta">
                    <span class="author">{{ video.author }}</span>
                    <span class="stats">
                      <span>▶ {{ formatNumber(video.play_count) }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="bestOfWeek.length === 0" class="empty-best">
            <p>暂无数据，快去抓取视频吧！</p>
          </div>
        </div>
      </template>

      <!-- 全部视频 -->
      <template v-else>
        <!-- 瀑布流视图 -->
        <template v-if="viewMode === 'masonry'">
          <div v-for="group in groupedByDate" :key="group.date" class="date-section">
            <div class="date-header">
              <span class="date-label">{{ group.label }}</span>
              <span class="date-count">{{ group.videos.length }} 个视频</span>
            </div>
            <div class="masonry-grid">
              <div class="masonry-column" v-for="(col, i) in getColumns(group.videos)" :key="i">
                <div
                  class="pin-card"
                  v-for="video in col"
                  :key="video.id"
                  @click="openVideo(video)"
                >
                  <div class="pin-image-wrapper">
                    <img
                      :src="getCoverUrl(video)"
                      :alt="video.title"
                      loading="lazy"
                      class="pin-image"
                      @error="(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error'"
                    />
                    <div class="pin-overlay">
                      <button class="overlay-btn" @click.stop="openBilibili(video)">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 9l-7 5-7-5V7l7 5 7-5v2z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="pin-info">
                    <h3 class="pin-title">{{ video.title }}</h3>
                    <p class="pin-desc">{{ getDescription(video) }}</p>
                    <div class="pin-meta">
                      <span class="author">{{ video.author }}</span>
                      <span class="stats">
                        <span>▶ {{ formatNumber(video.play_count) }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 时间线视图 -->
        <template v-else>
          <div class="timeline-view">
            <div v-for="group in groupedByDate" :key="group.date" class="timeline-group">
              <div class="timeline-header">
                <div class="timeline-dot"></div>
                <span class="timeline-date">{{ group.label }}</span>
                <span class="timeline-count">{{ group.videos.length }} 个视频</span>
              </div>
              <div class="timeline-cards">
                <div
                  class="timeline-card"
                  v-for="video in group.videos"
                  :key="video.id"
                  @click="openVideo(video)"
                >
                  <img
                    :src="getCoverUrl(video)"
                    :alt="video.title"
                    class="timeline-cover"
                    loading="lazy"
                    @error="(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error'"
                  />
                  <div class="timeline-info">
                    <h3 class="timeline-title">{{ video.title }}</h3>
                    <p class="timeline-desc">{{ getDescription(video) }}</p>
                    <div class="timeline-meta">
                      <span class="author">{{ video.author }}</span>
                      <span class="stats">▶ {{ formatNumber(video.play_count) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && filteredVideos.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>暂无视频数据</p>
        <button class="btn-primary" @click="triggerCrawler">开始抓取</button>
      </div>
    </main>

    <!-- 视频详情弹窗 -->
    <div v-if="selectedVideo" class="modal-backdrop" @click="closeModal">
      <div class="modal-container" @click.stop>
        <button class="modal-close" @click="closeModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>

        <div class="modal-body">
          <div class="video-player-wrapper">
            <iframe
              :src="getBilibiliEmbedUrl(selectedVideo)"
              class="video-player"
              frameborder="0"
              allowfullscreen
              allow="autoplay; fullscreen"
            ></iframe>
          </div>

          <div class="modal-info">
            <h2 class="modal-title">{{ selectedVideo.title }}</h2>

            <p class="modal-desc">{{ getDescription(selectedVideo) }}</p>

            <div class="modal-stats">
              <span class="stat-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                {{ formatNumber(selectedVideo.play_count) }}
              </span>
              <span class="stat-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {{ formatNumber(selectedVideo.like_count) }}
              </span>
              <span class="stat-item author">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {{ selectedVideo.author }}
              </span>
            </div>

            <p v-if="selectedVideo.ai_summary" class="ai-summary">
              {{ selectedVideo.ai_summary }}
            </p>

            <div class="modal-actions">
              <button class="btn-outline" @click="openBilibili(selectedVideo)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                在B站打开
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 基础变量 */
:root {
  --primary-color: #e60023;
  --primary-hover: #ad081b;
  --bg-color: #fff;
  --bg-secondary: #f0f0f0;
  --text-primary: #111;
  --text-secondary: #767676;
  --border-radius: 16px;
  --card-shadow: 0 1px 2px rgba(0,0,0,0.1);
  --card-shadow-hover: 0 8px 16px rgba(0,0,0,0.15);
}

.pinterest-app {
  min-height: 100vh;
  background: var(--bg-color);
}

/* 顶部导航 */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-color);
  border-bottom: 1px solid #efefef;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.search-bar {
  flex: 1;
  max-width: 600px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: none;
  border-radius: 24px;
  background: var(--bg-secondary);
  font-size: 16px;
  color: var(--text-primary);
  transition: background 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  outline: none;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(230, 0, 35, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-radius: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}

.btn-refresh {
  padding: 10px;
  background: var(--bg-secondary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-refresh:hover {
  background: #e0e0e0;
}

.btn-refresh svg {
  width: 20px;
  height: 20px;
  color: var(--text-primary);
}

.btn-primary {
  padding: 12px 20px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 平台选择器 */
.platform-selector {
  position: relative;
}

.btn-platform {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s;
}

.btn-platform:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-platform:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-platform svg {
  width: 16px;
  height: 16px;
}

.platform-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 8px;
  min-width: 140px;
  z-index: 200;
}

.platform-option {
  display: block;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}

.platform-option:hover {
  background: var(--bg-secondary);
}

.platform-option.active {
  background: var(--primary-color);
  color: #fff;
}

/* TAB导航 */
.tab-nav {
  background: #fff;
  border-bottom: 1px solid #efefef;
  position: sticky;
  top: 57px;
  z-index: 99;
}

.tab-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--text-primary);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 3px 3px 0 0;
}

.tab-btn svg {
  width: 18px;
  height: 18px;
}

/* 视图切换 */
.view-toggle {
  display: flex;
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 4px;
  margin-left: auto;
}

.view-toggle button {
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.view-toggle button:hover {
  background: rgba(0,0,0,0.05);
}

.view-toggle button.active {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.view-toggle button svg {
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
}

.view-toggle button.active svg {
  color: var(--text-primary);
}

/* 主内容区 */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 20px;
}

/* 双周最佳 */
.best-section {
  margin-bottom: 40px;
}

.best-header {
  text-align: center;
  margin-bottom: 32px;
}

.best-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.best-header p {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.best-grid {
  margin-top: 24px;
}

.best-card {
  position: relative;
}

.rank-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
  z-index: 2;
}

/* 日期分组 */
.date-section {
  margin-bottom: 40px;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #efefef;
}

.date-label {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.date-count {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Pinterest风格瀑布流 */
.masonry-grid {
  display: flex;
  gap: 16px;
}

.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 卡片样式 */
.pin-card {
  background: #fff;
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  break-inside: avoid;
}

.pin-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--card-shadow-hover);
}

.pin-image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius);
}

.pin-image {
  width: 100%;
  display: block;
  transition: transform 0.3s;
}

.pin-card:hover .pin-image {
  transform: scale(1.02);
}

.pin-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 12px;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.pin-card:hover .pin-overlay {
  opacity: 1;
}

.overlay-btn {
  width: 32px;
  height: 32px;
  background: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.overlay-btn:hover {
  transform: scale(1.1);
}

.overlay-btn svg {
  width: 16px;
  height: 16px;
  color: var(--text-primary);
}

.pin-info {
  padding: 12px;
}

.pin-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pin-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 8px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pin-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}

.author {
  font-weight: 500;
}

/* 时间线视图 */
.timeline-view {
  max-width: 900px;
  margin: 0 auto;
}

.timeline-group {
  margin-bottom: 40px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
}

.timeline-header::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 32px;
  bottom: -40px;
  width: 2px;
  background: #e0e0e0;
}

.timeline-group:last-child .timeline-header::before {
  display: none;
}

.timeline-dot {
  width: 14px;
  height: 14px;
  background: var(--primary-color);
  border-radius: 50%;
  position: relative;
  z-index: 1;
}

.timeline-date {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.timeline-count {
  font-size: 14px;
  color: var(--text-secondary);
}

.timeline-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding-left: 30px;
}

.timeline-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  border: 1px solid #efefef;
}

.timeline-card:hover {
  box-shadow: var(--card-shadow-hover);
}

.timeline-cover {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.timeline-info {
  flex: 1;
  min-width: 0;
}

.timeline-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.timeline-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.timeline-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}

.empty-best {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}

/* 加载和空状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-secondary);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.empty-icon {
  font-size: 48px;
}

.empty-state p {
  font-size: 16px;
  color: var(--text-secondary);
}

/* 弹窗 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: #fff;
  border-radius: 24px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: background 0.2s;
}

.modal-close:hover {
  background: var(--bg-secondary);
}

.modal-close svg {
  width: 20px;
  height: 20px;
  color: var(--text-primary);
}

.modal-body {
  display: flex;
  flex-direction: column;
}

.video-player-wrapper {
  aspect-ratio: 16 / 9;
  background: #000;
}

.video-player {
  width: 100%;
  height: 100%;
}

.modal-info {
  padding: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px;
  line-height: 1.4;
}

.modal-desc {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 16px;
}

.modal-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

.stat-item svg {
  width: 16px;
  height: 16px;
}

.stat-item.author {
  color: var(--text-primary);
  font-weight: 500;
}

.ai-summary {
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-outline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #fff;
  border: 2px solid var(--text-primary);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s;
}

.btn-outline:hover {
  background: var(--text-primary);
  color: #fff;
}

.btn-outline svg {
  width: 16px;
  height: 16px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .masonry-grid {
    gap: 12px;
  }
  .masonry-column {
    gap: 12px;
  }
}

@media (max-width: 992px) {
  .masonry-column:nth-child(5) {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 12px;
  }

  .search-bar {
    order: 3;
    max-width: 100%;
    width: 100%;
  }

  .masonry-column:nth-child(4) {
    display: none;
  }

  .modal-container {
    border-radius: 16px;
  }

  .timeline-cards {
    grid-template-columns: 1fr;
  }

  .tab-btn {
    padding: 12px 16px;
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .masonry-column:nth-child(3) {
    display: none;
  }

  .header-actions {
    flex: 1;
    justify-content: flex-end;
  }

  .status-badge {
    display: none;
  }

  .tab-container {
    padding: 0 12px;
  }

  .view-toggle {
    display: none;
  }
}
</style>
