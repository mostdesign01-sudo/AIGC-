<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useFeed } from './data/useFeed'

const { state, refreshFromApi, apiConfigured } = useFeed()
const menuOpen = ref(false)

onMounted(() => {
  refreshFromApi()
})

const generatedAt = () => {
  const d = new Date(state.feed.generated_at)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
}
</script>

<template>
  <header class="topbar">
    <div class="container topbar__inner">
      <RouterLink to="/" class="brand" @click="menuOpen = false">
        <span class="brand__mark" aria-hidden="true"></span>
        <span class="brand__text">
          <strong>得物 AIGC 创意站</strong>
          <small>每日创意 · 每周 TOP3</small>
        </span>
      </RouterLink>

      <nav :class="['nav', { 'nav--open': menuOpen }]" aria-label="主导航">
        <RouterLink to="/" class="nav__link" exact-active-class="is-active" @click="menuOpen = false">首页</RouterLink>
        <RouterLink to="/days" class="nav__link" active-class="is-active" @click="menuOpen = false">每日归档</RouterLink>
        <RouterLink to="/weeks" class="nav__link" active-class="is-active" @click="menuOpen = false">周榜 TOP3</RouterLink>
      </nav>

      <button class="menu-btn" :aria-expanded="menuOpen" aria-label="菜单" @click="menuOpen = !menuOpen">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <main class="page">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>

  <footer class="footer">
    <div class="container footer__inner">
      <p>
        得物 AIGC 创意站 · 收集行业前沿 AI 创意视频，只做筛选与解读，不编造播放数据。
      </p>
      <p class="footer__meta">
        数据更新于 {{ generatedAt() }}（Asia/Shanghai）
        <template v-if="apiConfigured">
          · 来源：{{ state.source === 'api' ? '实时接口' : '静态快照' }}
          <span v-if="state.loading">（同步中…）</span>
        </template>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(246, 245, 242, 0.86);
  backdrop-filter: saturate(160%) blur(12px);
  -webkit-backdrop-filter: saturate(160%) blur(12px);
  border-bottom: 1px solid var(--line);
}

.topbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 64px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand__mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--ink) 0%, #3a3b40 55%, var(--accent) 56%, var(--accent) 100%);
  flex-shrink: 0;
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand__text strong {
  font-size: 16px;
  letter-spacing: -0.01em;
}

.brand__text small {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.06em;
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav__link {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
  transition: color 0.15s ease, background 0.15s ease;
}

.nav__link:hover {
  color: var(--ink);
}

.nav__link.is-active {
  color: var(--ink);
  background: var(--card);
  box-shadow: 0 1px 0 var(--line);
}

.menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--card);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.menu-btn span {
  display: block;
  width: 16px;
  height: 2px;
  background: var(--ink);
  border-radius: 2px;
}

.page {
  flex: 1;
  padding: 32px 0 64px;
}

.footer {
  border-top: 1px solid var(--line);
  padding: 28px 0 40px;
  color: var(--muted);
  font-size: 13px;
}

.footer__inner {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer__meta {
  color: var(--muted-2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.16s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .topbar__inner {
    height: 58px;
  }
  .brand__text small {
    display: none;
  }
  .menu-btn {
    display: flex;
  }
  .nav {
    position: absolute;
    top: 58px;
    left: 0;
    right: 0;
    display: none;
    flex-direction: column;
    align-items: stretch;
    padding: 8px 16px 12px;
    background: var(--bg);
    border-bottom: 1px solid var(--line);
  }
  .nav--open {
    display: flex;
  }
  .nav__link {
    padding: 12px 14px;
  }
  .page {
    padding-top: 20px;
  }
}
</style>
