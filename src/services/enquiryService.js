import { apiClient } from './apiService';

/**
 * Enquiry Service: Encapsulates all backend endpoint operations
 */
export const enquiryService = {
  /**
   * Submit Public Enquiry
   * POST /api/enquiry
   * Payload: { name, email, phone, city, message }
   */
  async submitPublicEnquiry(enquiryData) {
    const response = await apiClient.post('/api/enquiry', enquiryData);
    return response.data;
  },

  /**
   * Fetch Enquiries with pagination support
   * GET /api/admin/auth/enquiries?page=0&size=10
   */
  async fetchEnquiries(page = 0, size = 50) {
    const response = await apiClient.get('/api/admin/enquiries', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Update Status of an Enquiry
   * PATCH /api/admin/auth/enquiries/{id}/status
   * Payload: { status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' }
   */
  async updateStatus(id, status) {
    const response = await apiClient.patch(`/api/admin/enquiries/${id}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * Update Entire Enquiry (Admin Edit)
   * Tries PUT /api/admin/auth/enquiries/{id}
   * If status is also changed, syncs with status endpoint.
   */
  async updateEnquiry(id, updatedData) {
    let putSuccess = false;
    let putResponse = null;

    try {
      putResponse = await apiClient.put(`/api/admin/enquiries/${id}`, updatedData);
      putSuccess = true;
    } catch (err) {
      // If PUT is 404 or 405 (method not allowed), try PATCH
      if (err.response && (err.response.status === 404 || err.response.status === 405)) {
        try {
          putResponse = await apiClient.patch(`/api/admin/enquiries/${id}`, updatedData);
          putSuccess = true;
        } catch (patchErr) {
          // If status was changed, at least update status via the dedicated status endpoint
          if (updatedData.status) {
            await this.updateStatus(id, updatedData.status);
          }
          // Rethrow the original error so controller knows full PUT was rejected
          throw patchErr;
        }
      } else {
        throw err;
      }
    }

    // If status was provided and different, also call status endpoint to guarantee backend synchronization
    if (putSuccess && updatedData.status) {
      try {
        await this.updateStatus(id, updatedData.status);
      } catch {
        // Status may have already been updated by PUT; silently continue
      }
    }

    return putResponse ? putResponse.data : updatedData;
  },

  /**
   * Delete an Enquiry
   * DELETE /api/admin/auth/enquiries/{id}
   */
  async deleteEnquiry(id) {
    const response = await apiClient.delete(`/api/admin/enquiries/${id}`);
    return response.data;
  },
};

export default enquiryService;
