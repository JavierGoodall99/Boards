import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Plus, PanelLeft, MoreHorizontal, Star, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import Column from './components/Column';
import TaskModal from './components/TaskModal';
import Sidebar from './components/Sidebar';
import { Board, DragItem, Column as ColumnType, Task } from './types';
import { INITIAL_BOARDS, THEME } from './constants';
import { generateTasksForColumn, enhanceTaskDescription } from './services/geminiService';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);
  const [activeBoardId, setActiveBoardId] = useState<string>(INITIAL_BOARDS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null); // columnId or 'global'
  
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const [selectedTaskState, setSelectedTaskState] = useState<{ task: Task, columnTitle: string, columnId: string } | null>(null);

  const dragNodeRef = useRef<EventTarget | null>(null);

  // Derived state for the current board
  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];

  // Helper to update the columns of the active board
  const updateActiveBoardColumns = (newColumns: ColumnType[]) => {
    setBoards(prevBoards => prevBoards.map(board => 
        board.id === activeBoardId ? { ...board, columns: newColumns } : board
    ));
  };

  // --- Board Management ---
  const handleAddBoard = (title: string) => {
    const newBoard: Board = {
        id: generateId(),
        title,
        columns: []
    };
    setBoards(prev => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
  };

  const handleDeleteBoard = (id: string) => {
    const newBoards = boards.filter(b => b.id !== id);
    setBoards(newBoards);
    if (activeBoardId === id) {
        setActiveBoardId(newBoards[0]?.id || '');
    }
  };

  // --- Drag and Drop Logic ---

  const onTaskDragStart = (e: React.DragEvent, id: string, columnId: string, index: number, type: 'TASK') => {
    setDragItem({ id, columnId, index, type });
    dragNodeRef.current = e.target;
  };

  const onColumnDragStart = (e: React.DragEvent, id: string, index: number) => {
    setDragItem({ id, index, type: 'COLUMN' });
    dragNodeRef.current = e.target;
  };

  const onDragOver = (e: React.DragEvent, targetId: string, type: 'TASK' | 'COLUMN') => {
    if (!dragItem) return;

    if (dragItem.type === 'COLUMN' && type === 'COLUMN') {
        const sourceIndex = dragItem.index;
        const targetIndex = activeBoard.columns.findIndex(c => c.id === targetId);
        
        if (sourceIndex === targetIndex || targetIndex === -1) return;

        const newColumns = [...activeBoard.columns];
        const [removed] = newColumns.splice(sourceIndex, 1);
        newColumns.splice(targetIndex, 0, removed);

        updateActiveBoardColumns(newColumns);
        setDragItem({ ...dragItem, index: targetIndex });
    } 
  };

  const onDrop = (e: React.DragEvent, targetColumnId: string) => {
    if (!dragItem) return;

    if (dragItem.type === 'TASK') {
        if(!dragItem.columnId) return;

        const sourceColIndex = activeBoard.columns.findIndex(c => c.id === dragItem.columnId);
        const targetColIndex = activeBoard.columns.findIndex(c => c.id === targetColumnId);

        if (sourceColIndex === -1 || targetColIndex === -1) return;

        const newColumns = [...activeBoard.columns];
        const sourceCol = newColumns[sourceColIndex];
        const targetCol = newColumns[targetColIndex];

        // Remove from source
        const [movedTask] = sourceCol.tasks.splice(dragItem.index, 1);
        
        // Add to target
        targetCol.tasks.push(movedTask);

        updateActiveBoardColumns(newColumns);
    }
    
    setDragItem(null);
    dragNodeRef.current = null;
  };

  // --- Data Management (CRUD) for Active Board ---

  const handleAddTask = (columnId: string, content: string) => {
    const newColumns = activeBoard.columns.map(col => {
      if (col.id === columnId) {
        return {
          ...col,
          tasks: [...col.tasks, { id: generateId(), content, priority: 'medium' as const }]
        };
      }
      return col;
    });
    updateActiveBoardColumns(newColumns);
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    const newColumn: ColumnType = {
      id: generateId(),
      title: newColumnTitle,
      tasks: []
    };

    updateActiveBoardColumns([...activeBoard.columns, newColumn]);
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    const newColumns = activeBoard.columns.map(col => ({
        ...col,
        tasks: col.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }));
    updateActiveBoardColumns(newColumns);

    if (selectedTaskState && selectedTaskState.task.id === taskId) {
        setSelectedTaskState(prev => prev ? { 
            ...prev, 
            task: { ...prev.task, ...updates } 
        } : null);
    }
  };

  const handleUpdateColumn = (columnId: string, updates: Partial<ColumnType>) => {
    const newColumns = activeBoard.columns.map(col => 
      col.id === columnId ? { ...col, ...updates } : col
    );
    updateActiveBoardColumns(newColumns);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      updateActiveBoardColumns(activeBoard.columns.filter(c => c.id !== columnId));
    }
  };

  const handleDeleteTask = () => {
    if (!selectedTaskState) return;
    
    const { columnId, task } = selectedTaskState;
    
    if (window.confirm("Are you sure you want to delete this card?")) {
        const newColumns = activeBoard.columns.map(col => {
            if (col.id === columnId) {
                return { ...col, tasks: col.tasks.filter(t => t.id !== task.id) };
            }
            return col;
        });
        updateActiveBoardColumns(newColumns);
        setSelectedTaskState(null);
    }
  };

  // --- AI Features ---

  const handleGenerateTasks = async (columnId: string, columnTitle: string) => {
    setIsAiLoading(columnId);
    const column = activeBoard.columns.find(c => c.id === columnId);
    const existingTasks = column?.tasks.map(t => t.content) || [];

    const newTitles = await generateTasksForColumn(columnTitle, existingTasks);

    if (newTitles.length > 0) {
        const newColumns = activeBoard.columns.map(col => {
          if (col.id === columnId) {
            const createdTasks: Task[] = newTitles.map(title => ({
              id: generateId(),
              content: title,
              priority: 'low',
              tags: ['AI Generated']
            }));
            return {
              ...col,
              tasks: [...col.tasks, ...createdTasks]
            };
          }
          return col;
        });
        updateActiveBoardColumns(newColumns);
    }
    setIsAiLoading(null);
  };

  const handleEnhanceTask = async (taskId: string, content: string) => {
    setIsAiLoading('global');
    const description = await enhanceTaskDescription(content);
    handleUpdateTask(taskId, { description });
    setIsAiLoading(null);
  };

  return (
    <div className={clsx("flex h-screen text-[#B6C2CF] font-sans selection:bg-indigo-500/30 overflow-hidden", THEME.bg)}>
      
      {/* Sidebar */}
      <Sidebar 
        boards={boards}
        activeBoardId={activeBoardId}
        onSelectBoard={setActiveBoardId}
        onAddBoard={handleAddBoard}
        onDeleteBoard={handleDeleteBoard}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Navbar */}
        <nav className="h-14 bg-black/20 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-40">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-1.5 text-white/80 hover:bg-white/20 rounded transition-colors"
                >
                  <PanelLeft size={20} />
                </button>
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-lg text-white">{activeBoard?.title}</h2>
                    <button className="p-1.5 hover:bg-white/20 rounded transition-colors">
                        <Star size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-white/20 rounded transition-colors">
                        <Users size={16} />
                    </button>
                    <button className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors">
                        Board
                    </button>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {isAiLoading === 'global' && (
                    <div className="flex items-center gap-2 text-white bg-indigo-500/40 px-3 py-1 rounded-full text-sm animate-pulse">
                        <Sparkles size={14} />
                        <span>AI Enhancing...</span>
                    </div>
                )}
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white border-2 border-transparent hover:border-white/50 cursor-pointer">
                    JG
                </div>
            </div>
        </nav>

        {/* Board Canvas */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4 pt-4">
            {!activeBoard ? (
                <div className="flex items-center justify-center h-full text-white/50">
                    Select or create a board
                </div>
            ) : (
                <div className="flex h-full gap-3 w-max items-start">
                    <AnimatePresence mode="popLayout">
                        {activeBoard.columns.map((column, index) => (
                        <motion.div
                            key={column.id}
                            layout
                            layoutId={column.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            draggable
                            onDragStart={(e) => {
                                // @ts-ignore
                                onColumnDragStart(e, column.id, index)
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                // @ts-ignore
                                onDragOver(e, column.id, 'COLUMN');
                            }}
                            className="h-full max-h-full cursor-grab active:cursor-grabbing"
                        >
                            <Column
                                column={column}
                                onDragStart={onTaskDragStart}
                                onDragOver={(e, id) => {
                                        // @ts-ignore
                                        onDragOver(e, id, 'TASK'); 
                                }}
                                onDrop={onDrop}
                                onAddTask={handleAddTask}
                                onGenerateTasks={handleGenerateTasks}
                                onEnhanceTask={handleEnhanceTask}
                                onDeleteColumn={handleDeleteColumn}
                                onUpdateColumn={handleUpdateColumn}
                                onTaskClick={(task) => setSelectedTaskState({ task, columnTitle: column.title, columnId: column.id })}
                                isAiLoading={isAiLoading === column.id}
                            />
                        </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add List Button / Form */}
                    <div className="w-72 shrink-0">
                        {isAddingColumn ? (
                            <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={clsx("p-2 rounded-xl shadow-lg", THEME.list)}
                            >
                                <form onSubmit={handleAddColumn}>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newColumnTitle}
                                    onChange={(e) => setNewColumnTitle(e.target.value)}
                                    placeholder="Enter list title..."
                                    className="w-full bg-[#22272b] text-sm text-white placeholder-white/40 rounded border border-transparent focus:border-blue-500 px-3 py-2 outline-none transition-colors mb-2"
                                />
                                <div className="flex items-center gap-2">
                                    <button 
                                    type="submit"
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
                                    >
                                    Add list
                                    </button>
                                    <button 
                                    type="button"
                                    onClick={() => setIsAddingColumn(false)}
                                    className="p-1.5 text-white/60 hover:text-white transition-colors"
                                    >
                                        <Plus size={20} className="rotate-45" />
                                    </button>
                                </div>
                                </form>
                            </motion.div>
                        ) : (
                            <button 
                            onClick={() => setIsAddingColumn(true)}
                            className="w-full h-12 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center px-4 cursor-pointer text-white font-medium"
                            >
                                <Plus size={20} className="mr-2" />
                                Add another list
                            </button>
                        )}
                    </div>
                </div>
            )}
        </main>
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {selectedTaskState && (
            <TaskModal 
                task={selectedTaskState.task} 
                columnTitle={selectedTaskState.columnTitle} 
                onClose={() => setSelectedTaskState(null)} 
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
            />
        )}
      </AnimatePresence>
    </div>
  );
}