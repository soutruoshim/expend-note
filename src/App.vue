<template>
  <div id="app">
    <div class="hdr">
      <div>
        <div class="hdr-title">ចំណាយប្រចាំថ្ងៃ</div>
        <div class="hdr-month">{{ currentMonthYear }}</div>
      </div>
      <div class="hdr-avatar">{{ userInitial }}</div>
    </div>
    
    <div class="nav-tabs">
      <div v-for="t in tabs" :key="t.id" :class="['nav-tab', tab===t.id&&'active']" @click="tab=t.id">{{t.label}}</div>
    </div>

    <div class="body-content">
      <TodayView 
        v-if="tab === 'today'" 
        :tracker="tracker" 
        @openSheet="showSheet = true" 
      />
      <ReportView 
        v-if="tab === 'report'" 
        :tracker="tracker" 
      />
      <SettingsView 
        v-if="tab === 'settings'" 
        :tracker="tracker" 
      />
    </div>

    <button class="fab" @click="showSheet = true" v-if="tab === 'today'">+</button>

    <nav class="bottom-nav">
      <button v-for="b in bottomNav" :key="b.id" :class="['bn-btn', tab===b.id&&'active']" @click="tab=b.id">
        <span class="bi">{{b.icon}}</span>
        <span class="bl">{{b.label}}</span>
      </button>
    </nav>

    <AddExpenseSheet 
      :show="showSheet" 
      :products="tracker.products.value"
      :categories="tracker.categories.value"
      :iconOptions="tracker.iconOptions.value"
      @close="showSheet = false"
      @add="tracker.addExpense"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useExpenseTracker } from './presentation/composables/useExpenseTracker';
import TodayView from './presentation/views/TodayView.vue';
import ReportView from './presentation/views/ReportView.vue';
import SettingsView from './presentation/views/SettingsView.vue';
import AddExpenseSheet from './presentation/components/AddExpenseSheet.vue';

const tab = ref('today');
const showSheet = ref(false);

const tgUser = ref(null);
const userInitial = computed(() => {
  if (tgUser.value && tgUser.value.first_name) {
    return tgUser.value.first_name.charAt(0).toUpperCase();
  }
  return 'ណ';
});

onMounted(() => {
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.ready();
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      tgUser.value = tg.initDataUnsafe.user;
    }
  }
});

// Initialize our tracker
const tracker = useExpenseTracker();

const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const currentMonthYear = computed(() => {
  const dateStr = tracker.activeDate.value;
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${khmerMonths[d.getMonth()]} ${d.getFullYear()}`;
});
const tabs = [
  { id: 'today', label: 'ថ្ងៃនេះ' },
  { id: 'report', label: 'របាយការណ៍' },
  { id: 'settings', label: 'ការកំណត់' }
];

const bottomNav = [
  { id: 'today', icon: '📋', label: 'ថ្ងៃនេះ' },
  { id: 'report', icon: '📊', label: 'របាយការណ៍' },
  { id: 'settings', icon: '⚙️', label: 'ការកំណត់' }
];

</script>
