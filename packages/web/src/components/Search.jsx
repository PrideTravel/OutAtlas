/* ============================================================================
   SEARCH COMPONENT
   Enhanced search page with improved typography and accessibility
   Provides comprehensive search functionality with high readability
   ============================================================================ */

import React, { useState } from 'react';
import './Search.css';

/**
 * Search Component
 *
 * A fully accessible search page with:
 * - 48px touch-friendly search input
 * - Large, readable result titles (18px+)
 * - Clear category badges with high contrast
 * - Proper spacing and line-height for readability
 * - WCAG AA contrast compliance
 * - Dark mode support
 * - Keyboard navigation
 *
 * @returns {React.ReactElement} Search component
 */
export const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const categories = [
    { id: 'all', label: 'All', icon: '🌍' },
    { id: 'hotels', label: 'Hotels', icon: '🏨' },
    { id: 'tours', label: 'Tours', icon: '🗺️' },
    { id: 'events', label: 'Events', icon: '🎉' },
    { id: 'restaurants', label: 'Restaurants', icon: '🍽️' },
    { id: 'nightlife', label: 'Nightlife', icon: '🍸' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    // Placeholder search results for demo
    if (searchQuery.trim()) {
      setResults([
        {
          id: 1,
          title: 'Amsterdam, Netherlands',
          category: 'Destination',
          description: 'Amsterdam is a beautiful canal city with vibrant LGBTQ+ culture, world-class museums, and amazing nightlife.',
          location: 'Netherlands',
          savedDate: '2026-04-09',
          type: 'destination',
        },
        {
          id: 2,
          title: 'Canal Palace Hotel',
          category: 'Hotel',
          description: 'A luxury 4-star hotel in the heart of Amsterdam\'s canal district. LGBTQ+ friendly with excellent reviews.',
          location: 'Amsterdam, Netherlands',
          savedDate: '2026-04-08',
          type: 'hotel',
        },
        {
          id: 3,
          title: 'Amsterdam Pride Walking Tour',
          category: 'Tour',
          description: 'Guided tour through Amsterdam\'s historic LGBTQ+ neighborhoods and cultural landmarks.',
          location: 'Amsterdam, Netherlands',
          savedDate: '2026-04-07',
          type: 'tour',
        },
      ]);
    } else {
      setResults([]);
    }
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="search-container">
      {/* Search Header */}
      <div className="search-header">
        <h1 className="search-title">Search Destinations & Experiences</h1>
        <p className="search-subtitle">
          Find LGBTQ+ friendly hotels, tours, and events around the world
        </p>
      </div>

      {/* Search Form */}
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <label htmlFor="search-input" className="search-label">
            Search destinations, hotels, tours
          </label>
          <input
            id="search-input"
            type="search"
            className="search-input"
            placeholder="e.g., Amsterdam, Paris, Tokyo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search destinations, hotels, tours"
            aria-describedby="search-help"
          />
          <p id="search-help" className="sr-only">
            Type a destination name or keyword to search
          </p>
        </div>
        <button type="submit" className="search-button">
          <span aria-hidden="true">🔍</span>
          Search
        </button>
      </form>

      {/* Category Filters */}
      <div className="search-filters" role="group" aria-label="Filter by category">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`filter-button ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryFilter(category.id)}
            aria-pressed={selectedCategory === category.id}
            aria-label={`Filter by ${category.label}`}
          >
            <span aria-hidden="true">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Search Results */}
      <div className="search-results" role="region" aria-live="polite" aria-label="Search results">
        {!hasSearched && (
          <div className="search-empty">
            <p className="search-empty-text">
              Enter a search term to find destinations, hotels, tours, and more.
            </p>
          </div>
        )}

        {hasSearched && results.length === 0 && (
          <div className="search-empty">
            <p className="search-empty-text">
              No results found for "{searchQuery}". Try a different search term.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="results-list">
            <h2 className="results-count">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </h2>
            {results.map((result) => (
              <article key={result.id} className="result-card">
                <div className="result-header">
                  <h3 className="result-title">{result.title}</h3>
                  <span className={`result-badge badge-${result.type}`}>
                    {result.category}
                  </span>
                </div>

                <p className="result-description">{result.description}</p>

                <div className="result-meta">
                  <span className="result-location">
                    <span aria-hidden="true">📍</span>
                    {result.location}
                  </span>
                  <span className="result-date">
                    <span aria-hidden="true">📅</span>
                    Saved {result.savedDate}
                  </span>
                </div>

                <div className="result-actions">
                  <button
                    className="result-action-button"
                    aria-label={`Save bookmark: ${result.title}`}
                  >
                    <span aria-hidden="true">❤️</span>
                    Save
                  </button>
                  <button
                    className="result-action-button"
                    aria-label={`Share: ${result.title}`}
                  >
                    <span aria-hidden="true">📤</span>
                    Share
                  </button>
                  <button
                    className="result-action-button"
                    aria-label={`View details: ${result.title}`}
                  >
                    <span aria-hidden="true">→</span>
                    Details
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

export default Search;
