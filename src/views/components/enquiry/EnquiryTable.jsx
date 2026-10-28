import React from 'react';
import { getAllowedNextStatuses, STATUS_META } from '../../../models/enquiryModel';

export default function EnquiryTable({
  enquiries = [],
  updatingId,
  onStatusChange,
  onEdit,
  onDelete,
  isClosedTable = false,
}) {
  if (enquiries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">{isClosedTable ? '📁' : '📭'}</div>
        <h3 className="empty-state-title">
          {isClosedTable ? 'No Closed Enquiries Found' : 'No Enquiries Found'}
        </h3>
        <p className="empty-state-desc">
          {isClosedTable
            ? 'There are currently no closed or archived enquiries matching your criteria.'
            : 'No active enquiries match your search or filter criteria.'}
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="enquiry-table">
        <thead>
          <tr>
            <th style={{ width: '60px' }}>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>City</th>
            <th>Message</th>
            <th style={{ width: '160px' }}>Status</th>
            <th>Created Date</th>
            <th style={{ width: '140px' }} className="text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map((item) => {
            const isUpdating = updatingId === item.id;
            const currentStatus = (item.status || 'NEW').toUpperCase();
            // Restrict dropdown strictly to allowed forward statuses
            const allowedStatuses = getAllowedNextStatuses(currentStatus);

            return (
              <tr key={item.id || item._id}>
                <td className="font-mono text-muted">#{item.id}</td>
                <td className="font-semibold">{item.name || '—'}</td>
                <td>
                  <a href={`mailto:${item.email}`} className="table-email">
                    {item.email || '—'}
                  </a>
                </td>
                <td className="font-mono">{item.phone || '—'}</td>
                <td>{item.city || '—'}</td>
                <td className="table-message-cell">
                  <div className="message-clamp" title={item.message}>
                    {item.message || '—'}
                  </div>
                </td>

                {/* Status Column with Forward-Only Progression */}
                <td>
                  <div className="status-cell-wrap">
                    <select
                      className={`status-select status-${currentStatus}`}
                      value={currentStatus}
                      onChange={(e) => onStatusChange(item.id, e.target.value)}
                      disabled={isUpdating || (isClosedTable && allowedStatuses.length <= 1)}
                      title={
                        isClosedTable
                          ? 'Enquiry is closed'
                          : 'Forward progression only: status cannot be reverted to earlier steps'
                      }
                    >
                      {allowedStatuses.map((st) => (
                        <option key={st} value={st}>
                          {STATUS_META[st]?.label || st}
                        </option>
                      ))}
                    </select>

                    {isUpdating && (
                      <span
                        className="spinner-inline status-spinner"
                        title="Updating status..."
                      ></span>
                    )}
                  </div>
                </td>

                {/* Created Date */}
                <td className="text-muted text-sm">
                  {item.createdAt || item.createdDate || item.date
                    ? new Date(
                        item.createdAt || item.createdDate || item.date
                      ).toLocaleDateString()
                    : '—'}
                </td>

                {/* Actions: Edit & Delete */}
                <td className="text-center">
                  <div className="table-action-btns">
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => onEdit(item)}
                      disabled={isUpdating}
                      title="Edit enquiry details"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-xs"
                      onClick={() => onDelete(item)}
                      disabled={isUpdating}
                      title="Delete enquiry"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
