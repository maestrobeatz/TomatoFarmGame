// src/components/Card.js

import React from 'react';

export const Card = ({ children, className = '' }) => (
    <div className={`border rounded-lg p-4 shadow-sm ${className}`}>
        {children}
    </div>
);

export const CardHeader = ({ children }) => (
    <div className="border-b pb-2 mb-4">
        {children}
    </div>
);

export const CardTitle = ({ children }) => (
    <h3 className="text-lg font-bold">
        {children}
    </h3>
);

export const CardContent = ({ children }) => (
    <div>
        {children}
    </div>
);
