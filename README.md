# Food Truck App

## Description
A Next.js application for ordering food from a food truck. It allows users to browse the menu, add items to their cart, and place orders. It also includes an admin interface for managing the menu and orders.

## Features
- User authentication (signup, login)
- Browse menu
- Add items to cart
- Place orders
- Order history
- Admin panel for menu and order management

## Tech Stack
- Next.js
- React
- Supabase
- Stripe
- Tailwind CSS
- Zustand

## Getting Started
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up environment variables: Create a `.env.local` file based on `.env.example` and fill in the required Supabase and Stripe credentials.
4. Seed the database: `npm run seed-db`
5. Run the development server: `npm run dev`

## Testing
- Run tests: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Run tests with coverage: `npm run test:coverage`

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request.

## License
This project is licensed under the MIT License.

## Automated Testing Setup & Enhancements
We've introduced a comprehensive automated testing suite using Jest (for unit/integration tests) and Playwright (for end-to-end tests), along with setting up a basic CI workflow. We also addressed an immediate UI issue by adding a cart badge.

### 1. Unit/Integration Tests (Jest & React Testing Library)
- **Cart Store (__tests__/components/useCartStore.test.ts):** Added tests to verify the core logic of adding and removing items from your Zustand cart store.
- **Protected Route (__tests__/components/ProtectedRoute.test.tsx):** Created integration tests to ensure that the ProtectedRoute component correctly redirects unauthenticated users to the login page and renders content for authenticated users. These tests were refined to mock the useRouter hook and the useAuth hook for more accurate behavior simulation, including testing a loading state.
- **Navbar (__tests__/components/Navbar.test.tsx):** Added unit tests to check the visibility of the admin link based on user role and included a basic test structure for verifying the cart badge updates (though the badge implementation was done directly in the component later).
- **Settings (__tests__/components/Settings.test.tsx):** Created a scaffold for unit tests to cover toggling settings options and displaying save feedback. (Note: Requires customization of selectors and potentially mocks for specific settings logic.)
- **Help Modal (__tests__/components/HelpModal.test.tsx):** Created unit tests to verify the modal's open/close functionality via button clicks and Escape key presses. (Note: Requires customization of selectors and potentially mocks for specific modal state management.)

### 2. End-to-End (E2E) Tests (Playwright)
- **Playwright Setup:** Installed Playwright and its browsers (@playwright/test) and created a basic configuration file (playwright.config.ts) defining test directories, browsers (Chromium, Firefox, Webkit), and reporting.
- **Menu Page Flow (e2e/menu.spec.ts):** Created E2E tests to verify key interactions on the menu page, specifically filtering items by category and adding an item to the cart (with verification by navigating to the cart page). (Note: Requires customization of selectors based on your MenuPage structure.)
- **Cart Drawer Flow (e2e/cart-drawer.spec.ts):** Created E2E tests for the cart drawer. This includes tests for updating item quantity, removing individual items, and clearing the entire cart. To facilitate these tests, the components/CartDrawer.tsx file was modified to include the necessary UI structure and selectors (using standard HTML elements as placeholders). The tests were updated to use these selectors and include the action to open the drawer by clicking the "Cart" link in the header (a[href="/cart"]). (Note: Requires replacing standard HTML elements in CartDrawer.tsx with your actual UI components and ensuring the selectors remain correct.)
- **Authentication Flows (e2e/auth.spec.ts):** Created E2E tests for user authentication, including scenarios for successful signup, successful login, and login with invalid credentials. (Note: Requires customization of selectors for your auth forms and providing valid test user credentials for successful login. Signup tests may require a cleanup strategy.)

### 3. Component Enhancement
- **NavTabs Cart Badge (components/NavTabs.tsx):** Added a visual indicator (badge) to the "Cart" link in the navigation tabs that displays the current number of items in the cart by integrating with the useCartStore.

### 4. Continuous Integration (CI)
- **GitHub Actions Workflow (.github/workflows/ci.yml):** Created a basic workflow file to automatically run your Jest unit tests on every push and pull request and run Playwright E2E tests on pushes to main and develop branches. It also includes steps to install dependencies, set up browsers, and upload the Playwright HTML report on E2E test failures. (Note: This workflow assumes a GitHub repository and may need adjustments for other CI providers.)
