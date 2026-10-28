/**
 * Enquiry Model & Domain Logic
 * Handles status lifecycle, validation rules, search, and sorting logic.
 */

export const STATUS_ENUM = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
};

// Strict chronological order for enquiry status progression
export const STATUS_ORDER = [
  STATUS_ENUM.NEW,
  STATUS_ENUM.IN_PROGRESS,
  STATUS_ENUM.RESOLVED,
  STATUS_ENUM.CLOSED,
];

// Display and styling configuration for each status
export const STATUS_META = {
  [STATUS_ENUM.NEW]: {
    label: 'New',
    badgeClass: 'status-NEW',
    description: 'Fresh enquiry awaiting initial triage',
  },
  [STATUS_ENUM.IN_PROGRESS]: {
    label: 'In Progress',
    badgeClass: 'status-IN_PROGRESS',
    description: 'Under active review or resolution',
  },
  [STATUS_ENUM.RESOLVED]: {
    label: 'Resolved',
    badgeClass: 'status-RESOLVED',
    description: 'Enquiry has been addressed',
  },
  [STATUS_ENUM.CLOSED]: {
    label: 'Closed',
    badgeClass: 'status-CLOSED',
    description: 'Archived and completed enquiry',
  },
};

/**
 * Enforces one-way forward progression:
 * Users can move forward in status but CANNOT revert back to a previous status.
 *
 * Examples:
 * - NEW -> can move to [NEW, IN_PROGRESS, RESOLVED, CLOSED]
 * - IN_PROGRESS -> can move to [IN_PROGRESS, RESOLVED, CLOSED] (cannot go back to NEW)
 * - RESOLVED -> can move to [RESOLVED, CLOSED] (cannot go back to IN_PROGRESS or NEW)
 * - CLOSED -> final terminal status [CLOSED]
 */
export const getAllowedNextStatuses = (currentStatus) => {
  if (!currentStatus) return STATUS_ORDER;
  const normalized = currentStatus.toUpperCase();
  const currentIndex = STATUS_ORDER.indexOf(normalized);

  if (currentIndex === -1) {
    return STATUS_ORDER;
  }

  // Slice from currentIndex forward so previous statuses are excluded
  return STATUS_ORDER.slice(currentIndex);
};

/**
 * Validates if a transition from currentStatus to targetStatus is allowed.
 */
export const canTransitionStatus = (currentStatus, targetStatus) => {
  if (!currentStatus || !targetStatus) return false;
  const currentIdx = STATUS_ORDER.indexOf(currentStatus.toUpperCase());
  const targetIdx = STATUS_ORDER.indexOf(targetStatus.toUpperCase());

  if (currentIdx === -1 || targetIdx === -1) return false;
  return targetIdx >= currentIdx;
};

/**
 * Validates enquiry input fields.
 * Used for both public submission and admin edit.
 */
export const validateEnquiryData = (data) => {
  const errors = {};

  // Full Name
  if (!data.name || !data.name.trim()) {
    errors.name = 'Full name is required.';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters.';
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  // Phone: 10 digits starting with 6, 7, 8, or 9
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!data.phone || !String(data.phone).trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!phoneRegex.test(String(data.phone).trim())) {
    errors.phone = 'Phone number must be exactly 10 digits and start with 6, 7, 8, or 9.';
  }

  // City
  if (!data.city || !data.city.trim()) {
    errors.city = 'City is required.';
  }

  // Message
  if (!data.message || !data.message.trim()) {
    errors.message = 'Enquiry message is required.';
  } else if (data.message.trim().length < 5) {
    errors.message = 'Enquiry message should be at least 5 characters long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Filter and sort an array of enquiries.
 */
export const filterAndSortEnquiries = (
  enquiries = [],
  { searchTerm = '', statusFilter = 'ALL', sortBy = 'latest' } = {}
) => {
  let result = [...enquiries];

  // 1. Status Filter
  if (statusFilter && statusFilter !== 'ALL') {
    result = result.filter(
      (item) => (item.status || '').toUpperCase() === statusFilter.toUpperCase()
    );
  }

  // 2. Search Term across name, email, phone, city, message
  if (searchTerm && searchTerm.trim()) {
    const query = searchTerm.trim().toLowerCase();
    result = result.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const phone = String(item.phone || '').toLowerCase();
      const city = (item.city || '').toLowerCase();
      const message = (item.message || '').toLowerCase();
      const id = String(item.id || '');

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        city.includes(query) ||
        message.includes(query) ||
        id.includes(query)
      );
    });
  }

  // 3. Sorting
  result.sort((a, b) => {
    // Helper to get comparable date/id
    const getDate = (item) => {
      const d = item.createdAt || item.createdDate || item.date;
      return d ? new Date(d).getTime() : 0;
    };
    const getId = (item) => Number(item.id) || 0;

    switch (sortBy) {
      case 'latest': {
        // Prefer date comparison if available; fallback to id descending
        const dateDiff = getDate(b) - getDate(a);
        if (dateDiff !== 0) return dateDiff;
        return getId(b) - getId(a);
      }
      case 'oldest': {
        const dateDiff = getDate(a) - getDate(b);
        if (dateDiff !== 0) return dateDiff;
        return getId(a) - getId(b);
      }
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'city-asc':
        return (a.city || '').localeCompare(b.city || '');
      default:
        return 0;
    }
  });

  return result;
};
