import React from "react";
import useDashboardController from "../../controllers/useDashboardController";
import useAuthController from "../../controllers/useAuthController";
import EnquiryStatsGrid from "../components/enquiry/EnquiryStatsGrid";
import EnquiryFilterBar from "../components/enquiry/EnquiryFilterBar";
import EnquiryTable from "../components/enquiry/EnquiryTable";
import EnquiryEditModal from "../components/enquiry/EnquiryEditModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Loading from "../components/common/Loading";

export default function AdminDashboardPage() {
  const { handleLogout, adminProfile } = useAuthController();

  const {
    enquiries,
    counts,
    isLoading,
    errorMessage,
    feedback,
    setFeedback,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    updatingId,
    editingEnquiry,
    isSavingEdit,
    deletingEnquiry,
    isDeleting,
    fetchEnquiries,
    handleStatusChange,
    openEditModal,
    closeEditModal,
    handleSaveEdit,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    resetFilters,
  } = useDashboardController({ viewMode: "ALL" });

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1 className="dashboard-title">Employee Enquiry Management</h1>
          <p className="dashboard-subtitle">
            Manage employee enquiries across the full lifecycle
          </p>
        </div>

        <div className="dashboard-header-actions">
          <div className="admin-profile-pill">
            <span className="admin-avatar">👤</span>
            <div className="admin-profile-text">
              <span className="admin-name">
                {adminProfile?.name || "Administrator"}
              </span>
              <span className="admin-email">{adminProfile?.email || ""}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleLogout}
            title="Log out of admin session"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Interactive KPI Statistic Cards */}
      <EnquiryStatsGrid
        counts={counts}
        activeStatusFilter={statusFilter}
        onSelectFilter={(status) => setStatusFilter(status)}
        showClosedLink={true}
      />

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`alert ${
            feedback.type === "success"
              ? "alert-success"
              : feedback.type === "warning"
                ? "alert-warning"
                : "alert-danger"
          }`}
          role="alert"
        >
          <span className="alert-icon">
            {feedback.type === "success"
              ? "✓"
              : feedback.type === "warning"
                ? "ℹ️"
                : "⚠️"}
          </span>
          <div className="alert-content-flex">
            <span>{feedback.text}</span>
            <button
              type="button"
              className="alert-close-btn"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss feedback"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Backend Error Banner */}
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          <span className="alert-icon">⚠️</span>
          <div className="alert-content-flex">
            <div>
              <strong>Error Loading Enquiries:</strong> {errorMessage}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={fetchEnquiries}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="table-card">
        <div className="table-card-header">
          <div className="table-title-group">
            <h2 className="table-title">All Enquiries</h2>
            <span className="workflow-hint-badge">
              Workflow: NEW &rarr; IN_PROGRESS &rarr; RESOLVED &rarr; CLOSED
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchEnquiries}
            disabled={isLoading}
            title="Refresh enquiry list"
          >
            {isLoading ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Filter and Search Bar */}
        <EnquiryFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={resetFilters}
          totalResults={enquiries.length}
          isClosedView={false}
        />

        {/* Table Content */}
        {isLoading ? (
          <div className="table-loading-wrap">
            <Loading message="Loading active enquiries from backend..." />
          </div>
        ) : (
          <EnquiryTable
            enquiries={enquiries}
            updatingId={updatingId}
            onStatusChange={handleStatusChange}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
            isClosedTable={false}
          />
        )}
      </div>

      {/* Admin Edit Modal */}
      <EnquiryEditModal
        isOpen={Boolean(editingEnquiry)}
        enquiry={editingEnquiry}
        isLoading={isSavingEdit}
        onSave={handleSaveEdit}
        onClose={closeEditModal}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingEnquiry)}
        title="Confirm Enquiry Deletion"
        message={
          deletingEnquiry
            ? `Are you sure you want to permanently delete enquiry #${deletingEnquiry.id} from "${deletingEnquiry.name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
