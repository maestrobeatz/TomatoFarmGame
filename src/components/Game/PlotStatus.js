import React, { useEffect, useState, useCallback } from 'react';
import '../../styles/PlotStatus.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PlotStatus = ({ session, refreshTrigger }) => {
    const [plotStatus, setPlotStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserPlots = useCallback(async () => {
        if (!session?.actor) return;

        setLoading(true);
        try {
            // Fetching plots for the user
            const response = await fetch(`${API_BASE_URL}/plots/${session.actor}`);
            if (!response.ok) {
                if (response.status === 404) {
                    setPlotStatus([]); // No plots found, return empty array
                    return;
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();

            // Fetching the NFTs associated with the user
            const nftsResponse = await fetch(`${API_BASE_URL}/nfts/${session.actor}`);
            if (!nftsResponse.ok) {
                throw new Error(`Failed to fetch NFTs. Status: ${nftsResponse.status}`);
            }

            const nftsData = await nftsResponse.json();

            // Check if the response contains the expected `nfts` array
            if (!nftsData || !nftsData.nfts) {
                throw new Error("NFTs data is unavailable or malformed.");
            }

            // Update plot data with corresponding NFT issue numbers
            const updatedPlots = data.plots.map(plot => {
                const seedNFT = nftsData.nfts.find(nft => nft.asset_id === plot.locked_nft_id);
                const compostNFT = nftsData.nfts.find(nft => nft.asset_id === plot.locked_compost_nft_id);

                return {
                    ...plot,
                    locked_seed_issue_number: seedNFT ? seedNFT.template_mint : 'None',
                    locked_compost_issue_number: compostNFT ? compostNFT.template_mint : 'None',
                };
            });

            setPlotStatus(updatedPlots);
            setError(null);
        } catch (error) {
            setError(error.message);
            console.error("Error fetching plot status or NFTs:", error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchUserPlots();
    }, [fetchUserPlots, refreshTrigger]);

    if (loading) {
        return <p>Loading plot status...</p>;
    }

    if (error) {
        return <p className="error-message">An error occurred: {error}</p>;
    }

    return (
        <div className="PlotStatus">
            <h2>Your Plot Status</h2>
            {plotStatus.length > 0 ? (
                <table className="pivot-table">
                    <thead>
                        <tr>
                            <th>Plot ID</th>
                            <th>Seeds Planted</th>
                            <th>Watered</th>
                            <th>Harvested</th>
                            <th>Locked Seed NFT Issue Number</th>
                            <th>Locked Compost NFT Issue Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plotStatus.map(plot => (
                            <tr key={plot.plot_id}>
                                <td>{plot.plot_id}</td>
                                <td><span className={`status-indicator ${plot.has_planted_seeds ? 'green' : 'red'}`}></span></td>
                                <td><span className={`status-indicator ${plot.has_watered_plants ? 'green' : 'red'}`}></span></td>
                                <td><span className={`status-indicator ${plot.has_harvested_crops ? 'green' : 'red'}`}></span></td>
                                <td>{plot.locked_seed_issue_number || 'None'}</td>
                                <td>{plot.locked_compost_issue_number || 'None'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>You don't have any planted plots yet. Get started by planting your first seed!</p> // Friendly message when no plots are found
            )}
        </div>
    );
};

export default PlotStatus;
