/* ============================================================================
   MESSAGES COMPONENT
   Saved notes/messages with accessibility features
   Provides a space to store and manage travel notes with full accessibility support
   ============================================================================ */

import React, { useState } from 'react';
import './Messages.css';

/**
 * Messages Component
 *
 * A fully accessible messages/notes page with:
 * - Large, readable message content (16px+ line-height 1.6)
 * - Clear message timestamps and metadata
 * - Accessible note creation and editing
 * - Dark mode support
 * - Keyboard navigation
 * - Screen reader support
 * - WCAG AA contrast compliance
 *
 * @returns {React.ReactElement} Messages component
 */
export const Messages = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      title: 'Amsterdam Trip Notes',
      content: 'Remember to visit the Anne Frank House early in the morning to avoid crowds. Book tickets in advance online. The museum has limited capacity and gets very busy in afternoons.',
      date: '2026-04-09',
      time: '10:30 AM',
      color: 'blue',
    },
    {
      id: 2,
      title: 'Hotel Contact Info',
      content: 'Canal Palace Hotel\nAddress: Prinsengracht 920, Amsterdam\nPhone: +31 20 623 8146\nEmail: info@canalpaloce.nl\nCheck-in: 3 PM | Check-out: 11 AM\nBreakfast included: Yes',
      date: '2026-04-08',
      time: '2:15 PM',
      color: 'green',
    },
    {
      id: 3,
      title: 'Must-Try Restaurants',
      content: 'Café de Jaager - Traditional Dutch cuisine\nPrix Fixe - Modern French bistro\nTop Thai - Authentic Thai restaurant\nAll three are within walking distance and LGBTQ+ friendly.',
      date: '2026-04-07',
      time: '4:45 PM',
      color: 'orange',
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState('blue');
  const [isAddingMessage, setIsAddingMessage] = useState(false);

  const colors = [
    { id: 'blue', label: 'Blue', hex: '#2196f3' },
    { id: 'green', label: 'Green', hex: '#4caf50' },
    { id: 'orange', label: 'Orange', hex: '#ff9800' },
    { id: 'purple', label: 'Purple', hex: '#9c27b0' },
    { id: 'pink', label: 'Pink', hex: '#e91e63' },
  ];

  const handleAddMessage = (e) => {
    e.preventDefault();
    if (newTitle.trim() && newMessage.trim()) {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const message = {
        id: Date.now(),
        title: newTitle,
        content: newMessage,
        date,
        time,
        color: newColor,
      };

      setMessages([message, ...messages]);
      setNewTitle('');
      setNewMessage('');
      setNewColor('blue');
      setIsAddingMessage(false);
    }
  };

  const handleDeleteMessage = (id) => {
    setMessages(messages.filter((msg) => msg.id !== id));
  };

  return (
    <div className="messages-container">
      {/* Header */}
      <div className="messages-header">
        <h1 className="messages-title">Travel Notes</h1>
        <p className="messages-subtitle">
          Save important information and notes from your trips
        </p>
      </div>

      {/* Add Message Section */}
      {!isAddingMessage ? (
        <button
          className="add-message-button"
          onClick={() => setIsAddingMessage(true)}
          aria-label="Create new note"
        >
          <span aria-hidden="true">+</span>
          New Note
        </button>
      ) : (
        <form className="message-form" onSubmit={handleAddMessage}>
          <div className="form-group">
            <label htmlFor="message-title" className="form-label">
              Note Title
            </label>
            <input
              id="message-title"
              type="text"
              className="form-input"
              placeholder="e.g., Hotel Contact Info"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              aria-label="Note title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message-content" className="form-label">
              Note Content
            </label>
            <textarea
              id="message-content"
              className="form-textarea"
              placeholder="Write your note here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              aria-label="Note content"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Note Color</label>
            <div className="color-picker">
              {colors.map((color) => (
                <label key={color.id} className="color-option">
                  <input
                    type="radio"
                    name="color"
                    value={color.id}
                    checked={newColor === color.id}
                    onChange={(e) => setNewColor(e.target.value)}
                    aria-label={`Color: ${color.label}`}
                  />
                  <span
                    className="color-swatch"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button button-primary"
              aria-label="Save note"
            >
              Save Note
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setIsAddingMessage(false)}
              aria-label="Cancel creating note"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Messages List */}
      <div
        className="messages-list"
        role="region"
        aria-live="polite"
        aria-label="Travel notes"
      >
        {messages.length === 0 ? (
          <div className="messages-empty">
            <p className="messages-empty-text">
              No notes yet. Create your first travel note to save important information.
            </p>
          </div>
        ) : (
          <div className="messages-grid">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`message-card message-${message.color}`}
                aria-label={`Note: ${message.title}, saved on ${message.date} at ${message.time}`}
              >
                <div className="message-header">
                  <h2 className="message-title-text">{message.title}</h2>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteMessage(message.id)}
                    aria-label={`Delete note: ${message.title}`}
                    title={`Delete: ${message.title}`}
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>

                <p className="message-content">{message.content}</p>

                <div className="message-footer">
                  <time className="message-date" dateTime={message.date}>
                    {message.date} at {message.time}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
