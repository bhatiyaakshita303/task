import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import API from '../services/api';
import Navbar from '../components/common/Navbar';
import ListColumn from '../components/list/ListColumn';
import CardModal from '../components/card/CardModal';
import { ArrowLeft, Search, Plus, X, ListFilter } from 'lucide-react';

const BoardDetail = () => {
  const { boardId } = useParams();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [activeCard, setActiveCard] = useState(null);

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const fetchBoardDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/boards/${boardId}`);
      setBoard(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load board details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardDetails();
  }, [boardId]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const previousBoard = { ...board };

    if (type === 'list') {
      const newListsOrder = Array.from(board.lists);
      const [removedList] = newListsOrder.splice(source.index, 1);
      newListsOrder.splice(destination.index, 0, removedList);

      const updatedBoard = { ...board, lists: newListsOrder };
      setBoard(updatedBoard);

      try {
        const listIds = newListsOrder.map(l => l._id);
        await API.patch('/lists/reorder', { boardId, listOrder: listIds });
      } catch (err) {
        console.error('Failed to save list order:', err);
        setError('Error saving list position. Reverting...');
        setBoard(previousBoard);
      }
      return;
    }

    if (type === 'card') {
      const sourceListIdx = board.lists.findIndex(l => l._id === source.droppableId);
      const destListIdx = board.lists.findIndex(l => l._id === destination.droppableId);

      const sourceList = board.lists[sourceListIdx];
      const destList = board.lists[destListIdx];

      if (source.droppableId === destination.droppableId) {
        const newCards = Array.from(sourceList.cards);
        const [movedCard] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, movedCard);

        const updatedLists = Array.from(board.lists);
        updatedLists[sourceListIdx] = { ...sourceList, cards: newCards };
        setBoard({ ...board, lists: updatedLists });

        try {
          const cardIds = newCards.map(c => c._id);
          await API.patch('/cards/move', {
            cardId: draggableId,
            sourceListId: source.droppableId,
            destListId: destination.droppableId,
            sourceCardOrder: cardIds,
            destCardOrder: cardIds
          });
        } catch (err) {
          console.error(err);
          setError('Failed to save card position. Reverting...');
          setBoard(previousBoard);
        }
      } else {
        const newSourceCards = Array.from(sourceList.cards);
        const newDestCards = Array.from(destList.cards);

        const [movedCard] = newSourceCards.splice(source.index, 1);
        const updatedMovedCard = { ...movedCard, listId: destination.droppableId };
        newDestCards.splice(destination.index, 0, updatedMovedCard);

        const updatedLists = Array.from(board.lists);
        updatedLists[sourceListIdx] = { ...sourceList, cards: newSourceCards };
        updatedLists[destListIdx] = { ...destList, cards: newDestCards };
        setBoard({ ...board, lists: updatedLists });

        try {
          const sourceCardIds = newSourceCards.map(c => c._id);
          const destCardIds = newDestCards.map(c => c._id);

          await API.patch('/cards/move', {
            cardId: draggableId,
            sourceListId: source.droppableId,
            destListId: destination.droppableId,
            sourceCardOrder: sourceCardIds,
            destCardOrder: destCardIds
          });
        } catch (err) {
          console.error(err);
          setError('Failed to move card. Reverting...');
          setBoard(previousBoard);
        }
      }
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      const res = await API.post(`/boards/${boardId}/lists`, { title: newListTitle.trim() });
      const newList = { ...res.data, cards: [] };
      setBoard({ ...board, lists: [...board.lists, newList] });
      setNewListTitle('');
      setIsAddingList(false);
    } catch (err) {
      console.error(err);
      setError('Could not create list.');
    }
  };

  const handleUpdateListTitle = async (listId, newTitle) => {
    try {
      const res = await API.put(`/lists/${listId}`, { title: newTitle });
      setBoard({
        ...board,
        lists: board.lists.map(l => l._id === listId ? { ...l, title: res.data.title } : l)
      });
    } catch (err) {
      console.error(err);
      setError('Failed to update list title.');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Delete this list and all its cards?')) return;

    try {
      await API.delete(`/lists/${listId}`);
      setBoard({
        ...board,
        lists: board.lists.filter(l => l._id !== listId)
      });
    } catch (err) {
      console.error(err);
      setError('Failed to delete list.');
    }
  };

  const handleAddCard = async (listId, cardTitle) => {
    try {
      const res = await API.post(`/lists/${listId}/cards`, { title: cardTitle });
      setBoard({
        ...board,
        lists: board.lists.map(l => {
          if (l._id === listId) {
            return { ...l, cards: [...l.cards, res.data] };
          }
          return l;
        })
      });
    } catch (err) {
      console.error(err);
      setError('Could not add card.');
    }
  };

  const handleUpdateCard = async (cardId, updatedFields) => {
    try {
      const res = await API.put(`/cards/${cardId}`, updatedFields);

      if (updatedFields.listId && updatedFields.listId !== activeCard.listId) {
        fetchBoardDetails();
      } else {
        setBoard({
          ...board,
          lists: board.lists.map(l => {
            if (l._id === res.data.listId) {
              return {
                ...l,
                cards: l.cards.map(c => c._id === cardId ? res.data : c)
              };
            }
            return l;
          })
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update card details.');
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await API.delete(`/cards/${cardId}`);
      setBoard({
        ...board,
        lists: board.lists.map(l => {
          return {
            ...l,
            cards: l.cards.filter(c => c._id !== cardId)
          };
        })
      });
    } catch (err) {
      console.error(err);
      setError('Failed to delete card.');
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="spinner-container" style={{ minHeight: '80vh' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error && !board) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="not-found-container">
          <div className="not-found-code">404</div>
          <h2 className="not-found-title">Board Not Found</h2>
          <p className="not-found-desc">{error}</p>
          <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container board-detail-layout">
      <Navbar />

      <section className="board-detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/dashboard" className="btn-icon" title="Back to Dashboard" style={{ display: 'flex', color: 'var(--text-muted)' }}>
            <ArrowLeft size={20} />
          </Link>
          <div className="board-title-section">
            <h1 className="board-detail-title">{board.title}</h1>
            <p className="board-detail-desc">{board.description || 'No description'}</p>
          </div>
        </div>

        <div className="board-toolbar">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="form-input search-input"
              style={{ width: '220px', padding: '0.5rem 1rem 0.5rem 2.25rem' }}
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListFilter size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="filter-select"
              style={{ padding: '0.5rem 2rem 0.5rem 0.75rem', fontSize: '0.85rem' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              className="filter-select"
              style={{ padding: '0.5rem 2rem 0.5rem 0.75rem', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
      </section>

      {error && (
        <div className="alert-toast error" style={{ bottom: '2rem', right: '2rem' }}>
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board-workspace" type="list" direction="horizontal">
          {(provided) => (
            <main
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="board-workspace"
            >
              {board.lists.map((list, index) => (
                <ListColumn
                  key={list._id}
                  list={list}
                  index={index}
                  cards={list.cards}
                  onAddCard={handleAddCard}
                  onUpdateListTitle={handleUpdateListTitle}
                  onDeleteList={handleDeleteList}
                  onCardClick={setActiveCard}
                  searchQuery={searchQuery}
                  priorityFilter={priorityFilter}
                  statusFilter={statusFilter}
                />
              ))}
              {provided.placeholder}

              <div className="add-list-column">
                {isAddingList ? (
                  <form onSubmit={handleAddList} className="add-list-input-group">
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                      placeholder="Enter list title..."
                      autoFocus
                      required
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        Add List
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingList(false)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem', borderRadius: '4px' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 1rem', border: '1px dashed var(--border-color)', background: 'transparent' }}
                  >
                    <Plus size={16} />
                    <span>Add another list</span>
                  </button>
                )}
              </div>
            </main>
          )}
        </Droppable>
      </DragDropContext>

      {activeCard && (
        <CardModal
          card={activeCard}
          lists={board.lists}
          onClose={() => setActiveCard(null)}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />
      )}
    </div>
  );
};

export default BoardDetail;
