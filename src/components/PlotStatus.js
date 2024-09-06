import React, { useEffect, useState, useCallback } from 'react';
import './PlotStatus.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PlotStatus = ({ session, refreshTrigger }) => {
    const [plotStatus, setPlotStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserPlots = useCallback(async () => {
        if (!session?.actor) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/plots/${session.actor}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('You don\'t have any planted plots.');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            const data = await response.json();

            // Fetch Issue Numbers for Locked NFTs
            const nftsResponse = await fetch(`${API_BASE_URL}/nfts/${session.actor}`);
            const nftsData = await nftsResponse.json();

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
        return <p className="error-message">{error === 'You don\'t have any planted plots.' ? error : "An error occurred. Please try again."}</p>;
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
                <p>You don't have any planted plots.</p>
            )}
        </div>
    );
};

export default PlotStatus;
