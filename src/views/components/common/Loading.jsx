import React from 'react';

export default function Loading({ message = 'Loading...', size = 'medium' }) {
  return (
    <div className={`loading-container loading-${size}`}>
      <div className="spinner" role="status" aria-label="Loading"></div>
      {message && <p className="loading-text">{message}</p>}
    </div>
  );
}
