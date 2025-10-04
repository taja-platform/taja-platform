import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-4">Page Not Found</p>
      <Link
        to="/"
        className="mt-8 px-6 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
