import React from 'react';

const DashboardLayout = ({ leftPanel, mapContent, rightPanel }) => {
    return (
        <div className="dashboard-layout">
            <div className="left-panel">
                {leftPanel}
            </div>
            <div className="center-panel">
                {mapContent}
            </div>
            {rightPanel && (
                <div className="right-panel">
                    {rightPanel}
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
