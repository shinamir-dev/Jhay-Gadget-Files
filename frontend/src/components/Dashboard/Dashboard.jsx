import { Routes, Route } from 'react-router-dom';
import Navbar from '../Navigation/Navbar';
import Home from '../Pages/Home';

function Dashboard() {
    return (
        <>
            <Navbar />
            <div className="dashboard-content">
                <Routes>
                    <Route path="/" element={<Home />} />

                </Routes>
            </div>
        </>
    );
}

export default Dashboard;