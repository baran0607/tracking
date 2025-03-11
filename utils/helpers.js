// utils/helpers.js

// Calculate total cost for a single entry (day)
export const calculateDailyTotal = (items) => {
    return items.reduce((total, item) => total + item.quantity * item.cost, 0);
  };
  
  // Calculate total cost for a month
  export const calculateMonthlyTotal = (entries) => {
    return entries.reduce((total, entry) => total + calculateDailyTotal(entry.items || []), 0);
  };
  
  // Get unique items and their total quantities/costs for a month
  export const getItemSummary = (entries) => {
    const itemSummary = {};
  
    entries.forEach(entry => {
      const items = entry.items || []; // Default to an empty array if `items` is undefined
      items.forEach(item => {
        if (!itemSummary[item.name]) {
          itemSummary[item.name] = { quantity: 0, cost: 0 };
        }
        itemSummary[item.name].quantity += item.quantity;
        itemSummary[item.name].cost += item.quantity * item.cost;
      });
    });
  
    return itemSummary;
  };