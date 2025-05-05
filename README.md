# Comp 440 Project

**Phase 1**: A secure authentication system built with Next.js, MySQL, and modern security practices to provide user registration and login functionality.

**Phase 2**: This phase focuses on implementing interfaces and their integration with database operations.

**Phase 3**: This phase implements complex queries and analytics interfaces.

## Contributions
**Andres Feldstedt**: In Phase 1, he set up user registration, making sure user information was saved correctly in the database (excluding password hashing). In Phase 2, he implemented the feature that allows users to search for rental units by city, price range, and availability. For Phase 3, he created two API routes: one that returns the most expensive rental unit for each feature, and another that lists users who posted the most rental units on April 15, 2025, including any ties.

**Marco Minas**: In Phase 1, he helped build parts of the user interface and worked on designing the initial database schema. For Phase 2, he created the UI for rental unit posting (Step 1), added auto-increment logic to the schema, and implemented the necessary backend logic to support it. In Phase 3, he focused on Steps 5 and 6, building two React components for each, setting up the corresponding API routes, and writing the SQL queries to retrieve data from the database.

**Chinedu Egbujor**: In Phase 1, he was responsible for implementing password hashing during user registration to ensure secure account creation. In Phase 2, he completed the backend and UI logic for viewing and updating user profiles. For Phase 3, he handled Steps 2 and 3 by building the necessary API routes and frontend components to display reviews for a selected rental unit and enforce constraints like preventing self-reviews or limiting users to three reviews per day. He was also in charge of merging each team member’s contributions across all phases and ensuring the overall functionality of the project.

## Youtube Phase 2 URL

https://www.youtube.com/watch?v=zsYjvrtr3Yg

## Tech Stack

**Client:** Next.js, React, TailwindCSS

**Server:** Next.js API routes, MySQL

## Getting Started

**Prerequisite:** Node.js 18 or higher, MySQL server

## Environment Variables

Create a `.env.local` file in the `my-app` project root with the following settings

`DB_HOST` =

`DB_USER` =

`DB_PASSWORD` =

`DB_NAME` =

`JWT_SECRET` =your_secure_jwt_secret_key

`NODE_ENV`=development

## Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/GroupProjectRepo2.git

cd GroupProjectRepo2
```

2. Install dependencies

```bash
npm install
cd my-app
npm install
```

3. Run the development server

```bash
npm run dev
```

4. Open your browser and navigate to http://localhost:3000
