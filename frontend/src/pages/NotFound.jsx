import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="app-container">
      <Navbar />

      <main className="not-found-container">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Oops! Page Not Found</h1>
        <p className="not-found-desc">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to={user ? "/dashboard" : "/login"} className="btn btn-primary">
          {user ? 'Return to Dashboard' : 'Go to Login'}
        </Link>
      </main>
    </div>
  );
};

export default NotFound;
