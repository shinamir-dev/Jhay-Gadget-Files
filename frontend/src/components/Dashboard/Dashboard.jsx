import { Routes, Route } from 'react-router-dom';
import Navbar from '../Navigation/Navbar';
import Home from '../Pages/Home';
import Inventory from '../Pages/Inventory/Inventory';
import Units from '../Pages/Units/Units';
import Pos from '../Pages/Point of Sale/pos';
import Cashier from '../Pages/Point of Sale/Cashier';

function Dashboard() {
    return (
        <>
            <Navbar />
            <div className="dashboard-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path='/inventory' element={<Inventory />}/>
                    <Route path='/units' element={<Units />} />
                    <Route path='/pos' element={<Pos />}/>
                    <Route path='/cashier/:product_id/:color_id' element={<Cashier />}/>
                </Routes>
            </div>
        </>
    );
}

export default Dashboard;