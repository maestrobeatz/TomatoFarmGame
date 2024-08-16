// components/Collections.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Collections.css'; // Ensure this file exists in the correct path

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3003';

const Collections = ({ session }) => {
    const [collections, setCollections] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCollections = async () => {
            if (!session) return;

            setIsLoading(true);
            setError('');

            try {
                const accountName = session.actor.toString();
                console.log(`Fetching collections for account: ${accountName}`);
                const response = await axios.get(`${API_BASE_URL}/collections`, {
                    params: { accountName }
                });
                console.log('Collections response:', response.data);
                setCollections(response.data.collections || []);
            } catch (error) {
                console.error('Error fetching collections:', error);
                setError('Failed to fetch collections. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCollections();
    }, [session]);

    if (!session) {
        return <p className="login-message">Please log in to view your collections</p>;
    }

    return (
        <div className="collections-container">
            <h2>Your Collections</h2>
            {isLoading ? (
                <p className="loading">Loading collections...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : collections.length === 0 ? (
                <p className="empty-message">You don't have any collections yet.</p>
            ) : (
                <ul className="collections-list">
                    {collections.map((collection, index) => (
                        <li key={index} className="collection-item">{collection.collection_name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Collections;
