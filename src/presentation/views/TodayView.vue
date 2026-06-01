<template>
  <div>
    <div class="week-nav-container">
      <button class="week-nav-btn" @click="tracker.prevWeek()">‹</button>
      <div class="week-row">
        <button 
          v-for="d in tracker.weekDays.value" 
          :key="d.date" 
          :class="['day-pill', tracker.activeDate.value === d.date && 'active']" 
          @click="tracker.activeDate.value = d.date">
          <span class="dn">{{ d.name }}</span>
          <span class="dd">{{ d.number }}</span>
        </button>
      </div>
      <button class="week-nav-btn" @click="tracker.nextWeek()">›</button>
    </div>
    
    <div class="summary-card">
      <div class="sc-row">
        <div>
          <div class="sc-label">{{ tracker.activeDateLabel.value }}</div>
          <div class="sc-amount">{{ tracker.totalSpent.value.toLocaleString() }} ៛</div>
          <div class="sc-sub">{{ tracker.currentDayEntries.value.length }} មុខ</div>
        </div>
        <div class="sc-badge">{{ (tracker.totalSpent.value / 4000).toFixed(1) }} $</div>
      </div>
    </div>
    
    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-icon">☕</div>
        <div class="stat-label">ភេសជ្ជៈ</div>
        <div class="stat-val">{{ tracker.drinkTotal.value.toLocaleString() }} ៛</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🍽️</div>
        <div class="stat-label">អាហារ</div>
        <div class="stat-val">{{ tracker.foodTotal.value.toLocaleString() }} ៛</div>
      </div>
    </div>
    
    <div class="section-title">ការកត់ត្រា</div>
    
    <div class="cat-tabs">
      <div 
        v-for="c in filterOptions" 
        :key="c" 
        :class="['cat-pill', filterCat === c && 'active']" 
        @click="filterCat = c">
        {{ c }}
      </div>
    </div>
    
    <EntryCard 
      v-for="item in filteredEntries" 
      :key="item.id" 
      :item="item"
      showDelete
      @delete="confirmDelete"
    />
    
    <div v-if="filteredEntries.length === 0" class="empty">មិនមានការកត់ត្រា</div>

    <!-- Delete Confirmation Sheet -->
    <div v-if="deleteSheetId" class="overlay" @click.self="deleteSheetId = null">
      <div class="sheet slide-up">
        <div class="sheet-handle"></div>
        <div class="sheet-title">លុបការកត់ត្រា (Delete Entry)</div>
        <p style="text-align: center; color: #64748b; font-size: 14px; margin-bottom: 24px;">
          តើអ្នកពិតជាចង់លុបការកត់ត្រានេះមែនទេ?
        </p>
        <div style="display: flex; gap: 12px;">
          <button class="form-btn" style="flex: 1; background: rgba(255,255,255,0.6); color: #1e293b; border: 1px solid rgba(0,0,0,0.1);" @click="deleteSheetId = null">បោះបង់ (Cancel)</button>
          <button class="form-btn" style="flex: 1; background: #ef4444; border: 1px solid #dc2626;" @click="executeDelete">លុប (Delete)</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import EntryCard from '../components/EntryCard.vue';

const props = defineProps({
  tracker: Object
});

const filterCat = ref('ទាំងអស់');
const deleteSheetId = ref(null);

const filterOptions = computed(() => {
  return ['ទាំងអស់', ...props.tracker.categories.value.map(x => x.name)];
});

const filteredEntries = computed(() => {
  const list = props.tracker.currentDayEntries.value;
  if (filterCat.value === 'ទាំងអស់') return list;
  return list.filter(e => e.category === filterCat.value);
});

const confirmDelete = (id) => {
  deleteSheetId.value = id;
};

const executeDelete = () => {
  if (deleteSheetId.value) {
    props.tracker.deleteExpense(deleteSheetId.value);
    deleteSheetId.value = null;
  }
};
</script>
