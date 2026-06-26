import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import { Plus, Edit3, Trash2, Calendar, FolderOpen, Kanban, HelpCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Form states
  const [boardData, setBoardData] = useState({ title: '', description: '' });
  const [activeBoardId, setActiveBoardId] = useState(null);

  // Fetch user boards
  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await API.get('/boards');
      setBoards(res.data);
    } catch (err) {
      console.error('Error fetching boards:', err);
      setError('Could not retrieve boards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardData.title.trim()) return;

    try {
      const res = await API.post('/boards', boardData);
      setBoards([res.data, ...boards]);
      setIsCreateOpen(false);
      setBoardData({ title: '', description: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to create board. Try again.');
    }
  };

  const handleEditBoard = async (e) => {
    e.preventDefault();
    if (!boardData.title.trim() || !activeBoardId) return;

    try {
      const res = await API.put(`/boards/${activeBoardId}`, boardData);
      setBoards(boards.map(b => b._id === activeBoardId ? res.data : b));
      setIsEditOpen(false);
      setBoardData({ title: '', description: '' });
      setActiveBoardId(null);
    } catch (err) {
      console.error(err);
      setError('Failed to update board. Try again.');
    }
  };

  const handleDeleteBoard = async () => {
    if (!activeBoardId) return;

    try {
      await API.delete(`/boards/${activeBoardId}`);
      setBoards(boards.filter(b => b._id !== activeBoardId));
      setIsDeleteConfirmOpen(false);
      setActiveBoardId(null);
    } catch (err) {
      console.error(err);
      setError('Failed to delete board. Try again.');
    }
  };

  const openEditModal = (board, e) => {
    e.stopPropagation(); 
    setActiveBoardId(board._id);
    setBoardData({ title: board.title, description: board.description });
    setIsEditOpen(true);
  };

  const openDeleteConfirmModal = (boardId, e) => {
    e.stopPropagation(); 
    setActiveBoardId(boardId);
    setIsDeleteConfirmOpen(true);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="dashboard-container">
        <section className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>
              Welcome back, {user?.name}!
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Here are your active boards to manage your tasks.
            </p>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Create New Board</span>
          </button>
        </section>

        {error && (
          <div className="alert-toast error" style={{ position: 'static', marginBottom: '1.5rem', width: '100%' }}>
            <span>{error}</span>
          </div>
        )}

        <section className="dashboard-stats">
          <div className="stat-card">
            <div style={{ padding: '0.75rem', background: 'var(--accent-glow)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
              <Kanban size={24} />
            </div>
            <div>
              <p className="stat-value">{boards.length}</p>
              <p className="stat-label">Total Boards</p>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px', color: 'var(--priority-low)' }}>
              <FolderOpen size={24} />
            </div>
            <div>
              <p className="stat-value">{boards.filter(b => b.lists.length > 0).length}</p>
              <p className="stat-label">Active Workspaces</p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : boards.length === 0 ? (
          <div className="empty-state">
            <Kanban size={64} className="empty-icon" />
            <h2 className="empty-title">No boards found</h2>
            <p className="empty-desc">
              You haven't created any task boards yet. Create a board to start planning and tracking your work.
            </p>
            <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
              <Plus size={18} />
              <span>Create Your First Board</span>
            </button>
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map((board) => (
              <div
                key={board._id}
                className="board-card"
                onClick={() => navigate(`/board/${board._id}`)}
              >
                <div className="board-actions">
                  <button
                    onClick={(e) => openEditModal(board, e)}
                    className="btn-icon"
                    title="Edit Board"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={(e) => openDeleteConfirmModal(board._id, e)}
                    className="btn-icon"
                    title="Delete Board"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div>
                  <h3 className="board-card-title">{board.title}</h3>
                  <p className="board-card-desc">
                    {board.description || 'No description provided.'}
                  </p>
                </div>

                <div className="board-card-footer">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} />
                    Created: {formatDate(board.createdAt)}
                  </span>
                  <span>
                    Updated: {formatDate(board.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Board</h2>
              <button onClick={() => setIsCreateOpen(false)} className="btn-icon">×</button>
            </div>
            <form onSubmit={handleCreateBoard}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-title">Board Title</label>
                <input
                  type="text"
                  id="new-title"
                  className="form-input"
                  required
                  placeholder="e.g. Project Launch Roadmap"
                  value={boardData.title}
                  onChange={(e) => setBoardData({ ...boardData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-desc">Description</label>
                <textarea
                  id="new-desc"
                  className="form-input"
                  rows="3"
                  style={{ resize: 'none' }}
                  placeholder="Summarize the board goals..."
                  value={boardData.description}
                  onChange={(e) => setBoardData({ ...boardData, description: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Board</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Board Details</h2>
              <button onClick={() => setIsEditOpen(false)} className="btn-icon">×</button>
            </div>
            <form onSubmit={handleEditBoard}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-title">Board Title</label>
                <input
                  type="text"
                  id="edit-title"
                  className="form-input"
                  required
                  placeholder="Enter title"
                  value={boardData.title}
                  onChange={(e) => setBoardData({ ...boardData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-desc">Description</label>
                <textarea
                  id="edit-desc"
                  className="form-input"
                  rows="3"
                  style={{ resize: 'none' }}
                  placeholder="Enter description"
                  value={boardData.description}
                  onChange={(e) => setBoardData({ ...boardData, description: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteConfirmOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                <HelpCircle size={22} />
                Delete Board?
              </h2>
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="btn-icon">×</button>
            </div>
            <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Are you sure you want to delete this board? This action is <strong style={{ color: 'var(--text-main)' }}>permanent</strong> and will delete all lists and cards inside this board.
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDeleteBoard} className="btn btn-danger">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
