<script setup lang="ts">
import { RouterLink } from 'vue-router'
import EmptyState from '../components/EmptyState.vue'
</script>

<template>
  <div class="container">
    <EmptyState title="页面不存在" hint="链接可能已失效。">
      <RouterLink to="/" class="btn btn--ghost">回到首页</RouterLink>
    </EmptyState>
  </div>
</template>
