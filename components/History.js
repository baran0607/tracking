import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const History = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [entries, setEntries] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const allEntries = await getEntries();
      setEntries(allEntries);

      // Mark dates with entries
      const marked = {};
      allEntries.forEach(entry => {
        marked[entry.date] = { marked: true, dotColor: '#007AFF' };
      });
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const getEntries = async () => {
    try {
      const entries = await AsyncStorage.getItem('entries');
      if (entries) {
        const parsedEntries = JSON.parse(entries);
        return Array.isArray(parsedEntries) ? parsedEntries : [];
      }
      return [];
    } catch (error) {
      console.error('Error getting entries:', error);
      return [];  // Ensure an empty array is returned in case of error
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };

  const getDayEntries = () => {
    return entries.find(entry => entry.date === selectedDate)?.items || [];
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
  };

  const handleDeleteEntry = async (index) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedEntries = [...entries];
              const entryIndex = updatedEntries.findIndex(e => e.date === selectedDate);
              
              if (entryIndex !== -1) {
                updatedEntries[entryIndex].items.splice(index, 1);
                if (updatedEntries[entryIndex].items.length === 0) {
                  updatedEntries.splice(entryIndex, 1);
                }

                // Update AsyncStorage with the modified entries list
                await AsyncStorage.setItem('entries', JSON.stringify(updatedEntries));
                setEntries(updatedEntries); // Update the state to reflect the changes

                // Refresh the marked dates in the calendar
                updateMarkedDates(updatedEntries);
              }
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete the entry');
            }
          }
        }
      ]
    );
  };

  const updateMarkedDates = (updatedEntries) => {
    const marked = {};
    updatedEntries.forEach(entry => {
      marked[entry.date] = { marked: true, dotColor: '#007AFF' };
    });
    setMarkedDates(marked);
  };

  const handleEditEntry = (index) => {
    const item = getDayEntries()[index];
    setCurrentItem(item);
    setNewTitle(item.name);
    setNewQuantity(item.quantity.toString());
    setNewPrice(item.cost.toString());
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (newTitle && newQuantity && newPrice) {
      const updatedEntries = [...entries];
      const entryIndex = updatedEntries.findIndex(e => e.date === selectedDate);
      const itemIndex = updatedEntries[entryIndex].items.findIndex(item => item === currentItem);

      if (entryIndex !== -1 && itemIndex !== -1) {
        updatedEntries[entryIndex].items[itemIndex] = {
          ...currentItem,
          name: newTitle,
          quantity: parseInt(newQuantity),
          cost: parseFloat(newPrice),
        };

        try {
          await AsyncStorage.setItem('entries', JSON.stringify(updatedEntries));
          setEntries(updatedEntries);
          updateMarkedDates(updatedEntries);
          setEditModalVisible(false);
        } catch (error) {
          console.error('Error saving edited entry:', error);
          Alert.alert('Error', 'Failed to save the edited entry');
        }
      }
    } else {
      Alert.alert('Invalid Input', 'Please fill all fields correctly');
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>
          Quantity: {item.quantity} × ₹{item.cost} = ₹{item.quantity * item.cost}
        </Text>
      </View>
      <View style={styles.itemActions}>
      <TouchableOpacity onPress={() => handleEditEntry(index)} style={styles.actionButton}>
          <Ionicons name="pencil-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteEntry(index)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Box with Refresh Icon inside */}
        <TouchableOpacity onPress={loadEntries} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <Calendar
        onDayPress={handleDateSelect}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: '#007AFF',
          },
        }}
        theme={{
          selectedDayBackgroundColor: '#007AFF',
          todayTextColor: '#007AFF',
          arrowColor: '#007AFF',
        }}
      />

      {/* Entries Section */}
      {selectedDate ? (
        <View style={styles.entriesContainer}>
          <Text style={styles.dateHeader}>Entries for {selectedDate}</Text>
          <FlatList
            data={getDayEntries()}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No entries for this date</Text>
            }
            ListFooterComponent={() => {
              const items = getDayEntries();
              if (items.length > 0) {
                return (
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>
                      Total: ₹{calculateTotal(items)}
                    </Text>
                  </View>
                );
              }
              return null;
            }}
          />
        </View>
      ) : (
        <Text style={styles.selectDateText}>Select a date to view entries</Text>
      )}

      {/* Edit Entry Modal */}
      {editModalVisible && (
        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Edit Entry</Text>

              <TextInput
                style={styles.input}
                placeholder="Item Title"
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Quantity"
                keyboardType="numeric"
                value={newQuantity}
                onChangeText={setNewQuantity}
              />
              <TextInput
                style={styles.input}
                placeholder="Price"
                keyboardType="numeric"
                value={newPrice}
                onChangeText={setNewPrice}
              />

              {/* Buttons: Save and Cancel */}
              <View style={styles.modalButtonsContainer}>
                <Button title="Cancel" color="gray" onPress={() => setEditModalVisible(false)} />
                <Button title="Save" onPress={handleSaveEdit} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
  },
  refreshButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  entriesContainer: {
    flex: 1,
    padding: 16,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  selectDateText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  totalContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 4,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
});

export default History;
