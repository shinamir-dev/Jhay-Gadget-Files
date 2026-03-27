import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSummary } from '../../../api/inventoryAPI';
import './Inventory.css' 

function Inventory() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [colors, setColors] = useState([]);
    const [status, setStatus] = useState("available");

    const pollingInterval = 20000;

    const fetchReport = async() => {
        try {
            const data = await getSummary(status);
            console.log(data);
            setReports(data);

            const colorSet = new Set();
            data.forEach(item => {
                Object.keys(item).forEach(key => {
                if (key !== "unit" && key !== "total") {
                    colorSet.add(key);
                }
                });
            });

            setColors(Array.from(colorSet));
        } catch (error) {
            console.error("Error fetching the report", report)
        }
    }

    useEffect(() => {
        fetchReport();
        const intervalId = setInterval(fetchReport, pollingInterval);
        return () => clearInterval(intervalId);
    }, [status]);

    const calculateOverallTotal = () => {
        return reports.reduce((sum, item) => sum + item.total, 0);
    };

    const handleButtonCategory = (type) => {
        setStatus(type);
    };

    return (
    <div className="report-table">
        <h2 className="h2-report">
            JHAY GADGET INVENTORY ({status.toUpperCase()})
        </h2>

        <div className="category-buttons">
            <button onClick={() => handleButtonCategory("available")}>
            Available
            </button>
            <button onClick={() => handleButtonCategory("sold")}>
            Sold
            </button>
            <button onClick={() => handleButtonCategory("defective")}>
            Defective
            </button>
        </div>

        <table className="table-report">
            <thead>
            <tr>
                <th>Model</th>
                {colors.map((color, index) => (
                <th key={index}>{color}</th>
                ))}
                <th>Total</th>
            </tr>
            </thead>

            <tbody>
            {reports.map((product, index) => (
                <tr key={index}>
                <td>{product.unit}</td>

                {colors.map((color) => (
                    <td key={color}>
                    {product[color] ?? 0}
                    </td>
                ))}

                <td>{product.total}</td>
                </tr>
            ))}

            {/* Overall Total Row */}
            <tr>
                <td><strong>Overall Total</strong></td>

                {colors.map((color) => (
                <td key={color}>
                    {reports.reduce(
                    (sum, product) => sum + (product[color] ?? 0),
                    0
                    )}
                </td>
                ))}

                <td><strong>{calculateOverallTotal()}</strong></td>
            </tr>
            </tbody>
        </table>
        </div>
    );

}

export default Inventory;