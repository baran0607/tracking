import AsyncStorage from '@react-native-async-storage/async-storage';

// Save an entry
export const saveEntry = async (date, items) => {
  try {
    const entries = await getEntries();
    const existingEntryIndex = entries.findIndex(entry => entry.date === date);

    if (existingEntryIndex !== -1) {
      // If entry already exists, append the new items to the existing ones
      entries[existingEntryIndex].items = [
        ...entries[existingEntryIndex].items,
        ...items, // Add new items to the existing ones
      ];
    } else {
      // If no entry exists for this date, create a new one
      entries.push({ date, items: items || [] });
    }

    // Save the updated entries to AsyncStorage
    await AsyncStorage.setItem('entries', JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entry:', error);
  }
};

// Get all entries
export const getEntries = async () => {
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
