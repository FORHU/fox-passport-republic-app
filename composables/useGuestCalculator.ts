// composables/useGuestCalculator.ts
import { ref, computed } from 'vue';

export interface GuestItem {
  title: string;
  type: 'header' | 'item';
  count?: number; 
}

export const useGuestCalculator = () => {
  const guestMenu = ref(false);
  
  // Full list moved from the original file
  const guestList = ref<GuestItem[]>([
    // 1. By Relationship - Immediate Family
    { title: 'Immediate Family', type: 'header' },
    { title: 'Parents of the Bride', type: 'item', count: 0 },
    { title: 'Parents of the Groom', type: 'item', count: 0 },
    { title: 'Siblings & In-Laws', type: 'item', count: 0 },
    { title: 'Grandparents', type: 'item', count: 0 },
    { title: 'Children of the Couple', type: 'item', count: 0 },

    // Extended Family
    { title: 'Extended Family', type: 'header' },
    { title: 'Aunts & Uncles', type: 'item', count: 0 },
    { title: 'Cousins', type: 'item', count: 0 },
    { title: 'Nieces & Nephews', type: 'item', count: 0 },

    // Social Circles
    { title: 'Social Circles', type: 'header' },
    { title: 'Childhood Friends', type: 'item', count: 0 },
    { title: 'High School / College Friends', type: 'item', count: 0 },
    { title: 'Work Colleagues', type: 'item', count: 0 },
    { title: 'Neighbors / Community Members', type: 'item', count: 0 },
    { title: 'Parents\' Friends', type: 'item', count: 0 },

    // Others
    { title: 'Others', type: 'header' },
    { title: 'Plus Ones / Partners', type: 'item', count: 0 },
    { title: 'Vendors (Photo/Video)', type: 'item', count: 0 },

    // 2. By Wedding Role
    { title: 'The Bridal Party', type: 'header' },
    { title: 'Maid / Matron of Honor', type: 'item', count: 0 },
    { title: 'Best Man', type: 'item', count: 0 },
    { title: 'Bridesmaids', type: 'item', count: 0 },
    { title: 'Groomsmen', type: 'item', count: 0 },

    { title: 'Principal Sponsors (VIPs)', type: 'header' },
    { title: 'Godparents (Ninong/Ninang)', type: 'item', count: 0 },
  ]);

  const incrementItem = (item: GuestItem) => {
    if (item.count !== undefined) item.count++;
  };

  const decrementItem = (item: GuestItem) => {
    if (item.count !== undefined && item.count > 0) item.count--;
  };

  const resetCounts = () => {
    guestList.value.forEach(item => {
      if (item.count !== undefined) item.count = 0;
    });
  };

  const totalGuestCount = computed(() => {
    return guestList.value.reduce((sum, item) => sum + (item.count || 0), 0);
  });

  const displayTotalSummary = computed(() => {
    const count = totalGuestCount.value;
    if (count === 0) return "";
    return `${count} Guest${count > 1 ? 's' : ''}`;
  });

  return {
    guestMenu,
    guestList,
    incrementItem,
    decrementItem,
    resetCounts,
    totalGuestCount,
    displayTotalSummary
  };
};