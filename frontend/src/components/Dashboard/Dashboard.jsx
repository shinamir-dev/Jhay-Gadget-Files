import { Routes, Route } from 'react-router-dom';
import Navbar from '../Navigation/Navbar';
import Home from '../Pages/Home';
import Inventory from '../Pages/Inventory/Inventory';
import Units from '../Pages/Units/Units';

function Dashboard() {
    return (
        <>
            <Navbar />
            <div className="dashboard-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path='/inventory' element={<Inventory />}/>
                    <Route path='/units' element={<Units />} />
                </Routes>
            </div>
        </>
    );
}

export default Dashboard;