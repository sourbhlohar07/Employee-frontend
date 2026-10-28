import React from 'react';
import { Link } from 'react-router-dom';
import useDashboardController from '../../controllers/useDashboardController';
import useAuthController from '../../controllers/useAuthController';
import EnquiryFilterBar from '../components/enquiry/EnquiryFilterBar';
import EnquiryTable from '../components/enquiry/EnquiryTable';
import EnquiryEditModal from '../components/enquiry/EnquiryEditModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Loading from '../components/common/Loading';

export default function ClosedEnquiriesPage() {
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
  } = useDashboardController({ viewMode: 'CLOSED' });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <div className="back-link-wrap">
            <Link to="/admin/dashboard" className="btn btn-secondary btn-sm">
              &larr; Back to Active Enquiries
            </Link>
          </div>
          <h1 className="dashboard-title">Closed Enquiries Archive</h1>
          <p className="dashboard-subtitle">
            Historical record of all resolved, completed, and closed employee enquiries
          </p>
        </div>

        <div className="dashboard-header-actions">
          <div className="admin-profile-pill">
            <span className="admin-avatar">👤</span>
            <div className="admin-profile-text">
              <span className="admin-name">{adminProfile?.name || 'Administrator'}</span>
              <span className="admin-email">{adminProfile?.email || ''}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleLogout}
            title="Log out"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Closed Count Banner Card */}
      <div className="closed-summary-card">
        <div className="closed-summary-icon">📁</div>
        <div className="closed-summary-info">
          <span className="closed-summary-title">Archived Closed Enquiries</span>
          <span className="closed-summary-subtitle">
            These enquiries have finished their lifecycle and are separated from active operations.
          </span>
        </div>
        <div className="closed-summary-count">
          <span className="closed-count-number">{counts.closed}</span>
          <span className="closed-count-label">Closed Total</span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`alert ${
            feedback.type === 'success'
              ? 'alert-success'
              : feedback.type === 'warning'
              ? 'alert-warning'
              : 'alert-danger'
          }`}
          role="alert"
        >
          <span className="alert-icon">
            {feedback.type === 'success'
              ? '✓'
              : feedback.type === 'warning'
              ? 'ℹ️'
              : '⚠️'}
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
              <strong>Error Loading Closed Enquiries:</strong> {errorMessage}
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
            <h2 className="table-title">Closed Records</h2>
            <span className="table-count-badge">
              {enquiries.length} {enquiries.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchEnquiries}
            disabled={isLoading}
            title="Refresh list"
          >
            {isLoading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Search and Sort Toolbar */}
        <EnquiryFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter="CLOSED"
          onStatusFilterChange={() => {}}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={resetFilters}
          totalResults={enquiries.length}
          isClosedView={true}
        />

        {/* Closed Table */}
        {isLoading ? (
          <div className="table-loading-wrap">
            <Loading message="Loading closed enquiries from backend..." />
          </div>
        ) : (
          <EnquiryTable
            enquiries={enquiries}
            updatingId={updatingId}
            onStatusChange={handleStatusChange}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
            isClosedTable={true}
          />
        )}
      </div>

      {/* Edit Modal */}
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
        title="Confirm Permanent Deletion"
        message={
          deletingEnquiry
            ? `Are you sure you want to permanently delete closed enquiry #${deletingEnquiry.id} from "${deletingEnquiry.name}"?`
            : ''
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
