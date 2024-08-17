# Spanish Exercises Application

This application provides interactive Spanish exercises with an admin interface for managing the exercises. It uses a Neon PostgreSQL database for data storage and Socket.io for real-time updates.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- A Neon PostgreSQL database

## Getting Started

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Set up your environment variables:
   - Create a `.env` file in the project root
   - Add your Neon database connection string:
     ```
     NEON_DB_CONNECTION_STRING=your_connection_string_here
     ```
5. Start the backend server:
   ```
   npm run server
   ```
6. In a new terminal, start the frontend development server:
   ```
   npm start
   ```
7. Open your browser and go to `http://localhost:4000`

## Features

- Interactive Spanish exercises
- Admin interface for managing exercises
- Real-time updates when new exercises are added
- Integration with Neon PostgreSQL database

## Testing the Application

### 1. Start the backend and frontend servers

Run `npm run server` in one terminal and `npm start` in another terminal. The application will be available at `http://localhost:4000`.

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

### 4. Test real-time updates

1. Open two browser windows side by side
2. In one window, navigate to `http://localhost:4000/admin`
3. In the other window, navigate to `http://localhost:4000`
4. In the admin window, add a new exercise
5. Verify that the new exercise appears in the other window without refreshing

### 5. Test the hint system

1. On the main exercise page, go through different exercises
2. For each exercise:
   - Click the "Hint" button
   - Verify that the hint displayed matches the custom hint you set in the AdminPage

If all these steps work as expected, it means the changes have been successfully implemented and the data is persisting correctly.

## Troubleshooting

If you encounter any issues:
1. Make sure all dependencies are installed (`npm install`)
2. Verify that your `.env` file is set up correctly with the Neon database connection string
3. Ensure both the backend server and frontend development server are running
4. Clear your browser's cache and refresh the page
5. Restart both the backend and frontend servers

If problems persist, please report an issue on the project's GitHub page.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
