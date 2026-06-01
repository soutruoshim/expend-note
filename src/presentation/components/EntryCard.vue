<template>
  <div class="entry-card">
    <div class="entry-left">
      <div class="entry-ico">{{ item.icon || item.categoryIcon }}</div>
      <div>
        <div class="entry-name">
          {{ item.name }} 
          <span v-if="showQty && item.qty > 1" style="color:#9ca3af;font-weight:400;font-size:11px">x{{ item.qty }}</span>
        </div>
        <div class="entry-meta">
          <span v-if="item.date && showDate">{{ item.date }} · </span>
          <span v-if="item.time">{{ item.time }} · </span>
          {{ item.category }}
        </div>
      </div>
    </div>
    <div style="display:flex;align-items:center">
      <div class="entry-amount">{{ totalAmount.toLocaleString() }} ៛</div>
      <button v-if="showDelete" class="entry-delete" @click="$emit('delete', item.id)">×</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  showQty: {
    type: Boolean,
    default: true
  },
  showDate: {
    type: Boolean,
    default: false
  },
  showDelete: {
    type: Boolean,
    default: false
  }
});

defineEmits(['delete']);

const totalAmount = computed(() => {
  if (props.item.qty) {
    return props.item.price * props.item.qty;
  }
  return props.item.price;
});
</script>
