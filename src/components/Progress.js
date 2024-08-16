// src/components/Progress.js

import React from 'react';

export const Progress = ({ value }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
        <div
            className="bg-green-500 h-full rounded-full"
            style={{ width: `${value}%` }}
        ></div>
    </div>
);
