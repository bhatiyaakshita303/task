import React, { useRef } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { AlignLeft } from 'lucide-react';

const CardItem = ({ card, index, onClick }) => {
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'badge badge-high';
      case 'medium':
        return 'badge badge-medium';
      case 'low':
        return 'badge badge-low';
      default:
        return 'badge badge-medium';
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const start = touchStartRef.current;
      const diffX = Math.abs(touch.clientX - start.x);
      const diffY = Math.abs(touch.clientY - start.y);
      const duration = Date.now() - start.time;

      if (diffX < 8 && diffY < 8 && duration < 250) {
        e.preventDefault();
        onClick();
      }
    }
  };

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`card-item ${snapshot.isDragging ? 'is-dragging' : ''}`}
          onClick={onClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="button"
          tabIndex={0}
        >
          <div className="card-item-title">{card.title}</div>
          
          <div className="card-item-footer">
            <span className={getPriorityBadgeClass(card.priority)}>
              {card.priority}
            </span>
            
            {card.description && (
              <span title="This card has a description" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                <AlignLeft size={14} />
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default CardItem;
