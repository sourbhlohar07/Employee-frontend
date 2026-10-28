import React from "react";
import { STATUS_ENUM } from "../../../models/enquiryModel";

export default function EnquiryFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  onResetFilters,
  totalResults,
  isClosedView = false,
}) {
  return (
    <div className="filter-bar">
      {/* Search Input */}
      <div className="filter-search-group">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="filter-search-input"
          placeholder="Search by name, email, phone, city, message..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange("")}
            title="Clear search"
          >
            &times;
          </button>
        )}
      </div>

      <div className="filter-controls-group">
        {/* Status Filter (Only if not in Closed View) */}
        <div className="filter-control-item">
          <label htmlFor="status-filter-select" className="filter-label">
            Status:
          </label>

          <select
            id="status-filter-select"
            className="filter-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="ALL">All Enquiries</option>
            <option value={STATUS_ENUM.NEW}>New</option>
            <option value={STATUS_ENUM.IN_PROGRESS}>In-Progress</option>
            <option value={STATUS_ENUM.RESOLVED}>Resolved</option>
            <option value={STATUS_ENUM.CLOSED}>Closed</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="filter-control-item">
          <label htmlFor="sort-select" className="filter-label">
            Sort by:
          </label>
          <select
            id="sort-select"
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="latest">Latest Enquiry (Newest First)</option>
            <option value="oldest">Oldest Date First</option>
            <option value="name-asc">Name (A &rarr; Z)</option>
            <option value="name-desc">Name (Z &rarr; A)</option>
            <option value="city-asc">City (A &rarr; Z)</option>
          </select>
        </div>

        {/* Reset Filters */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onResetFilters}
          title="Reset search and filters"
        >
          Reset
        </button>

        <span className="filter-result-count">
          <strong>{totalResults}</strong>{" "}
          {totalResults === 1 ? "enquiry" : "enquiries"}
        </span>
      </div>
    </div>
  );
}
