# Food Truck App

A modern web application for a food truck business, allowing customers to browse the menu, place orders, and track their status. The app also includes an admin dashboard for the food truck owner to manage menu items, track orders, and view business insights.

## Features

- User authentication (login/signup) via email or phone
- Menu browsing with filters (vegan, vegetarian, spicy, gluten-free)
- Shopping cart functionality with local storage persistence
- Order placement and tracking with real-time updates
- Admin dashboard for business management
  - Today's orders management
  - Menu item management
  - Sales reports and analytics
- User profile and settings management
- Optional SMS notifications integration

## Tech Stack

- Next.js 13 (React framework with App Router)
- Supabase (Authentication, Database, and Realtime)
- Tailwind CSS (Styling)
- Zustand (State Management)
- Stripe (Payment Processing)

## Prerequisites

- Node.js 16.8.0 or later
- npm or yarn
- A Supabase account (free tier works for development)
- A Stripe account (optional, for payment processing)
- A Twilio account (optional, for SMS notifications)

## Getting Started

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd food-truck-app
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up Supabase
   - Create a new project in Supabase
   - Go to SQL Editor and run the SQL commands in `supabase-schema.sql`
   - Get your Supabase URL and anon key from the API settings

4. Configure environment variables
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase URL and anon key
   - Add Stripe keys if using payment processing
   - Add Twilio credentials if using SMS notifications

5. Seed the database with sample data (optional)
   ```bash
   npm run seed-db
   # or
   yarn seed-db
   ```

6. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and shared code
- `/public` - Static assets
- `/scripts` - Helper scripts (e.g., database seeding)

## Database Schema

The application uses the following main tables in Supabase:

- `profiles` - User profiles (extends Supabase Auth)
- `menu_items` - Food items available for order
- `orders` - Customer orders
- `order_items` - Individual items within an order

See `supabase-schema.sql` for the complete schema definition.

## Authentication

The app supports two authentication methods:

1. Email/Password - Traditional login with email verification
2. Phone/OTP - One-time password sent via SMS (requires Twilio)

## Admin Access

To create an admin user:

1. Sign up for a regular account
2. In the Supabase dashboard, go to the `profiles` table
3. Find your user and set `is_admin` to `true`

Admin users have access to the admin dashboard at `/admin`.

## Deployment

This application can be deployed to any platform that supports Next.js, such as Vercel, Netlify, or a custom server.

1. Build the application
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server
   ```bash
   npm start
   # or
   yarn start
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```
# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Stripe Configuration (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Optional: Twilio Configuration (for SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```
