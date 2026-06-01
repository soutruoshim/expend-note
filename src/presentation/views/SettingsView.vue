<template>
  <div>
    <div class="section-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
      <span>ផលិតផល</span>
      <button @click="openAddModal" class="btn-primary" style="font-size:11px; padding:4px 8px; border-radius:6px;">+ បន្ថែម</button>
    </div>
    <div v-for="p in tracker.products.value" :key="p.id" class="entry-card" style="cursor:pointer" @click="openEditModal(p)">
      <div class="entry-left">
        <div class="entry-ico">{{ p.icon }}</div>
        <div>
          <div class="entry-name">{{ p.name }}</div>
          <div class="entry-meta">{{ p.category }}</div>
        </div>
      </div>
      <div class="entry-amount">{{ p.price.toLocaleString() }} ៛</div>
    </div>
    
    <div class="chart-card" style="margin-top:12px">
      <div class="chart-title">ព័ត៌មាន</div>
      <div style="font-size:12px;color:#6b7280;line-height:1.8">
        <div>🗓 ខែ: {{ currentMonth }}</div>
        <div>📝 ការកត់ត្រាសរុប: {{ tracker.allEntries.value.length }}</div>
        <div>💰 ចំណាយសរុប: {{ tracker.weeklyTotal.value.toLocaleString() }} ៛</div>
        <div>📱 កំណែ: 2.0 (Clean Architecture)</div>
      </div>
    </div>

    <!-- Modal for Add/Edit -->
    <div v-if="showModal" class="overlay" @click.self="closeModal">
      <div class="sheet slide-up">
        <div class="sheet-handle"></div>
        <div class="sheet-title">{{ isEditing ? 'កែប្រែផលិតផល' : 'បន្ថែមផលិតផលថ្មី' }}</div>
        
        <div class="custom-form">
          <div class="form-row">
            <input type="text" v-model="formData.name" placeholder="ឈ្មោះផលិតផល" class="form-input" />
            <input type="number" v-model="formData.price" placeholder="តម្លៃ (៛)" class="form-input" style="width: 100px" />
          </div>
          
          <div style="font-size: 12px; margin-bottom: 6px; font-weight: bold; color: #374151">ប្រភេទ:</div>
          <div class="cat-tabs">
            <button 
              v-for="c in tracker.categories.value" 
              :key="c.name"
              :class="['cat-pill', formData.category === c.name && 'active']"
              @click="formData.category = c.name"
            >
              {{ c.name }}
            </button>
          </div>
          
          <div style="font-size: 12px; margin-bottom: 6px; margin-top: 10px; font-weight: bold; color: #374151">រូបតំណាង:</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
            <div 
              v-for="ico in tracker.iconOptions.value" 
              :key="ico"
              @click="formData.icon = ico"
              :style="{
                fontSize: '24px', cursor: 'pointer', padding: '4px',
                background: formData.icon === ico ? '#eff6ff' : 'transparent',
                borderRadius: '8px', border: formData.icon === ico ? '1px solid #bfdbfe' : '1px solid transparent'
              }"
            >
              {{ ico }}
            </div>
          </div>

          <button class="form-btn" style="width: 100%; margin-top: 10px;" @click="saveProduct">រក្សាទុក</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  tracker: Object
});

const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const currentMonth = computed(() => {
  const d = new Date();
  return `${khmerMonths[d.getMonth()]} ${d.getFullYear()}`;
});

const showModal = ref(false);
const isEditing = ref(false);
const editId = ref(null);

const formData = ref({
  name: '',
  price: '',
  category: 'ផ្សេងៗ',
  icon: '☕'
});

const openAddModal = () => {
  isEditing.value = false;
  formData.value = {
    name: '',
    price: '',
    category: props.tracker.categories.value[0]?.name || 'ផ្សេងៗ',
    icon: props.tracker.iconOptions.value[0] || '☕'
  };
  showModal.value = true;
};

const openEditModal = (product) => {
  isEditing.value = true;
  editId.value = product.id;
  formData.value = {
    name: product.name,
    price: product.price,
    category: product.category,
    icon: product.icon
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveProduct = async () => {
  if (!formData.value.name || !formData.value.price) {
    alert("សូមបញ្ចូលឈ្មោះ និងតម្លៃ");
    return;
  }
  
  const payload = {
    name: formData.value.name,
    price: Number(formData.value.price),
    category: formData.value.category,
    icon: formData.value.icon
  };

  if (isEditing.value) {
    await props.tracker.updateProduct(editId.value, payload);
  } else {
    await props.tracker.addProduct(payload);
  }
  closeModal();
};
</script>

<style scoped>
.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.btn-primary:active {
  background: #1d4ed8;
}
</style>
