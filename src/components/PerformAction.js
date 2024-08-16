import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Alert, AlertDescription, AlertTitle } from './Alert';
import { Progress } from './Progress';
import './PerformAction.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const TEMPLATE_IDS = {
    SEED: '653266',
    COMPOST: '653267',
    WATERINGCAN: '653268',
};

const PerformAction = ({ session, action, plotId }) => {
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [nftDetails, setNftDetails] = useState([]);
    const [selectedNFTs, setSelectedNFTs] = useState({
        seed: '',
        compost: '',
        wateringCan: '',
    });
    const [wateringCanUses, setWateringCanUses] = useState(null);
    const [plotStatus, setPlotStatus] = useState(null);

    const fetchPlotStatus = useCallback(async () => {
        if (!plotId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/plotStatus/${plotId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setPlotStatus(data);
        } catch (error) {
            console.error('Error fetching plot status:', error);
            setStatus('Error fetching plot status. Please try again.');
        }
    }, [plotId]);

    const fetchNFTs = useCallback(async () => {
        if (!session?.actor) {
            setStatus('Error: Please login first');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/nfts/${session.actor}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (Array.isArray(result.nfts) && result.nfts.length > 0) {
                const userNFTs = result.nfts.map(nft => {
                    const imageUrl = nft.data.img ? `${IPFS_GATEWAY}${nft.data.img}` : '/path/to/placeholder-image.png';
                    console.log("Constructed IPFS URL:", imageUrl);

                    return {
                        templateId: nft.template.template_id,
                        image: imageUrl,
                        assetId: nft.asset_id,
                        name: nft.name,
                        issued: nft.template_mint,
                        uses: parseInt(nft.data.uses, 10) || 10,
                    };
                });
                setNftDetails(userNFTs);
            } else {
                setNftDetails([]);
                setStatus('No NFTs available');
            }
        } catch (error) {
            handleError('Error fetching NFTs', error);
        }
    }, [session]);

    const fetchWateringCanStatus = useCallback(async () => {
        if (!selectedNFTs.wateringCan) return;

        try {
            const response = await fetch(`${API_BASE_URL}/nftStatus/${selectedNFTs.wateringCan}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setWateringCanUses(data.uses);
        } catch (error) {
            console.error('Error fetching watering can status:', error);
            setWateringCanUses(null);
        }
    }, [selectedNFTs.wateringCan]);

    useEffect(() => {
        fetchPlotStatus();
        fetchWateringCanStatus();

        if (['plantseeds', 'waterplants', 'harvest'].includes(action)) {
            const intervalId = setInterval(() => {
                fetchPlotStatus();
                fetchWateringCanStatus();
            }, 5000);

            return () => clearInterval(intervalId);
        }
    }, [fetchPlotStatus, fetchWateringCanStatus, action]);

    useEffect(() => {
        if (session && plotId) {
            console.log('Session and plotId available, fetching NFTs');
            fetchNFTs();
        } else {
            console.log('Session or plotId not available', { session, plotId });
        }
    }, [session, plotId, fetchNFTs]);

    const handleError = (defaultMessage, error) => {
        console.error(defaultMessage, error);
        let errorMessage = `${defaultMessage}: ${error.message || 'Unknown error occurred'}`;
        if (error.response) {
            console.error('Full error response:', error.response);
            errorMessage += ` (Status: ${error.response.status})`;
        }
        setStatus(errorMessage);
    };

    const handleNFTChange = (type) => (e) => {
        const value = e.target.value;
        setSelectedNFTs(prev => ({
            ...prev,
            [type]: value,
        }));
        if (type === 'wateringCan') {
            setWateringCanUses(null); // Reset uses when a new can is selected
            fetchWateringCanStatus();
        }
    };

    const performAction = async (actionType = action) => {
        if (!session?.actor) {
            setStatus('Error: Please login first');
            return;
        }

        if (!plotId && actionType !== 'refillcan') {
            setStatus('Error: No plot selected');
            return;
        }

        console.log('Performing action:', actionType);

        setIsLoading(true);
        setStatus('');

        try {
            const actionData = {
                action: actionType,
                user: session.actor,
                plot_id: actionType !== 'refillcan' ? parseInt(plotId, 10) : undefined,
            };

            if (actionType === 'plantseeds') {
                actionData.seed_nft_id = selectedNFTs.seed ? parseInt(selectedNFTs.seed, 10) : undefined;
                actionData.compost_nft_id = selectedNFTs.compost ? parseInt(selectedNFTs.compost, 10) : undefined;
            } else if (actionType === 'waterplants' || actionType === 'refillcan') {
                actionData.watering_can_nft_id = selectedNFTs.wateringCan ? parseInt(selectedNFTs.wateringCan, 10) : undefined;
            }

            console.log('Sending action data:', actionData);

            const response = await fetch(`${API_BASE_URL}/performAction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(actionData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Unknown error occurred');
            }

            if (!result.success) {
                throw new Error(result.error || result.message || 'Unknown error occurred');
            }

            setStatus(`${actionType} action performed successfully`);
            fetchNFTs();
            fetchPlotStatus();
            fetchWateringCanStatus();
        } catch (error) {
            if (error.message.includes("The watering can has no water left")) {
                setStatus("Error: The watering can is empty. Please refill it before use.");
                setWateringCanUses(0);
            } else {
                handleError(`Error performing ${actionType} action`, error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getActionStatus = () => {
        if (!plotStatus && action !== 'refillcan') return { disabled: true, message: 'Loading plot status...' };

        switch (action) {
            case 'plantseeds':
                if (plotStatus.has_planted_seeds) {
                    return { disabled: true, message: 'Seeds have already been planted on this plot.' };
                }
                if (!selectedNFTs.seed || !selectedNFTs.compost) {
                    return { disabled: true, message: 'Please select both seed and compost NFTs.' };
                }
                return { disabled: false, message: 'Ready to plant seeds.' };
            case 'waterplants':
                if (!plotStatus.has_planted_seeds) {
                    return { disabled: true, message: 'You need to plant seeds first.' };
                }
                if (plotStatus.has_watered_plants) {
                    return { disabled: true, message: 'Plants have already been watered.' };
                }
                if (!selectedNFTs.wateringCan) {
                    return { disabled: true, message: 'Please select a watering can NFT.' };
                }
                if (wateringCanUses === 0) {
                    return { disabled: true, message: 'The watering can is empty. Please refill it.' };
                }
                return { disabled: false, message: 'Ready to water plants.' };
            case 'harvest':
                if (!plotStatus.has_planted_seeds) {
                    return { disabled: true, message: 'You need to plant seeds first.' };
                }
                if (!plotStatus.has_watered_plants) {
                    return { disabled: true, message: 'You need to water the plants before harvesting.' };
                }
                if (plotStatus.has_harvested_crops) {
                    return { disabled: true, message: 'Crops have already been harvested.' };
                }
                return { disabled: false, message: 'Ready to harvest crops.' };
            case 'sellcrops':
                if (!plotStatus.has_harvested_crops) {
                    return { disabled: true, message: 'You need to harvest crops before selling.' };
                }
                return { disabled: false, message: 'Ready to sell crops.' };
            case 'refillcan':
                if (!selectedNFTs.wateringCan) {
                    return { disabled: true, message: 'Please select a watering can NFT.' };
                }
                if (wateringCanUses === 10) {
                    return { disabled: true, message: 'The watering can is already full.' };
                }
                return { disabled: false, message: 'Ready to refill watering can.' };
            default:
                return { disabled: true, message: 'Unknown action.' };
        }
    };

    const actionStatus = getActionStatus();

    const renderNFTSelect = (type, title, templateId) => (
        <Card className="nft-display">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <select 
                    onChange={handleNFTChange(type)} 
                    value={selectedNFTs[type]} 
                    className="w-full p-2 border rounded"
                >
                    <option value="" disabled>Select {title}</option>
                    {nftDetails.filter(nft => nft.templateId === templateId).map(nft => (
                        <option key={nft.assetId} value={nft.assetId}>
                            Issued: {nft.issued}
                        </option>
                    ))}
                </select>
                {selectedNFTs[type] && (
                    <img
                        src={nftDetails.find(nft => nft.assetId === selectedNFTs[type])?.image}
                        alt={`Selected ${title}`}
                        className="nft-image"
                    />
                )}
                {type === 'wateringCan' && selectedNFTs.wateringCan && (
                    <div className="progress-container">
                        {wateringCanUses !== null ? (
                            <>
                                <Progress value={(wateringCanUses / 10) * 100} className="mt-2" />
                                <p className="progress-label">{wateringCanUses} uses left</p>
                            </>
                        ) : (
                            <p className="progress-label">Loading watering can status...</p>
                        )}
                        <Button
                            onClick={() => performAction('refillcan')}
                            disabled={wateringCanUses === 10 || isLoading}
                            className="refill-button mt-2"
                        >
                            Refill Watering Can
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="perform-action">
            <h2 className="text-2xl font-bold mb-6 text-center">
                {action ? action.charAt(0).toUpperCase() + action.slice(1) : ''}
            </h2>

            <div className="nft-display-container">
                {action === 'plantseeds' && (
                    <>
                        {renderNFTSelect('seed', 'Beatz Seeds', TEMPLATE_IDS.SEED)}
                        {renderNFTSelect('compost', 'Compost Soil', TEMPLATE_IDS.COMPOST)}
                    </>
                )}

                {(action === 'waterplants' || action === 'refillcan') && renderNFTSelect('wateringCan', 'Watering Can', TEMPLATE_IDS.WATERINGCAN)}
            </div>

            <Button
                onClick={() => performAction()}
                disabled={actionStatus.disabled || isLoading}
                className={`w-full mb-4 ${actionStatus.disabled || isLoading ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed' : ''}`}
            >
                {isLoading ? <span className="loading-spinner"></span> : action}
            </Button>

            {actionStatus.message && (
                <Alert variant={actionStatus.disabled ? "warning" : "info"} className="mb-4">
                    <AlertTitle>Action Status</AlertTitle>
                    <AlertDescription>{actionStatus.message}</AlertDescription>
                </Alert>
            )}

            {status && (
                <Alert variant={status.includes('Error') ? 'destructive' : 'default'}>
                    <AlertTitle>{status.includes('Error') ? 'Error' : 'Success'}</AlertTitle>
                    <AlertDescription>{status}</AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default PerformAction;
