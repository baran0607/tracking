import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { getEntries } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';

const StatisticsChart = () => {
  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const entries = await getEntries();
      const monthlyTotals = {};
      const categoryTotals = {};

      // Process entries
      entries.forEach(entry => {
        const date = new Date(entry.date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear().toString().substr(-2)}`;

        // Calculate monthly totals
        if (!monthlyTotals[monthYear]) {
          monthlyTotals[monthYear] = 0;
        }

        entry.items.forEach(item => {
          const total = item.quantity * item.cost;
          monthlyTotals[monthYear] += total;

          // Calculate category totals
          if (!categoryTotals[item.name]) {
            categoryTotals[item.name] = 0;
          }
          categoryTotals[item.name] += total;
        });
      });

      // Sort months chronologically
      const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
        const [monthA, yearA] = a.split('/');
        const [monthB, yearB] = b.split('/');
        return yearA - yearB || monthA - monthB;
      });

      // Get top 5 categories by expense
      const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      setMonthlyData({
        labels: sortedMonths,
        datasets: [{
          data: sortedMonths.map(month => monthlyTotals[month]),
        }],
      });

      setCategoryData({
        labels: topCategories.map(([category]) => category),
        datasets: [{
          data: topCategories.map(([, total]) => total),
        }],
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const screenWidth = Dimensions.get('window').width - 32;

  return (
    <ScrollView style={styles.container}>
      {/* Header Section with Refresh Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Monthly Expenses Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.title}>Monthly Expenses</Text>
        {monthlyData.labels.length > 0 ? (
          <LineChart
            data={monthlyData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noDataText}>No data available</Text>
        )}
      </View>

      {/* Top 5 Expense Categories Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.title}>Top 5 Expense Categories</Text>
        {categoryData.labels.length > 0 ? (
          <BarChart
            data={categoryData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            verticalLabelRotation={30}
          />
        ) : (
          <Text style={styles.noDataText}>No data available</Text>
        )}
      </View>

      {/* Summary Section */}
      {monthlyData.labels.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Summary</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Months:</Text>
            <Text style={styles.statValue}>{monthlyData.labels.length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average Monthly Expense:</Text>
            <Text style={styles.statValue}>
              ₹{(monthlyData.datasets[0].data.reduce((a, b) => a + b, 0) / monthlyData.labels.length).toFixed(2)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Highest Monthly Expense:</Text>
            <Text style={styles.statValue}>
              ₹{Math.max(...monthlyData.datasets[0].data).toFixed(2)}
            </Text>
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align to the right
    padding: 10,
  },
  refreshButton: {
    backgroundColor: '#f0f0f0', // Box color
    padding: 10,
    borderRadius: 50, // Make it circular
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Optional: adds a shadow effect on Android
  },
  chartContainer: {
    marginBottom: 24,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  statsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default StatisticsChart;
