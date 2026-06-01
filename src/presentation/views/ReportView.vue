<template>
  <div>
    <div class="date-range">
      <input type="date" v-model="startDate" class="date-input" />
      <span>ដល់</span>
      <input type="date" v-model="endDate" class="date-input" />
    </div>
    
    <div class="chart-card">
      <div class="chart-title">ចំណាយតាមប្រភេទ</div>
      <div class="cat-breakdown">
        <div v-for="c in categoryBreakdown" :key="c.name" class="cat-row">
          <div class="cat-dot" :style="{ background: c.color }"></div>
          <div class="cat-name">{{ c.name }} ({{ c.count }})</div>
          <div class="cat-bar-wrap">
            <div class="cat-bar-fill" :style="{ width: c.pct + '%', background: c.color }"></div>
          </div>
          <div class="cat-pct">{{ c.pct.toFixed(0) }}%</div>
        </div>
      </div>
    </div>
    
    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-label">សរុប</div>
        <div class="stat-val">{{ totalSpent.toLocaleString() }}</div>
        <div style="font-size:10px;color:#9ca3af">៛</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">មធ្យម/ថ្ងៃ</div>
        <div class="stat-val">{{ Math.round(totalSpent / Math.max(chartDays.length, 1)).toLocaleString() }}</div>
        <div style="font-size:10px;color:#9ca3af">៛</div>
      </div>
    </div>
    
    <div class="section-title" style="display: flex; justify-content: space-between; align-items: center;">
      <span>ប្រវត្តិ</span>
      <button @click="createInvoice" class="invoice-btn">បង្កើតវិក្កយបត្រ</button>
    </div>
    <EntryCard 
      v-for="item in filteredEntries" 
      :key="item.id" 
      :item="item"
      showDate
      :showQty="false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import EntryCard from '../components/EntryCard.vue';

const props = defineProps({
  tracker: Object
});

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const today = new Date();
const todayDate = formatDate(today);
// default to current month
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

const startDate = ref(formatDate(firstDay));
const endDate = ref(formatDate(today));

const filteredEntries = computed(() => {
  return props.tracker.allEntries.value.filter(e => {
    return e.date >= startDate.value && e.date <= endDate.value;
  });
});

const totalSpent = computed(() => {
  return filteredEntries.value.reduce((sum, item) => sum + (item.price * item.qty), 0);
});

const categoryBreakdown = computed(() => {
  const total = totalSpent.value || 1;
  const categories = props.tracker.categories.value;
  return categories.map(c => {
    const sum = filteredEntries.value
      .filter(e => e.category === c.name)
      .reduce((t, i) => t + (i.price * i.qty), 0);
    const count = filteredEntries.value.filter(e => e.category === c.name).length;
    return { ...c, sum, count, pct: Math.round((sum / total) * 100) };
  }).filter(c => c.sum > 0)
    .sort((a, b) => b.sum - a.sum); // Sort by highest sum
});

const chartDays = computed(() => {
  const days = [];
  let current = new Date(startDate.value);
  const end = new Date(endDate.value);
  
  // limit to 60 days to prevent browser freezing if user selects a massive range
  let count = 0;
  while (current <= end && count < 60) {
    days.push(formatDate(new Date(current)));
    current.setDate(current.getDate() + 1);
    count++;
  }
  return days;
});

const chartData = computed(() => {
  const map = {};
  chartDays.value.forEach(d => map[d] = 0);
  filteredEntries.value.forEach(e => {
    if (map[e.date] !== undefined) {
      map[e.date] += (e.price * e.qty);
    }
  });
  
  const max = Math.max(...Object.values(map), 1);
  
  return chartDays.value.map(d => ({
    date: d,
    label: d.split('-')[2], // Just the day
    total: map[d],
    height: Math.round((map[d] / max) * 60) + 4
  }));
});

const createInvoice = () => {
  const invoiceHtml = `
    <html>
      <head>
        <title>វិក្កយបត្រចំណាយ (Expense Invoice)</title>
        <style>
          body { font-family: 'Noto Sans Khmer', sans-serif, Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; }
          .header h2 { margin: 0; font-size: 24px; color: #2563eb; }
          .header p { margin: 5px 0; font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8fafc; color: #475569; font-weight: bold; }
          .total { font-weight: bold; font-size: 20px; margin-top: 30px; text-align: right; color: #1e293b; border-top: 2px solid #2563eb; padding-top: 15px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>វិក្កយបត្រចំណាយ (Expense Invoice)</h2>
          <p>កាលបរិច្ឆេទ: ${startDate.value} ដល់ ${endDate.value}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>កាលបរិច្ឆេទ</th>
              <th>ឈ្មោះ</th>
              <th>ប្រភេទ</th>
              <th style="text-align:center">ចំនួន</th>
              <th style="text-align:right">តម្លៃរាយ (៛)</th>
              <th style="text-align:right">សរុប (៛)</th>
            </tr>
          </thead>
          <tbody>
            ${filteredEntries.value.map(e => `
              <tr>
                <td>${e.date}</td>
                <td>${e.name}</td>
                <td>${e.category}</td>
                <td style="text-align:center">${e.qty}</td>
                <td style="text-align:right">${e.price.toLocaleString()}</td>
                <td style="text-align:right">${(e.price * e.qty).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          សរុបរួម: ${totalSpent.value.toLocaleString()} ៛
        </div>
        <script>
          setTimeout(() => {
            window.print();
            window.close();
          }, 500);
        </sc` + `ript>
      </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  } else {
    alert("សូមអនុញ្ញាត (allow popups) សម្រាប់គេហទំព័រនេះ ដើម្បីបង្ហាញវិក្កយបត្រ។");
  }
};
</script>

<style scoped>
.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  background: #fff;
  padding: 10px 14px;
  border-radius: 12px;
  border: 0.5px solid #e5e7eb;
}
.date-input {
  flex: 1;
  border: none;
  background: #f3f4f6;
  padding: 6px 10px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  color: #1f2937;
  outline: none;
}
.date-range span {
  font-size: 13px;
  color: #6b7280;
}
.week-bar-chart::-webkit-scrollbar {
  height: 4px;
}
.week-bar-chart::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.invoice-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
}
.invoice-btn:active {
  background: #1d4ed8;
}
</style>
