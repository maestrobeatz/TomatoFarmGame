// src/components/Select.js

import React from 'react';

export const Select = ({ children, onChange, value }) => (
    <select
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded-lg"
    >
        {children}
    </select>
);

export const SelectItem = ({ value, children }) => (
    <option value={value}>
        {children}
    </option>
);
