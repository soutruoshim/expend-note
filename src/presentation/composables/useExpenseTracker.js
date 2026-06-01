import { ref, computed, onMounted } from 'vue';
import { ExpenseService } from '../../domain/useCases/ExpenseService.js';
import { ApiExpenseRepository } from '../../data/repositories/ApiExpenseRepository.js';
import { ApiProductRepository } from '../../data/repositories/ApiProductRepository.js';

// Setup dependencies (DI container alternative for simplicity)
const expenseRepository = new ApiExpenseRepository();
const productRepository = new ApiProductRepository();
const expenseService = new ExpenseService(expenseRepository);

export function useExpenseTracker() {
  const entries = ref([]);
  const products = ref([]);
  const categories = ref([]);
  const iconOptions = ref([]);

  const getKhmerDayName = (dayIndex) => {
    const days = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍'];
    return days[dayIndex];
  };

  const getKhmerMonthName = (monthIndex) => {
    const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    return months[monthIndex];
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const today = new Date();
  const activeDate = ref(formatDate(today));

  const weekOffset = ref(0);

  const weekDays = computed(() => {
    const current = new Date();
    current.setDate(current.getDate() + (weekOffset.value * 7));
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Monday is the first day
    
    const startOfWeek = new Date(current.setDate(diff));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push({
        name: getKhmerDayName(date.getDay()),
        number: String(date.getDate()),
        date: formatDate(date),
        monthIndex: date.getMonth()
      });
    }
    return week;
  });

  const nextWeek = () => {
    weekOffset.value++;
    if (activeDate.value) {
      const d = new Date(activeDate.value);
      d.setDate(d.getDate() + 7);
      activeDate.value = formatDate(d);
    }
  };
  
  const prevWeek = () => {
    weekOffset.value--;
    if (activeDate.value) {
      const d = new Date(activeDate.value);
      d.setDate(d.getDate() - 7);
      activeDate.value = formatDate(d);
    }
  };

  const loadData = async () => {
    entries.value = await expenseService.getAllExpenses();
    products.value = await productRepository.getProducts();
    categories.value = await productRepository.getCategories();
    iconOptions.value = await productRepository.getIconOptions();
  };

  onMounted(() => {
    loadData();
  });

  const currentDayEntries = computed(() => {
    return entries.value.filter(e => e.date === activeDate.value);
  });

  const allEntries = computed(() => {
    return [...entries.value].sort((a, b) => b.id - a.id);
  });

  const totalSpent = computed(() => {
    return expenseService.calculateTotal(currentDayEntries.value);
  });

  const drinkTotal = computed(() => {
    return expenseService.calculateTotal(currentDayEntries.value.filter(e => e.category === 'ភេសជ្ជៈ'));
  });

  const foodTotal = computed(() => {
    return expenseService.calculateTotal(currentDayEntries.value.filter(e => e.category === 'អាហារ'));
  });

  const activeDateLabel = computed(() => {
    const d = weekDays.value.find(d => d.date === activeDate.value);
    if (!d) return '';
    const monthName = getKhmerMonthName(d.monthIndex);
    return `ថ្ងៃ${d.name}, ទី${d.number} ${monthName}`;
  });

  const weeklyTotal = computed(() => {
    return expenseService.calculateTotal(entries.value);
  });

  const weekTotalsMap = computed(() => {
    const totals = expenseService.getWeeklyTotals(entries.value, weekDays.value.map(d => d.date));
    return totals.reduce((acc, curr) => {
      acc[curr.date] = curr.total;
      return acc;
    }, {});
  });

  const maxWeekTotal = computed(() => {
    return Math.max(...Object.values(weekTotalsMap.value), 1);
  });

  const barHeight = (date) => {
    const total = weekTotalsMap.value[date] || 0;
    return Math.round((total / maxWeekTotal.value) * 60) + 4;
  };

  const categoryBreakdown = computed(() => {
    return expenseService.calculateCategoryTotals(entries.value, categories.value);
  });

  const addExpense = async (data) => {
    const newExpense = await expenseService.addExpense({
      ...data,
      date: activeDate.value
    });
    // Optimistic UI update
    entries.value.unshift(newExpense);
  };

  const deleteExpense = async (id) => {
    await expenseService.deleteExpense(id);
    // Optimistic UI update
    entries.value = entries.value.filter(e => e.id !== id);
  };

  const addProduct = async (productData) => {
    const newProduct = await productRepository.addProduct(productData);
    products.value.push(newProduct);
  };

  const updateProduct = async (id, updates) => {
    const updated = await productRepository.updateProduct(id, updates);
    if (updated) {
      const index = products.value.findIndex(p => p.id === id);
      if (index !== -1) {
        products.value[index] = updated;
      }
    }
  };

  return {
    entries,
    products,
    categories,
    iconOptions,
    weekDays,
    activeDate,
    currentDayEntries,
    allEntries,
    totalSpent,
    drinkTotal,
    foodTotal,
    activeDateLabel,
    weeklyTotal,
    weekTotalsMap,
    barHeight,
    categoryBreakdown,
    addExpense,
    deleteExpense,
    addProduct,
    updateProduct,
    prevWeek,
    nextWeek
  };
}
