<script setup lang="ts">
import type { WeeklySlot } from '../data/types'

defineProps<{
  slot: WeeklySlot
  label: string
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <span :class="['slot-badge', `slot-badge--${slot}`, `slot-badge--${size ?? 'sm'}`]">
    <span class="dot" aria-hidden="true"></span>
    {{ label }}
  </span>
</template>

<style scoped>
.slot-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  line-height: 1.4;
  color: #fff;
  background: var(--ink);
  white-space: nowrap;
}

.slot-badge--md {
  font-size: 13px;
  padding: 5px 12px;
}

.slot-badge--lg {
  font-size: 15px;
  padding: 7px 16px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
}

.slot-badge--hottest {
  background: var(--slot-hottest);
}

.slot-badge--influential {
  background: var(--slot-influential);
}

.slot-badge--creative {
  background: var(--slot-creative);
}
</style>
