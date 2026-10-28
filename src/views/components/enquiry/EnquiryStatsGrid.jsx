import React from "react";
/**
 * Interactive KPI Stats Grid
 * Shows counts for Total, New, In-Progress, Resolved, and Closed.
 * Clicking a status card filters the current enquiries list.
 * Clicking status cards filters the active view.
 */
export default function EnquiryStatsGrid({
  counts = {},
  activeStatusFilter = "ALL",
  onSelectFilter,
  showClosedLink = true,
}) {
  const handleCardClick = (filterKey) => {
    if (onSelectFilter) {
      onSelectFilter(filterKey);
    }
  };

  return (
    <div className="kpi-grid">
      {/* Total Card */}
      <div
        className={`kpi-card card-total ${activeStatusFilter === "ALL" ? "kpi-card-active" : ""}`}
        onClick={() => handleCardClick("ALL")}
        role="button"
        tabIndex={0}
        title="Filter by all active enquiries"
      >
        <div className="kpi-label">Active Total</div>
        <div className="kpi-value">{counts.activeTotal ?? 0}</div>
        <div className="kpi-hint">Total open items</div>
      </div>

      {/* New Card */}
      <div
        className={`kpi-card card-new ${activeStatusFilter === "NEW" ? "kpi-card-active" : ""}`}
        onClick={() => handleCardClick("NEW")}
        role="button"
        tabIndex={0}
        title="Click to filter NEW enquiries"
      >
        <div className="kpi-label">New</div>
        <div className="kpi-value">{counts.new ?? 0}</div>
        <div className="kpi-hint">Pending initial review</div>
      </div>

      {/* In-Progress Card */}
      <div
        className={`kpi-card card-inprogress ${
          activeStatusFilter === "IN_PROGRESS" ? "kpi-card-active" : ""
        }`}
        onClick={() => handleCardClick("IN_PROGRESS")}
        role="button"
        tabIndex={0}
        title="Click to filter IN_PROGRESS enquiries"
      >
        <div className="kpi-label">In-Progress</div>
        <div className="kpi-value">{counts.inProgress ?? 0}</div>
        <div className="kpi-hint">Under active investigation</div>
      </div>

      {/* Resolved Card */}
      <div
        className={`kpi-card card-resolved ${
          activeStatusFilter === "RESOLVED" ? "kpi-card-active" : ""
        }`}
        onClick={() => handleCardClick("RESOLVED")}
        role="button"
        tabIndex={0}
        title="Click to filter RESOLVED enquiries"
      >
        <div className="kpi-label">Resolved</div>
        <div className="kpi-value">{counts.resolved ?? 0}</div>
        <div className="kpi-hint">Addressed & completed</div>
      </div>

      {/* Closed Count Card - Navigates to Closed Archive */}
      {showClosedLink && (
        <div
          className="kpi-card card-closed kpi-card-navigable"
          onClick={() => handleCardClick("CLOSED")}
          role="button"
          tabIndex={0}
          title="Filter the list to CLOSED enquiries"
        >
          <div className="kpi-label">
            Closed
            <span>&rarr;</span>
          </div>
          <div className="kpi-value">{counts.closed ?? 0}</div>
          <div className="kpi-hint">Click to show closed enquiries</div>
        </div>
      )}
    </div>
  );
}
