# Spanish Exercises Application

This application provides interactive Spanish exercises with an admin interface for managing the exercises.

## Getting Started

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```
5. Open your browser and go to `http://localhost:4000`

## Testing the Application

### 1. Start the development server

Run `npm start` in the project directory. The application will be available at `http://localhost:4000`.

### 2. Test the AdminPage

1. Navigate to `http://localhost:4000/admin`
2. Add a new exercise:
   - Fill in all fields (question, keywords, acceptable answers, difficulty, category, and hint)
   - Click "Add Exercise"
3. Edit an existing exercise:
   - Find an exercise in the list
   - Click "Edit"
   - Modify some fields
   - Click "Update"
4. Delete an exercise:
   - Find an exercise in the list
   - Click "Delete"
5. Refresh the page to verify persistence of your changes

### 3. Test the main exercise page

1. Navigate to `http://localhost:4000`
2. Verify that:
   - The new exercise you added is present
   - The exercise you edited shows your changes
   - The exercise you deleted is no longer there

### 4. Test the hint system

1. On the main exercise page, go through different exercises
2. For each exercise:
   - Click the "Hint" button
   - Verify that the hint displayed matches the custom hint you set in the AdminPage

If all these steps work as expected, it means the changes have been successfully implemented and the data is persisting correctly.

## Troubleshooting

If you encounter any issues:
1. Make sure all dependencies are installed (`npm install`)
2. Clear your browser's local storage and refresh the page
3. Restart the development server

If problems persist, please report an issue on the project's GitHub page.
