import React from "react";
import headerImage from "../../assets/tpc header.jpg";

/**
 * Official TPC Report Header Component
 * Preserves the approved TPC institutional banner exactly without cropping or distortion.
 */
export default function PrintableReportHeader({ title, subtitle }) {
  return (
    <header className="report-header">
      <div className="report-header-banner-container">
        <img
          src={headerImage}
          alt="Talibon Polytechnic College"
          className="report-header-banner"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      <div className="report-header-text">
        <h1 className="report-title">{title}</h1>
        {subtitle && <p className="report-subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}
