import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EnhancedTerminal } from './EnhancedTerminal';
import { keyboardManager } from '../lib/keyboard';
import { useSettingsStore } from '../stores/settings';

export interface Pane {
  id: string;
  sessionId: string;
  type: 'terminal';
  position: { x: number; y: number; width: number; height: number };
}

export interface SplitLayout {
  direction: 'horizontal' | 'vertical';
  panes: Pane[];
  dividers: Array<{ position: number; direction: 'horizontal' | 'vertical' }>;
}

interface SplitPaneManagerProps {
  sessionId: string;
  registerDataHandler: (sessionId: string, handler: (data: Uint8Array) => void) => () => void;
  onCreateSession?: () => Promise<string>;
}

export function SplitPaneManager({ 
  sessionId, 
  registerDataHandler,
  onCreateSession 
}: SplitPaneManagerProps) {
  const [layout, setLayout] = useState<SplitLayout>({
    direction: 'horizontal',
    panes: [{
      id: 'main',
      sessionId,
      type: 'terminal',
      position: { x: 0, y: 0, width: 100, height: 100 }
    }],
    dividers: []
  });
  const [dragging, setDragging] = useState<{ 
    dividerIndex: number; 
    startPos: number; 
    startSizes: number[] 
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { ui } = useSettingsStore();

  const calculatePanePositions = useCallback((
    direction: 'horizontal' | 'vertical',
    dividers: Array<{ position: number; direction: 'horizontal' | 'vertical' }>
  ): Array<{ x: number; y: number; width: number; height: number }> => {
    if (dividers.length === 0) {
      return [{ x: 0, y: 0, width: 100, height: 100 }];
    }

    const positions: Array<{ x: number; y: number; width: number; height: number }> = [];
    let lastPosition = 0;

    dividers.forEach((divider, index) => {
      if (direction === 'horizontal') {
        // Horizontal split (left/right)
        positions.push({
          x: lastPosition,
          y: 0,
          width: divider.position - lastPosition,
          height: 100
        });
      } else {
        // Vertical split (top/bottom)
        positions.push({
          x: 0,
          y: lastPosition,
          width: 100,
          height: divider.position - lastPosition
        });
      }
      lastPosition = divider.position;
    });

    // Add the last pane
    if (direction === 'horizontal') {
      positions.push({
        x: lastPosition,
        y: 0,
        width: 100 - lastPosition,
        height: 100
      });
    } else {
      positions.push({
        x: 0,
        y: lastPosition,
        width: 100,
        height: 100 - lastPosition
      });
    }

    return positions;
  }, []);

  const splitHorizontally = useCallback(async () => {
    if (!onCreateSession) return;
    
    try {
      const newSessionId = await onCreateSession();
      const currentPanes = layout.panes.length;
      const splitPosition = 50; // Split at 50%

      if (layout.direction === 'horizontal') {
        // Already horizontal, just add a new divider
        const newDividers = [...layout.dividers, { position: splitPosition, direction: 'horizontal' as const }];
        const positions = calculatePanePositions('horizontal', newDividers);
        
        setLayout({
          direction: 'horizontal',
          dividers: newDividers,
          panes: [
            ...layout.panes.map((pane, index) => ({
              ...pane,
              position: positions[index]
            })),
            {
              id: `pane-${Date.now()}`,
              sessionId: newSessionId,
              type: 'terminal' as const,
              position: positions[positions.length - 1]
            }
          ]
        });
      } else {
        // Convert to horizontal layout
        setLayout({
          direction: 'horizontal',
          dividers: [{ position: splitPosition, direction: 'horizontal' }],
          panes: [
            { ...layout.panes[0], position: { x: 0, y: 0, width: splitPosition, height: 100 } },
            {
              id: `pane-${Date.now()}`,
              sessionId: newSessionId,
              type: 'terminal',
              position: { x: splitPosition, y: 0, width: 100 - splitPosition, height: 100 }
            }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to create new session for split:', error);
    }
  }, [layout, onCreateSession, calculatePanePositions]);

  const splitVertically = useCallback(async () => {
    if (!onCreateSession) return;
    
    try {
      const newSessionId = await onCreateSession();
      const splitPosition = 50; // Split at 50%

      if (layout.direction === 'vertical') {
        // Already vertical, just add a new divider
        const newDividers = [...layout.dividers, { position: splitPosition, direction: 'vertical' as const }];
        const positions = calculatePanePositions('vertical', newDividers);
        
        setLayout({
          direction: 'vertical',
          dividers: newDividers,
          panes: [
            ...layout.panes.map((pane, index) => ({
              ...pane,
              position: positions[index]
            })),
            {
              id: `pane-${Date.now()}`,
              sessionId: newSessionId,
              type: 'terminal' as const,
              position: positions[positions.length - 1]
            }
          ]
        });
      } else {
        // Convert to vertical layout
        setLayout({
          direction: 'vertical',
          dividers: [{ position: splitPosition, direction: 'vertical' }],
          panes: [
            { ...layout.panes[0], position: { x: 0, y: 0, width: 100, height: splitPosition } },
            {
              id: `pane-${Date.now()}`,
              sessionId: newSessionId,
              type: 'terminal',
              position: { x: 0, y: splitPosition, width: 100, height: 100 - splitPosition }
            }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to create new session for split:', error);
    }
  }, [layout, onCreateSession, calculatePanePositions]);

  // Keyboard shortcuts
  useEffect(() => {
    const unregisterHorizontal = keyboardManager.registerListener('split-horizontal', splitHorizontally);
    const unregisterVertical = keyboardManager.registerListener('split-vertical', splitVertically);

    return () => {
      unregisterHorizontal();
      unregisterVertical();
    };
  }, [splitHorizontally, splitVertically]);

  const handleMouseDown = useCallback((dividerIndex: number, event: React.MouseEvent) => {
    event.preventDefault();
    const startPos = layout.direction === 'horizontal' ? event.clientX : event.clientY;
    const startSizes = layout.panes.map(pane => 
      layout.direction === 'horizontal' ? pane.position.width : pane.position.height
    );

    setDragging({ dividerIndex, startPos, startSizes });
  }, [layout]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!dragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentPos = layout.direction === 'horizontal' ? event.clientX : event.clientY;
    const containerSize = layout.direction === 'horizontal' ? rect.width : rect.height;
    const deltaPos = currentPos - dragging.startPos;
    const deltaPercent = (deltaPos / containerSize) * 100;

    // Update divider position
    const newDividers = [...layout.dividers];
    newDividers[dragging.dividerIndex] = {
      ...newDividers[dragging.dividerIndex],
      position: Math.max(10, Math.min(90, newDividers[dragging.dividerIndex].position + deltaPercent))
    };

    // Recalculate pane positions
    const newPositions = calculatePanePositions(layout.direction, newDividers);
    
    setLayout(prev => ({
      ...prev,
      dividers: newDividers,
      panes: prev.panes.map((pane, index) => ({
        ...pane,
        position: newPositions[index]
      }))
    }));
  }, [dragging, layout.direction, calculatePanePositions]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      className="split-pane-manager"
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {layout.panes.map((pane, index) => (
        <div
          key={pane.id}
          className="terminal-pane"
          style={{
            position: 'absolute',
            left: `${pane.position.x}%`,
            top: `${pane.position.y}%`,
            width: `${pane.position.width}%`,
            height: `${pane.position.height}%`,
            border: layout.panes.length > 1 ? '1px solid var(--border)' : 'none',
            transition: ui.animationsEnabled ? 'all 0.2s ease' : 'none'
          }}
        >
          <EnhancedTerminal
            sessionId={pane.sessionId}
            registerDataHandler={registerDataHandler}
            className="split-terminal"
          />
        </div>
      ))}

      {/* Dividers */}
      {layout.dividers.map((divider, index) => (
        <div
          key={index}
          className={`divider ${divider.direction}`}
          style={{
            position: 'absolute',
            [divider.direction === 'horizontal' ? 'left' : 'top']: `${divider.position}%`,
            [divider.direction === 'horizontal' ? 'top' : 'left']: '0',
            [divider.direction === 'horizontal' ? 'width' : 'height']: '4px',
            [divider.direction === 'horizontal' ? 'height' : 'width']: '100%',
            background: 'var(--border)',
            cursor: divider.direction === 'horizontal' ? 'col-resize' : 'row-resize',
            zIndex: 100,
            opacity: 0.7,
            transition: ui.animationsEnabled ? 'opacity 0.2s ease' : 'none'
          }}
          onMouseDown={(e) => handleMouseDown(index, e)}
        />
      ))}

    </div>
  );
}