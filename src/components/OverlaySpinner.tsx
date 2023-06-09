import React from "react";

interface OverlaySpinnerProps {
  loading: boolean;
}

const OverlaySpinner: React.FC<OverlaySpinnerProps> = ({ loading }) => {
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
        ${loading ? "flex" : "hidden"}`}
    >
      <div className="w-16 h-16 border-t-4 border-white rounded-full animate-spinner"></div>
    </div>
  );
};

export default OverlaySpinner;
