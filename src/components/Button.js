// src/components/Button.js

import React from 'react';

export const Button = ({ children, onClick, disabled = false, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg ${disabled ? 'bg-red-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white ${className}`}
    >
        {children}
    </button>
);
