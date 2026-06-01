<template>
  <div v-if="show" class="overlay" @click.self="$emit('close')">
    <div class="sheet slide-up">
      <div class="sheet-handle"></div>
      <div class="sheet-title">បន្ថែមការចំណាយ</div>
      
      <div class="prod-grid">
        <button v-for="p in products" :key="p.id" class="prod-btn" @click="quickAdd(p)">
          <span class="prod-ico">{{ p.icon }}</span>
          <span class="prod-name">{{ p.name }}</span>
          <span class="prod-price">{{ p.price.toLocaleString() }} ៛</span>
        </button>
      </div>
      
      <div class="section-title" style="margin-top:8px">បញ្ចូលផ្ទាល់</div>
      <div class="custom-form">
        <div class="form-row">
          <input class="form-input" v-model="custom.name" placeholder="ឈ្មោះទំនិញ">
          <input class="form-input" v-model.number="custom.price" placeholder="តម្លៃ" style="max-width:90px" type="number">
        </div>
        <div class="form-row">
          <select class="form-input" v-model="custom.icon">
            <option v-for="e in iconOptions" :key="e" :value="e">{{ e }}</option>
          </select>
          <select class="form-input" v-model="custom.category">
            <option v-for="c in categories" :key="c.name" :value="c.name">{{ c.name }}</option>
          </select>
          <input class="form-input" v-model.number="custom.qty" placeholder="qty" style="max-width:60px" type="number" min="1">
          <button class="form-btn" @click="addCustom">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  show: Boolean,
  products: Array,
  categories: Array,
  iconOptions: Array
});

const emit = defineEmits(['close', 'add']);

const custom = ref({ name: '', price: null, icon: '☕', category: 'ភេសជ្ជៈ', qty: 1 });

const quickAdd = (p) => {
  emit('add', {
    name: p.name,
    qty: 1,
    price: p.price,
    icon: p.icon,
    category: p.category
  });
  emit('close');
};

const addCustom = () => {
  if (!custom.value.name || !custom.value.price) return;
  emit('add', {
    name: custom.value.name,
    qty: custom.value.qty || 1,
    price: custom.value.price,
    icon: custom.value.icon,
    category: custom.value.category
  });
  custom.value = { name: '', price: null, icon: '☕', category: 'ភេសជ្ជៈ', qty: 1 };
  emit('close');
};
</script>
