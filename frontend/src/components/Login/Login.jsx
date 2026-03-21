import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../Login/Login.css';
import { login } from "../../api/authAPI";

function Login({ setIsAuthenticated }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const data = await login({ username, password });
            localStorage.setItem('token', data.token);  
            setSuccessMessage('Login Successfully!');
            setIsAuthenticated(true); 
            console.log('Login successful');
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
          <div className="login-container">
            <h2>Jhay Gadget</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className="login-btn" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                {error && <p className="error">{error}</p>}
                {successMessage && <p className="success">{successMessage}</p>}
            </form>
            <p className="registration-link">
                Don't have an account? <a href="/Register">Register here</a>
            </p>
        </div>
        </div>
    );
}

export default Login;