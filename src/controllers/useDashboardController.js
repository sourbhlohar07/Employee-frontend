import { useState, useEffect, useCallback, useMemo } from "react";
import { enquiryService } from "../services/enquiryService";
import {
  STATUS_ENUM,
  canTransitionStatus,
  filterAndSortEnquiries,
  validateEnquiryData,
} from "../models/enquiryModel";
import { extractErrorMessage } from "../services/apiService";

/**
 * Controller: Manages state, transitions, search, sorting, modal editing, and deletion for enquiries
 * @param {Object} options
 * @param {'ALL' | 'CLOSED'} options.viewMode - 'ALL' enquiries or only 'CLOSED' enquiries
 */
export const useDashboardController = ({ viewMode = "ALL" } = {}) => {
  // All raw enquiries from backend
  const [allEnquiries, setAllEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("latest");

  // Updating row status in progress (ID of enquiry)
  const [updatingId, setUpdatingId] = useState(null);

  // Edit Modal State
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Dialog State
  const [deletingEnquiry, setDeletingEnquiry] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch enquiries callback
  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await enquiryService.fetchEnquiries(0, 100);

      // Handle Spring Page vs plain Array response
      let list = [];
      if (data && Array.isArray(data.content)) {
        list = data.content;
      } else if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === "object" && Array.isArray(data.data)) {
        list = data.data;
      }

      setAllEnquiries(list);
    } catch (err) {
      const parsed = extractErrorMessage(err);
      setErrorMessage(parsed);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Overall KPI counts computed from ALL enquiries
  const counts = useMemo(() => {
    const list = allEnquiries;
    return {
      //  total: list.length,
      new: list.filter(
        (e) => (e.status || "").toUpperCase() === STATUS_ENUM.NEW,
      ).length,
      inProgress: list.filter(
        (e) => (e.status || "").toUpperCase() === STATUS_ENUM.IN_PROGRESS,
      ).length,
      resolved: list.filter(
        (e) => (e.status || "").toUpperCase() === STATUS_ENUM.RESOLVED,
      ).length,
      closed: list.filter(
        (e) => (e.status || "").toUpperCase() === STATUS_ENUM.CLOSED,
      ).length,
      activeTotal: list.filter(
        (e) => (e.status || "").toUpperCase() !== STATUS_ENUM.CLOSED,
      ).length,
    };
  }, [allEnquiries]);

  // Base list based on viewMode
  const baseEnquiries = useMemo(() => {
    if (viewMode === "CLOSED") {
      return allEnquiries.filter(
        (e) => (e.status || "").toUpperCase() === STATUS_ENUM.CLOSED,
      );
    }
    return allEnquiries;
  }, [allEnquiries, viewMode]);

  // Filtered and sorted enquiries based on user controls
  const displayedEnquiries = useMemo(() => {
    return filterAndSortEnquiries(baseEnquiries, {
      searchTerm,
      statusFilter,
      sortBy,
    });
  }, [baseEnquiries, searchTerm, statusFilter, sortBy]);

  // One-way forward status change handler
  const handleStatusChange = async (enquiryId, newStatus) => {
    const target = allEnquiries.find((item) => item.id === enquiryId);
    if (!target) return;

    const currentStatus = (target.status || STATUS_ENUM.NEW).toUpperCase();
    const targetStatus = newStatus.toUpperCase();

    // Prevent same status or backward transition
    if (currentStatus === targetStatus) return;

    if (!canTransitionStatus(currentStatus, targetStatus)) {
      setFeedback({
        type: "error",
        text: `Cannot revert status from ${currentStatus} to ${targetStatus}. Enquiries can only advance forward in the workflow.`,
      });
      return;
    }

    setUpdatingId(enquiryId);
    setFeedback(null);

    try {
      await enquiryService.updateStatus(enquiryId, targetStatus);

      // Successfully updated: update local state
      setAllEnquiries((prev) =>
        prev.map((item) =>
          item.id === enquiryId ? { ...item, status: targetStatus } : item,
        ),
      );

      const isNowClosed = targetStatus === STATUS_ENUM.CLOSED;
      setFeedback({
        type: "success",
        text: isNowClosed
          ? `Enquiry #${enquiryId} was marked as CLOSED and moved to the Closed Enquiries archive.`
          : `Enquiry #${enquiryId} status advanced to ${targetStatus}.`,
      });
    } catch (err) {
      const parsed = extractErrorMessage(err);
      setFeedback({
        type: "error",
        text: `Failed to update status for Enquiry #${enquiryId}: ${parsed}`,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Edit Modal Handlers
  const openEditModal = (enquiry) => {
    setEditingEnquiry(enquiry);
  };

  const closeEditModal = () => {
    setEditingEnquiry(null);
  };

  const handleSaveEdit = async (id, updatedFields) => {
    const original = allEnquiries.find((item) => item.id === id);
    if (!original) return;

    // Validate fields
    const validation = validateEnquiryData(updatedFields);
    if (!validation.isValid) {
      return validation.errors;
    }

    // Check status transition
    if (updatedFields.status) {
      const currentStatus = (original.status || STATUS_ENUM.NEW).toUpperCase();
      const targetStatus = updatedFields.status.toUpperCase();
      if (!canTransitionStatus(currentStatus, targetStatus)) {
        return {
          status: `Cannot revert status from ${currentStatus} to ${targetStatus}.`,
        };
      }
    }

    setIsSavingEdit(true);

    try {
      await enquiryService.updateEnquiry(id, updatedFields);

      // Update state
      setAllEnquiries((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updatedFields } : item,
        ),
      );

      setFeedback({
        type: "success",
        text: `Enquiry #${id} updated successfully.`,
      });
      closeEditModal();
      return null;
    } catch (err) {
      const status = err.response ? err.response.status : null;

      // If backend does not support PUT, update local state and notify admin
      if (status === 404 || status === 405) {
        setAllEnquiries((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, ...updatedFields } : item,
          ),
        );
        setFeedback({
          type: "warning",
          text: `Enquiry #${id} updated locally. Note: Backend endpoint PUT /api/admin/auth/enquiries/${id} is not implemented on the server.`,
        });
        closeEditModal();
        return null;
      }

      const parsed = extractErrorMessage(err);
      setFeedback({
        type: "error",
        text: `Failed to update enquiry #${id}: ${parsed}`,
      });
      return { form: parsed };
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Handlers
  const openDeleteDialog = (enquiry) => {
    setDeletingEnquiry(enquiry);
  };

  const closeDeleteDialog = () => {
    setDeletingEnquiry(null);
  };

  const confirmDelete = async () => {
    if (!deletingEnquiry) return;

    setIsDeleting(true);
    setFeedback(null);

    try {
      await enquiryService.deleteEnquiry(deletingEnquiry.id);

      // Remove from list
      setAllEnquiries((prev) =>
        prev.filter((item) => item.id !== deletingEnquiry.id),
      );

      setFeedback({
        type: "success",
        text: `Enquiry #${deletingEnquiry.id} deleted successfully.`,
      });
      closeDeleteDialog();
    } catch (err) {
      const status = err.response ? err.response.status : null;
      if (status === 404) {
        setFeedback({
          type: "error",
          text: `Delete failed (404): The DELETE /api/admin/auth/enquiries/${deletingEnquiry.id} endpoint is not implemented on the backend.`,
        });
      } else {
        const parsed = extractErrorMessage(err);
        setFeedback({
          type: "error",
          text: `Failed to delete enquiry #${deletingEnquiry.id}: ${parsed}`,
        });
      }
      closeDeleteDialog();
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setSortBy("latest");
  };

  return {
    enquiries: displayedEnquiries,
    allEnquiries,
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
  };
};

export default useDashboardController;
