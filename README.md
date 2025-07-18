# Meerut-Mart

Meerut-Mart is a full-featured e-commerce platform designed to connect sellers with customers, under the supervision of a hierarchical admin structure. The platform allows sellers to enroll and manage their products, while admins and super admins oversee the platform's operations.

## Project Summary

The primary goal of Meerut-Mart is to provide a robust and scalable e-commerce solution with the following key features:

*   **Multi-level Admin Roles:** The platform incorporates a Super Admin who can create and manage other Admins. Admins have control over sellers and products, ensuring a well-monitored marketplace.
*   **Seller Enrollment:** Sellers can easily register on the platform by providing their personal information and setting up their storefront.
*   **Product Management:** Sellers can add, update, and manage their products, including descriptions, pricing, and inventory.
*   **Customer Experience:** Customers can browse products, add them to their cart, and make purchases securely.
*   **Email Notifications:** Upon every successful purchase, the platform utilizes Nodemailer to send a confirmation email to the customer, enhancing the user experience and providing a record of the transaction.

## Getting Started

To get the Meerut-Mart platform up and running on your local machine, follow the setup instructions below for each component of the project: `admin`, `backend`, and `frontend`.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

*   [Node.js](https://nodejs.org/) (which includes npm)
*   [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)

### Backend Setup

The `backend` is the core of the platform, handling all the business logic, API endpoints, and database interactions.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory and add the following variables. Replace the placeholder values with your actual credentials.

    ```env
    PORT=4000
    MONGO_URI=<Your_MongoDB_Connection_String>
    JWT_SECRET=<Your_JWT_Secret>
    EMAIL_USER=<Your_Email_Address>
    EMAIL_PASS=<Your_Email_Password>
    ```

4.  **Start the backend server:**
    You can start the server using either of the following commands:

    To run the server in production mode:
    ```bash
    npm start
    ```

    To run the server in development mode with automatic restarts on file changes:
    ```bash
    npm run dev
    ```
    The backend server will be running on `http://localhost:4000`.

### Frontend Setup

The `frontend` is the customer-facing application where users can browse and purchase products.

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `frontend` directory and add the following variable:

    ```env
    VITE_API_URL=http://localhost:4000
    ```

4.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend application will be accessible at `http://localhost:5173`.

### Admin Panel Setup

The `admin` panel is used by Admins and Super Admins to manage the platform.

1.  **Navigate to the admin directory:**
    ```bash
    cd admin
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `admin` directory and add the following variable:

    ```env
    VITE_API_URL=http://localhost:4000
    ```

4.  **Start the admin panel development server:**
    ```bash
    npm run dev
    ```
    The admin panel will be accessible at `http://localhost:5174`.

## User Roles

*   **Super Admin:** The highest level of authority. The Super Admin can create and manage Admin accounts, oversee all platform activities, and has full access to all features.
*   **Admin:** Manages sellers, products, and orders. Admins are created by the Super Admin and are responsible for the day-to-day operations of the marketplace.
*   **Seller:** Can register on the platform, list products for sale, and manage their inventory and orders.
*   **User:** A customer who can browse the platform, purchase products, and track their orders.

With these instructions, you should be able to set up and run the Meerut-Mart e-commerce platform on your local machine.
