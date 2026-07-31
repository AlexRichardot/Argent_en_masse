import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

const BTN_W = 44;

export default function SwipeRow({ children, onEdit, onDelete }) {
  const rootRef = useRef(null);
  const startX = useRef(null);
  const startDx = useRef(0);
  const moved = useRef(false);
  const [dx, setDx] = useState(0);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const maxReveal = (onEdit ? BTN_W : 0) + (onDelete ? BTN_W : 0);

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setDx(0);
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [open]);

  function handlePointerDown(e) {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    startX.current = e.clientX;
    startDx.current = dx;
    moved.current = false;
    setDragging(true);
  }
  function handlePointerMove(e) {
    if (startX.current == null || !maxReveal) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 4) moved.current = true;
    setDx(Math.max(-maxReveal, Math.min(0, startDx.current + delta)));
  }
  function handlePointerUp() {
    if (startX.current == null) return;
    startX.current = null;
    setDragging(false);
    const shouldOpen = dx < -maxReveal / 2;
    setDx(shouldOpen ? -maxReveal : 0);
    setOpen(shouldOpen);
  }
  function handleClick() {
    if (moved.current) { moved.current = false; return; }
    if (open) { setDx(0); setOpen(false); }
  }
  function runAction(fn) {
    setDx(0);
    setOpen(false);
    fn?.();
  }

  return (
    <div className="swiperow" ref={rootRef}>
      {maxReveal > 0 && (
        <div className="swiperow-actions">
          {onEdit && <button className="swiperow-btn edit" title="Modifier" onClick={() => runAction(onEdit)}><Icon name="edit" size={16} /></button>}
          {onDelete && <button className="swiperow-btn del" title="Supprimer" onClick={() => runAction(onDelete)}><Icon name="trash" size={16} /></button>}
        </div>
      )}
      <div
        className="swiperow-face"
        style={{ transform: `translateX(${dx}px)`, transition: dragging ? 'none' : 'transform .2s ease' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
      >
        {children}
      </div>
    </div>
  );
}
