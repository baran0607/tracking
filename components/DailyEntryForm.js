import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { saveEntry } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const DailyEntryForm = ({ route, navigation }) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [items, setItems] = useState([{ name: '', quantity: '1', cost: '' }]);
  const editMode = route.params?.editMode;
  const editDate = route.params?.date;
  const itemToEdit = route.params?.itemToEdit;
  const itemIndex = route.params?.itemIndex;

  useEffect(() => {
    if (editMode && itemToEdit) {
      setDate(new Date(editDate));
      setItems([itemToEdit]);
    }
  }, [editMode, itemToEdit, editDate]);

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: '1', cost: '' }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleQuantityChange = (index, increment) => {
    const newItems = [...items];
    const currentQuantity = parseInt(newItems[index].quantity) || 0;
    newItems[index].quantity = Math.max(1, currentQuantity + increment).toString();
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  
  const handleSubmit = async () => {
    if (items.some(item => !item.name || !item.quantity || !item.cost)) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
  
    const formattedDate = date.toISOString().split('T')[0];  // Format the date as yyyy-mm-dd
    const formattedItems = items.map(item => ({
      name: item.name,
      quantity: parseInt(item.quantity),
      cost: parseFloat(item.cost),
    }));
  
    try {
      // Save the new entry or update an existing one
      await saveEntry(formattedDate, formattedItems);
  
      Alert.alert(
        'Success',
        'Entry saved successfully!',
        [{
          text: 'OK',
          onPress: () => {
            setItems([{ name: '', quantity: '1', cost: '' }]); // Reset to default state
            setDate(new Date()); // Reset to the current date
  
            if (navigation && navigation.canGoBack()) {
              navigation.goBack(); // Safely call goBack if it's possible
            } else {
              navigation.navigate('Home'); // Navigate to a default screen if goBack is not possible
            }
          }
        }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry');
    }
  };
  
  
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const cost = parseFloat(item.cost);
      const quantity = parseInt(item.quantity);
  
      // Check if both cost and quantity are valid numbers
      if (!isNaN(cost) && !isNaN(quantity)) {
        const itemTotal = cost * quantity;
        return total + itemTotal;
      }
  
      return total;
    }, 0).toFixed(2);
  };
  

  
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          {date.toLocaleDateString()}
        </Text>
        <Ionicons name="calendar" size={24} color="#007AFF" />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {items.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>Item {index + 1}</Text>
            {items.length > 1 && (
              <TouchableOpacity 
                onPress={() => handleRemoveItem(index)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.input}
            value={item.name}
            onChangeText={(text) => handleItemChange(index, 'name', text)}
            placeholder="Item Name"
          />

          <View style={styles.quantityContainer}>
            <Text style={styles.label}>Quantity:</Text>
            <TouchableOpacity 
              onPress={() => handleQuantityChange(index, -1)}
              style={styles.quantityButton}
            >
              <Ionicons name="remove" size={24} color="#007AFF" />
            </TouchableOpacity>

            <TextInput
              style={styles.quantityInput}
              value={item.quantity}
              onChangeText={(text) => handleItemChange(index, 'quantity', text)}
              keyboardType="numeric"
            />

            <TouchableOpacity 
              onPress={() => handleQuantityChange(index, 1)}
              style={styles.quantityButton}
            >
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.costContainer}>
            <Text style={styles.label}>Price:</Text>
            <TextInput
              style={styles.costInput}
              value={item.cost}
              onChangeText={(text) => handleItemChange(index, 'cost', text)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          {item.quantity && item.cost && (
            <Text style={styles.totalText}>
              Total: ₹{(parseFloat(item.cost) * parseInt(item.quantity)).toFixed(2)}
            </Text>
          )}
        </View>
      ))}

      {/* Show total for all items */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total for all items: ₹{calculateTotal()}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.addButton]} 
          onPress={handleAddItem}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.buttonText}>Add Item</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.submitButton]} 
          onPress={handleSubmit}
        >
          <Ionicons name="checkmark" size={24} color="#fff" />
          <Text style={styles.buttonText}>
            {editMode ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  itemContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 4,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginRight: 12,
    minWidth: 70,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quantityInput: {
    height: 40,
    width: 60,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 8,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  costInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 8,
  },
  totalContainer: {
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  addButton: {
    backgroundColor: '#34C759',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default DailyEntryForm;
