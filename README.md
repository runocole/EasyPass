# EasyPass

EasyPass is a queue management system designed to streamline the process of managing and tracking students' presence in exam halls. It includes features like real-time seat tracking, QR code scanning, and an admin panel for monitoring student attendance.

## Features

- **Student Dashboard**: Displays student information, queue status, and QR code for easy check-in.
- **Admin Panel**: Allows admins to view checked-in students with filtering options.
- **QR Code Scanner**: For verifying student check-ins.
- **Real-Time Updates**: Keeps students informed of seat availability and queue status.

## Technologies Used

- **Frontend**: React, Material UI
- **Backend**: Django, Python
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **QR Code Scanning**: Integrated for digital tag validation.

## Setup

1. Clone this repository:
    ```bash
    git clone https://github.com/runocole/EasyPass.git
    ```

2. Install dependencies for the frontend and backend:

   - **Frontend**:
     ```bash
     cd easypass-frontend
     npm install
     ```

   - **Backend**:
     First, ensure you have Python 3.x installed. Then, create a virtual environment and install dependencies:

     ```bash
     cd easypass-backend
     python3 -m venv venv
     source venv/bin/activate  # On Windows use: venv\Scripts\activate
     pip install -r requirements.txt
     ```

3. Set up the database:
   - Create the database and apply migrations:
     ```bash
     python manage.py migrate
     ```

4. Run the backend and frontend:
   - **Backend** (Django):
     ```bash
     python manage.py runserver
     ```
   - **Frontend** (React):
     ```bash
     cd ../easypass-frontend
     npm start
     ```

5. Visit the app in your browser at `http://localhost:3000` for the frontend and `http://localhost:8000` for the backend (Django API).

## License

This project is licensed under the MIT License.
