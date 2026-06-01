<template>
  <div id="app">
    <div class="hdr">
      <div>
        <div class="hdr-title">ចំណាយប្រចាំថ្ងៃ</div>
        <div class="hdr-month">{{ currentMonthYear }}</div>
      </div>
      <div class="hdr-avatar" @click="showProfile = true" style="overflow: hidden; padding: 0; display: flex; justify-content: center; align-items: center;">
        <img v-if="tgUser?.photo_url" :src="tgUser.photo_url" alt="avatar" style="width: 100%; height: 100%; object-fit: cover;" />
        <span v-else>{{ userInitial }}</span>
      </div>
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

    <!-- Profile Info Sheet -->
    <div v-if="showProfile" class="overlay" @click.self="showProfile = false">
      <div class="sheet slide-up">
        <div class="sheet-handle"></div>
        <div class="sheet-title">ព័ត៌មានគណនី (Profile Info)</div>
        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 24px;">
          <img v-if="tgUser?.photo_url" :src="tgUser.photo_url" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 12px; border: 2px solid #2563eb; box-shadow: 0 4px 12px rgba(37,99,235,0.2);" />
          <div v-else style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">{{ userInitial }}</div>
          
          <div style="font-size: 18px; font-weight: bold; color: #1e3a8a;">{{ tgUser?.first_name || 'អ្នកប្រើប្រាស់' }} {{ tgUser?.last_name || '' }}</div>
          <div v-if="tgUser?.username" style="font-size: 14px; color: #64748b; margin-top: 4px;">@{{ tgUser.username }}</div>
          <div style="font-size: 12px; color: #9ca3af; margin-top: 8px;">ID: {{ tgUser?.id || 'N/A' }}</div>
        </div>
        <button class="form-btn" style="background: rgba(255,255,255,0.6); color: #1e293b; border: 1px solid rgba(0,0,0,0.1);" @click="showProfile = false">បិទ (Close)</button>
      </div>
    </div>
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
const showProfile = ref(false);

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
