import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import CardItem from '../card/CardItem';
import { Plus, X, Trash2 } from 'lucide-react';

const ListColumn = ({
  list,
  index,
  cards,
  onAddCard,
  onUpdateListTitle,
  onDeleteList,
  onCardClick,
  searchQuery,
  priorityFilter,
  statusFilter
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (listTitle.trim() && listTitle !== list.title) {
      onUpdateListTitle(list._id, listTitle.trim());
    } else {
      setListTitle(list.title);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    }
  };

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    onAddCard(list._id, newCardTitle.trim());
    setNewCardTitle('');
    setIsAddingCard(false);
  };

  const filteredCards = cards.filter((card) => {
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === 'all' || card.priority.toLowerCase() === priorityFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'all' || card.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <Draggable draggableId={list._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`list-column-wrapper ${snapshot.isDragging ? 'is-dragging' : ''}`}
        >
          <div className="list-header" {...provided.dragHandleProps}>
            {isEditingTitle ? (
              <input
                type="text"
                className="list-title-input"
                autoFocus
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <h4
                className="list-title"
                style={{ cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}
                onClick={() => setIsEditingTitle(true)}
              >
                {list.title}
              </h4>
            )}
            <button
              onClick={() => onDeleteList(list._id)}
              className="btn-icon"
              title="Delete List"
              style={{ color: '#ef4444', padding: '0.25rem' }}
            >
              <Trash2 size={14} />
            </button>
          </div>

          <Droppable droppableId={list._id} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="cards-container"
                style={{
                  background: snapshot.isDraggingOver ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {filteredCards.map((card, cardIndex) => (
                  <CardItem
                    key={card._id}
                    card={card}
                    index={cardIndex}
                    onClick={() => onCardClick(card)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="add-card-btn-container">
            {isAddingCard ? (
              <form onSubmit={handleAddCardSubmit}>
                <textarea
                  className="form-input"
                  rows="2"
                  required
                  placeholder="Enter a title for this card..."
                  style={{ resize: 'none', marginBottom: '0.5rem', width: '100%', fontSize: '0.85rem' }}
                  autoFocus
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCardSubmit(e);
                    }
                  }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    Add Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCard(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem', borderRadius: '4px' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingCard(true)}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              >
                <Plus size={14} />
                <span>Add a card</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default ListColumn;
