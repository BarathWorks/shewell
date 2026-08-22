import React from "react";
import DashboardContent from "./dashboard-content";
import ApprovalStatusBanner from "./approval-status-banner";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Server component: renders nothing once the practitioner is approved. */}
      <ApprovalStatusBanner />
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
