/* ============================================================================
   BOOKMARKS COMPONENT
   Bookmarks management page with readability and accessibility improvements
   Large card layout, readable typography, and accessible interactions
   ============================================================================ */

import React, { useState } from 'react';
import './Bookmarks.css';

/**
 * Bookmarks Component
 *
 * A fully accessible bookmarks page with:
 * - Large, readable card titles (18px+ bold)
 * - 48-56px user avatars
 * - 28-32px action icons with labels
 * - 16px padding and margins for proper spacing
 * - WCAG AA contrast compliance
 * - Dark mode support with proper shadows
 * - Keyboard navigation and focus states
 * - Screen reader support
 *
 * @returns {React.ReactElement} Bookmarks component
 */
export const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([
    {
      id: 1,
      title: 'Amsterdam, Netherlands',
      category: 'Destination',
      type: 'destination',
      description: 'Beautiful canal city with vibrant LGBTQ+ culture and amazing museums.',
      savedDate: '2026-04-09',
      user: { initials: 'TM', name: 'Taylor Mitchell' },
    },
    {
      id: 2,
      title: 'Canal Palace Hotel',
      category: 'Hotel',
      type: 'hotel',
      description: 'Luxury 4-star hotel in the heart of Amsterdam\'s canal district.',
      savedDate: '2026-04-08',
      user: { initials: 'DL', name: 'Drew Lewis' },
    },
    {
      id: 3,
      title: 'Amsterdam Pride Walking Tour',
      category: 'Tour',
      type: 'tour',
      description: 'Guided tour through Amsterdam\'s historic LGBTQ+ neighborhoods.',
      savedDate: '2026-04-07',
      user: { initials: 'SL', name: 'Sam Lee' },
    },
    {
      id: 4,
      title: 'Café de Jaager',
      category: 'Restaurant',
      type: 'restaurant',
      description: 'Charming Dutch restaurant with excellent vegetarian options and LGBTQ+ friendly atmosphere.',
      savedDate: '2026-04-06',
      user: { initials: 'TM', name: 'Taylor Mitchell' },
    },
  ]);

  const [sortBy, setSortBy] = useState('recent');
  const [filterType, setFilterType] = useState('all');

  const handleDeleteBookmark = (id) => {
    setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
  };

  const handleShareBookmark = (bookmark) => {
    const shareText = `Check out ${bookmark.title}: ${bookmark.description}`;
    if (navigator.share) {
      navigator.share({
        title: bookmark.title,
        text: shareText,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    }
  };

  const filteredBookmarks = filterType === 'all'
    ? bookmarks
    : bookmarks.filter((b) => b.type === filterType);

  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.savedDate) - new Date(a.savedDate);
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="bookmarks-container">
      {/* Header */}
      <div className="bookmarks-header">
        <h1 className="bookmarks-title">My Bookmarks</h1>
        <p className="bookmarks-subtitle">
          {bookmarks.length} saved destination{bookmarks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Controls */}
      {bookmarks.length > 0 && (
        <div className="bookmarks-controls">
          {/* Sort Controls */}
          <div className="sort-control">
            <label htmlFor="sort-select" className="control-label">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
              aria-label="Sort bookmarks by"
            >
              <option value="recent">Recently Saved</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {/* Filter Controls */}
          <div className="filter-control">
            <label htmlFor="filter-select" className="control-label">
              Filter by:
            </label>
            <select
              id="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
              aria-label="Filter bookmarks by type"
            >
              <option value="all">All Types</option>
              <option value="destination">Destinations</option>
              <option value="hotel">Hotels</option>
              <option value="tour">Tours</option>
              <option value="restaurant">Restaurants</option>
            </select>
          </div>
        </div>
      )}

      {/* Bookmarks List */}
      <div
        className="bookmarks-list"
        role="region"
        aria-live="polite"
        aria-label="Bookmarks list"
      >
        {sortedBookmarks.length === 0 ? (
          <div className="bookmarks-empty">
            <p className="bookmarks-empty-text">
              {filterType === 'all'
                ? 'No bookmarks yet. Start saving your favorite destinations!'
                : `No ${filterType} bookmarks. Try a different filter.`}
            </p>
          </div>
        ) : (
          <div className="cards-grid">
            {sortedBookmarks.map((bookmark) => (
              <article
                key={bookmark.id}
                className="bookmark-card"
                aria-label={`Bookmark: ${bookmark.title}, ${bookmark.category}, saved ${bookmark.savedDate}`}
              >
                {/* User Avatar */}
                <div className="card-user-section">
                  <div
                    className="user-avatar"
                    aria-label={`Saved by ${bookmark.user.name}`}
                    title={bookmark.user.name}
                  >
                    {bookmark.user.initials}
                  </div>
                  <span className="user-name">{bookmark.user.name}</span>
                </div>

                {/* Card Content */}
                <div className="card-content">
                  <div className="card-header">
                    <h2 className="bookmark-title">{bookmark.title}</h2>
                    <span className={`bookmark-badge badge-${bookmark.type}`}>
                      {bookmark.category}
                    </span>
                  </div>

                  <p className="bookmark-description">{bookmark.description}</p>

                  <div className="bookmark-meta">
                    <span className="saved-date">
                      <span aria-hidden="true">📅</span>
                      Saved {bookmark.savedDate}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="card-actions">
                  <button
                    className="action-button action-share"
                    onClick={() => handleShareBookmark(bookmark)}
                    aria-label={`Share: ${bookmark.title}`}
                    title={`Share: ${bookmark.title}`}
                  >
                    <span aria-hidden="true">📤</span>
                    <span className="action-label">Share</span>
                  </button>
                  <button
                    className="action-button action-delete"
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                    aria-label={`Delete bookmark: ${bookmark.title}`}
                    title={`Delete: ${bookmark.title}`}
                  >
                    <span aria-hidden="true">🗑️</span>
                    <span className="action-label">Delete</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
