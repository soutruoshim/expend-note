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

    <!-- In-App Invoice Modal -->
    <div v-if="showInvoice" class="invoice-modal">
      <div v-show="!generatedImage" class="invoice-content" id="print-area">
        <div class="inv-header">
          <h2>វិក្កយបត្រចំណាយ (Expense Invoice)</h2>
          <p>កាលបរិច្ឆេទ: {{ formatDisplayDate(startDate) }} ដល់ {{ formatDisplayDate(endDate) }}</p>
        </div>
        <table class="inv-table">
          <thead>
            <tr>
              <th>កាលបរិច្ឆេទ</th>
              <th>ឈ្មោះ</th>
              <!-- <th>ប្រភេទ</th> -->
              <th style="text-align:center">ចំនួន</th>
              <th style="text-align:right">តម្លៃរាយ (៛)</th>
              <th style="text-align:right">សរុប (៛)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in filteredEntries" :key="e.id">
              <td>{{ formatDisplayDate(e.date) }}</td>
              <td>{{ e.name }}</td>
              <!-- <td>{{ e.category }}</td> -->
              <td style="text-align:center">{{ e.qty }}</td>
              <td style="text-align:right">{{ e.price.toLocaleString() }}</td>
              <td style="text-align:right">{{ (e.price * e.qty).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
        <div class="inv-total">
          សរុបរួម: {{ totalSpent.toLocaleString() }} ៛
        </div>
        
        <div class="qr-pay-section">
          <p>Scan to Pay (ABA / KHQR)</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=your_payment_link_here" alt="QR Pay" class="qr-img"/>
          <!-- <p style="font-size: 11px; color: #64748b; margin-top: 5px;">* Please change image source to your real QR</p> -->
        </div>
      </div>
      
      <div v-if="generatedImage" class="image-preview">
        <p class="preview-instruction">ចុចឲ្យជាប់លើរូបភាពខាងក្រោមដើម្បីរក្សាទុក (Long press to save)</p>
        <img :src="generatedImage" alt="Invoice Preview" class="preview-img" />
      </div>

      <div class="invoice-actions no-print">
        <button v-if="!generatedImage" @click="downloadInvoice" class="btn-print">បង្កើតរូបភាព (Create Image)</button>
        <button @click="closeInvoice" class="btn-close">បិទ (Close)</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import EntryCard from '../components/EntryCard.vue';
import html2canvas from 'html2canvas';

const props = defineProps({
  tracker: Object
});

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
const fifteenthDay = new Date(today.getFullYear(), today.getMonth(), 15);

const startDate = ref(formatDate(firstDay));
const endDate = ref(formatDate(fifteenthDay));
const showInvoice = ref(false);
const generatedImage = ref(null);

const closeInvoice = () => {
  showInvoice.value = false;
  generatedImage.value = null;
};

const filteredEntries = computed(() => {
  return props.tracker.allEntries.value
    .filter(e => e.date >= startDate.value && e.date <= endDate.value)
    .sort((a, b) => {
      if (a.date === b.date) return a.id - b.id;
      return a.date.localeCompare(b.date);
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
  showInvoice.value = true;
};

const downloadInvoice = async () => {
  const element = document.getElementById('print-area');
  if (element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `invoice-${startDate.value}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Invoice',
            text: 'Here is your invoice'
          });
          return;
        }
      } catch (e) {
        console.warn('Share API not available', e);
      }
      
      // Fallback: Display the image so user can long-press to save
      generatedImage.value = dataUrl;
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('មានបញ្ហាក្នុងការរក្សាទុករូបភាព');
    }
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

/* Invoice Modal Styles */
.invoice-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: white;
  z-index: 9999;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.image-preview {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  background: #f1f5f9;
}
.preview-instruction {
  font-size: 14px;
  color: #ef4444;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}
.preview-img {
  max-width: 100%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
.invoice-content {
  flex: 1;
  padding: 40px 20px;
  color: #333;
  font-family: 'Noto Sans Khmer', sans-serif, Arial, sans-serif;
}
.inv-header {
  text-align: center;
  margin-bottom: 40px;
}
.inv-header h2 {
  margin: 0;
  font-size: 24px;
  color: #2563eb;
}
.inv-header p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}
.inv-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 13px;
}
.inv-table th, .inv-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.inv-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: bold;
}
.inv-total {
  font-weight: bold;
  font-size: 18px;
  margin-top: 30px;
  text-align: right;
  color: #1e293b;
  border-top: 2px solid #2563eb;
  padding-top: 15px;
}
.qr-pay-section {
  margin-top: 30px;
  text-align: center;
}
.qr-pay-section p {
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 10px;
}
.qr-img {
  width: 120px;
  height: 120px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 5px;
  background: white;
}
.invoice-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
.invoice-actions button {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  font-family: inherit;
}
.btn-print {
  background: #2563eb;
  color: white;
}
.btn-close {
  background: #cbd5e1;
  color: #1e293b;
}

@media print {
  body * {
    visibility: hidden;
  }
  .invoice-modal, .invoice-modal * {
    visibility: visible;
  }
  .invoice-modal {
    position: absolute;
    left: 0;
    top: 0;
  }
  .no-print {
    display: none !important;
  }
}
</style>
