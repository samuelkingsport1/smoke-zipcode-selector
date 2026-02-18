import React from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';

const RespiratoryMode = () => {
    return (
        <DashboardLayout
            leftPanel={<div>Respiratory Mode (Safe)</div>}
            mapContent={<div>Map Placeholder</div>}
            rightPanel={<div>Status Panel</div>}
        />
    );
};

export default RespiratoryMode;
