import React from 'react';

const PlaceholderMode = ({ title }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            backgroundColor: '#f8f9fa'
        }}>
            <h2>{title} Mode</h2>
            <p>This utility is currently under development.</p>
        </div>
    );
};

export default PlaceholderMode;
