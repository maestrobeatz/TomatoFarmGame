// src/components/Alert.js

import React from 'react';

export const Alert = ({ children, variant = 'default' }) => {
    const bgColor = variant === 'destructive' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
    return (
        <div className={`p-4 rounded-lg ${bgColor}`}>
            {children}
        </div>
    );
};

export const AlertTitle = ({ children }) => (
    <h4 className="font-bold mb-2">
        {children}
    </h4>
);

export const AlertDescription = ({ children }) => (
    <p>
        {children}
    </p>
);
