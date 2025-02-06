import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600">Page not found</p>
        <p className="text-gray-500">
          The page you're looking for doesn't exist. If you're an admin, please go to the root page.
        </p>
        <div className="space-x-4">
          <Link to="/">
            <Button>Go to Admin Dashboard</Button>
          </Link>
          <Link to="/user">
            <Button variant="outline">Go to User View</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;