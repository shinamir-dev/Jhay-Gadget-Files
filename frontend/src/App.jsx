import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';
import Login from './components/Login/Login';

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {

    const checkAuth = async () => {
      try {

        const res = await fetch('http://192.168.1.189:5000/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });

        if(res.ok){
          setIsAuthenticated(true);
        }else{
          setIsAuthenticated(false);
        }

      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

  }, []);

  if(isAuthenticated === null){
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path='/'
            element={isAuthenticated ? <Navigate to="/dashboard"/>:<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path='/login'
            element={isAuthenticated ? <Navigate to="/dashboard"/>:<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/dashboard/*"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
        </Routes>

      </div>

    </Router>
  );
}

export default App;