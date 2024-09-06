import React, { useState, useEffect, useCallback } from 'react';
import './Farms.css';
import { getFarmers, getInventory } from './api';

const Farms = ({ session }) => {
    const [farmers, setFarmers] = useState([]);
    const [inventory, setInventory] = useState([]);

    const fetchAccountData = useCallback(async () => {
        if (!session?.actor) return;

        try {
            const farmerData = await getFarmers();
            setFarmers(farmerData.farmers || []);

            const inventoryData = await getInventory(session.actor);
            setInventory(inventoryData.items || []);
        } catch (error) {
            console.error('Error fetching account data:', error);
        }
    }, [session]);

    useEffect(() => {
        fetchAccountData();
    }, [fetchAccountData]);

    return (
        <div className="farms">
            <h3>Farms</h3>
            <div className="farmers-list">
                {farmers.map((farmer) => (
                    <div key={farmer.accountName} className="farmer-card">
                        <p>Farmer: {farmer.nickname} ({farmer.accountName})</p>
                    </div>
                ))}
            </div>
            <div className="inventory-list">
                {inventory.map((item, index) => (
                    <div key={index} className="inventory-item">
                        <p>{item.itemName}: {item.quantity}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Farms;
