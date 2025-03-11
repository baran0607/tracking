import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { getEntries } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';

const MonthlySummary = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthData();
  }, [selectedMonth]);

  const loadMonthData = async () => {
    try {
      setLoading(true);
      const entries = await getEntries();

      // Filter entries for selected month
      const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getMonth() === selectedMonth.getMonth() &&
          entryDate.getFullYear() === selectedMonth.getFullYear()
        );
      });

      // Process data
      const categoryTotals = {};
      let totalExpense = 0;
      let totalItems = 0;

      filteredEntries.forEach(entry => {
        entry.items.forEach(item => {
          const itemTotal = item.quantity * item.cost;
          totalExpense += itemTotal;
          totalItems += item.quantity;

          if (!categoryTotals[item.name]) {
            categoryTotals[item.name] = {
              quantity: 0,
              total: 0,
              avgCost: 0,
            };
          }
          categoryTotals[item.name].quantity += item.quantity;
          categoryTotals[item.name].total += itemTotal;
        });
      });

      // Calculate averages
      Object.keys(categoryTotals).forEach(category => {
        categoryTotals[category].avgCost = 
          categoryTotals[category].total / categoryTotals[category].quantity;
      });

      setMonthlyData({
        totalExpense,
        totalItems,
        categories: categoryTotals,
        numTransactions: filteredEntries.length,
      });
    } catch (error) {
      console.error('Error loading monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (increment) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedMonth(newDate);
  };

  // Handler for refreshing the data
  const handleRefresh = () => {
    loadMonthData();  // Refresh the data when the button is clicked
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>

        {/* Refresh Icon next to the heading */}
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#007AFF" style={styles.refreshIcon} />
        </TouchableOpacity>
      </View>

      {monthlyData ? (
        <>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Expense</Text>
              <Text style={styles.summaryValue}>₹{monthlyData.totalExpense.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Items</Text>
              <Text style={styles.summaryValue}>{monthlyData.totalItems}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Days</Text>
              <Text style={styles.summaryValue}>{monthlyData.numTransactions}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {Object.entries(monthlyData.categories)
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([category, data]) => (
              <View key={category} style={styles.categoryContainer}>
                <Text style={styles.categoryName}>{category}</Text>
                <View style={styles.categoryDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total:</Text>
                    <Text style={styles.detailValue}>₹{data.total.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity:</Text>
                    <Text style={styles.detailValue}>{data.quantity}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Avg. Cost:</Text>
                    <Text style={styles.detailValue}>₹{data.avgCost.toFixed(2)}</Text>
                  </View>
                </View>
                <View style={styles.percentageBar}>
                  <View 
                    style={[ 
                      styles.percentageFill,
                      { width: `${(data.total / monthlyData.totalExpense) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}
        </>
      ) : (
        <Text style={styles.noDataText}>No expenses recorded for this month</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshIcon: {
    marginLeft: 12, // Adds spacing between title and icon
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    fontWeight: '500',
  },
  percentageBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
});

export default MonthlySummary;


