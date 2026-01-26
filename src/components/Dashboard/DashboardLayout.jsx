import React from 'react';

const DashboardLayout = ({ sidebarContent, mapContent }) => {
    return (
        <div className="dashboard-layout">
            <div className="sidebar-section">
                {sidebarContent}
            </div>
            <div className="map-section">
                {mapContent}
            </div>
        </div>
    );
};

export default DashboardLayout;
