# Expense Tracker App

A React Native mobile application for tracking daily expenses with detailed analytics and visualizations.

## Features

- Add daily expenses with item name, quantity, and cost
- Increment/decrement quantity controls
- Calendar view for expense history
- Monthly expense summaries with category breakdowns
- Visual analytics with charts
- Local storage persistence
- Edit and delete entries
- Beautiful and intuitive UI

## Setup

1. Make sure you have Node.js and npm installed
2. Install Expo CLI globally:
   ```bash
   npm install -g expo-cli
   ```

3. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd expense-tracker
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Use the Expo Go app on your mobile device to scan the QR code, or press 'a' to open in an Android emulator or 'i' for iOS simulator.

## Usage

### Adding Expenses
1. Navigate to the "Add Expense" tab
2. Select a date using the date picker
3. Enter item details (name, quantity, price)
4. Use + and - buttons to adjust quantities
5. Add more items if needed
6. Press "Save" to store the entry

### Viewing History
1. Go to the "History" tab
2. Use the calendar to select a date
3. View, edit, or delete entries for the selected date

### Monthly Summary
1. Access the "Summary" tab
2. Navigate between months using arrows
3. View total expenses, items count, and transactions
4. See category-wise breakdown with percentages

### Statistics
1. Visit the "Statistics" tab
2. View monthly expense trends
3. Analyze top expense categories
4. Check summary statistics

## Dependencies

- React Native
- Expo
- React Navigation
- React Native Chart Kit
- React Native Calendars
- AsyncStorage
- DateTimePicker

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 