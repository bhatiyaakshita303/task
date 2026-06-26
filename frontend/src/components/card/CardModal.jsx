import React, { useState } from 'react';
import { X, AlignLeft, Info, Calendar, Trash2, CheckSquare } from 'lucide-react';

const CardModal = ({ card, lists, onClose, onUpdateCard, onDeleteCard }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [priority, setPriority] = useState(card.priority);
  const [status, setStatus] = useState(card.status);
  const [listId, setListId] = useState(card.listId);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onUpdateCard(card._id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      listId,
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      onDeleteCard(card._id);
      onClose();
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card-detail-modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '90%' }}>
            <CheckSquare size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <input
              type="text"
              className="list-title-input"
              style={{ fontSize: '1.2rem', width: '100%', borderBottom: '1px solid var(--border-color)', borderRadius: 0, padding: '0.1rem 0.2rem' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card Title"
              required
            />
          </div>
          <button onClick={onClose} className="btn-icon">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-detail-meta">
            <div className="form-group">
              <label className="form-label" htmlFor="card-priority">Priority</label>
              <select
                id="card-priority"
                className="filter-select"
                style={{ width: '100%' }}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="card-status">Status</label>
              <select
                id="card-status"
                className="filter-select"
                style={{ width: '100%' }}
                value={status}
                onChange={(e) => setStatus(e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="card-list">Move to List</label>
              <select
                id="card-list"
                className="filter-select"
                style={{ width: '100%' }}
                value={listId}
                onChange={(e) => setListId(e.target.value)}>
                {lists.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-detail-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              <AlignLeft size={16} />
              <label className="form-label" htmlFor="card-desc" style={{ margin: 0 }}>Description</label>
            </div>
            <textarea
              id="card-desc"
              className="form-input"
              rows="4"
              style={{ resize: 'none', width: '100%' }}
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginBottom: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={12} />
              Created on: {formatDate(card.createdAt)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Info size={12} />
              Last updated: {formatDate(card.updatedAt)}
            </span>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-secondary"
              style={{ marginRight: 'auto', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            >
              <Trash2 size={16} />
              <span>Delete Card</span>
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardModal;
