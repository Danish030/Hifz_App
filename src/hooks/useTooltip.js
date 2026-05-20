import { useState, useCallback, useRef } from 'react';

/**
 * Manages word tooltip state and positioning.
 * Uses getBoundingClientRect for accurate placement.
 */
export function useTooltip() {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, word: null });
  const hideTimer = useRef(null);

  const show = useCallback((word, event) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const TW = 220, TH = 90;
    let x = event.clientX + 14;
    let y = event.clientY - 20;
    if (x + TW > window.innerWidth)  x = event.clientX - TW - 14;
    if (y + TH > window.innerHeight) y = event.clientY - TH - 10;
    setTooltip({ visible: true, x, y, word });
  }, []);

  const hide = useCallback(() => {
    hideTimer.current = setTimeout(() => {
      setTooltip(t => ({ ...t, visible: false }));
    }, 80);
  }, []);

  const move = useCallback((event) => {
    if (!tooltip.visible) return;
    const TW = 220, TH = 90;
    let x = event.clientX + 14;
    let y = event.clientY - 20;
    if (x + TW > window.innerWidth)  x = event.clientX - TW - 14;
    if (y + TH > window.innerHeight) y = event.clientY - TH - 10;
    setTooltip(t => ({ ...t, x, y }));
  }, [tooltip.visible]);

  return { tooltip, show, hide, move };
}
