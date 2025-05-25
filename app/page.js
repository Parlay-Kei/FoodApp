import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-gray-100 p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-dark mb-6">Food Truck App</h1>
        <p className="text-lg text-gray-600 mb-8">
          Order delicious food from your favorite food truck and skip the line!
        </p>
        <div className="space-y-4">
          <Link href="/login" className="btn-primary w-full block">
            Login
          </Link>
          <Link href="/signup" className="btn-outline w-full block">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
