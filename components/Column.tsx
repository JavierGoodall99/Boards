import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, GripVertical, ChevronsLeft, ArrowRightLeft, Trash2, MoreHorizontal, Palette } from 'lucide-react';
import TaskCard from './TaskCard';
import { Column as ColumnType, Task } from '../types';
import { THEME, COLUMN_COLORS } from '../constants';
import clsx from 'clsx';

interface ColumnProps {
  column: ColumnType;
  onDragStart: (e: React.DragEvent, id: string, columnId: string, index: number, type: 'TASK') => void;
  onDragOver: (e: React.DragEvent, columnId: string) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  onAddTask: (columnId: string, content: string) => void;
  onGenerateTasks: (columnId: string, title: string) => void;
  onEnhanceTask: (taskId: string, content: string) => void;
  onTaskClick: (task: Task) => void;
  onDeleteColumn: (columnId: string) => void;
  onUpdateColumn: (columnId: string, updates: Partial<ColumnType>) => void;
  isAiLoading?: boolean;
}

const Column: React.FC<ColumnProps> = ({ 
  column, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onAddTask,
  onGenerateTasks,
  onEnhanceTask,
  onTaskClick,
  onDeleteColumn,
  onUpdateColumn,
  isAiLoading
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;
    onAddTask(column.id, newTaskContent);
    setNewTaskContent('');
    setIsAdding(false);
  };

  const stopPropagation = (e: React.PointerEvent | React.MouseEvent) => {
      e.stopPropagation();
  };

  const bgColor = column.color || '#101204';

  return (
    <div 
      className={clsx(
        "flex flex-col max-h-full h-fit shrink-0 transition-all duration-300 rounded-xl relative group shadow-lg",
        isCollapsed 
          ? "w-10 h-auto cursor-pointer border border-white/5 hover:bg-[#1d2125]" 
          : "w-72"
      )}
      style={{ backgroundColor: isCollapsed ? undefined : bgColor }}
      onClick={isCollapsed ? () => setIsCollapsed(false) : undefined}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e, column.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e, column.id);
      }}
    >
      {isCollapsed ? (
         // Collapsed View
         <div className="flex flex-col items-center py-4 gap-4 h-full min-h-[160px] bg-[#101204]/80 rounded-xl">
            <div className="flex-1 flex justify-center overflow-hidden py-2">
                <div 
                    className="whitespace-nowrap font-bold text-sm tracking-wide text-[#9FADBC] select-none"
                    style={{ writingMode: 'vertical-lr', textOrientation: 'sideways' }}
                >
                    {column.title}
                </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#22272b] border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#9FADBC] shrink-0">
                {column.tasks.length}
            </div>
         </div>
      ) : (
         // Expanded View
         <div className="flex flex-col h-full max-h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3 cursor-grab active:cursor-grabbing text-[#DCDFE4] relative">
                <h2 className="font-semibold text-sm pl-1">{column.title}</h2>
                <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowPalette(!showPalette);
                        }}
                        className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="Change Color"
                    >
                        <Palette size={14} />
                    </button>
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteColumn(column.id);
                        }}
                        className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="Delete Section"
                    >
                        <Trash2 size={14} />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsCollapsed(true);
                        }}
                        className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="Collapse"
                    >
                        <ChevronsLeft size={14} />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onGenerateTasks(column.id, column.title);
                        }}
                        disabled={isAiLoading}
                        className={clsx(
                            "p-1.5 rounded transition-all duration-300",
                            isAiLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10 hover:text-indigo-300 text-white/50"
                        )}
                        title="Generate AI Tasks"
                    >
                        <Sparkles size={14} className={clsx(isAiLoading && "animate-pulse")} />
                    </button>
                </div>

                {/* Color Palette Popover */}
                {showPalette && (
                    <div className="absolute top-10 right-2 bg-[#22272b] p-2 rounded-lg shadow-xl grid grid-cols-3 gap-2 z-50 border border-white/10">
                        {COLUMN_COLORS.map((c) => (
                            <button
                                key={c.name}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateColumn(column.id, { color: c.value });
                                    setShowPalette(false);
                                }}
                                className="w-6 h-6 rounded-full hover:ring-2 ring-white/50 transition-all"
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Task List */}
            <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-1 custom-scrollbar">
                {column.tasks.map((task, index) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    columnId={column.id}
                    onDragStart={onDragStart}
                    onEnhance={onEnhanceTask}
                    onClick={onTaskClick}
                />
                ))}
                
                {column.tasks.length === 0 && !isAdding && (
                    <div className="h-16 flex items-center justify-center text-white/20 text-xs italic">
                        Empty list
                    </div>
                )}
            </div>

            {/* Footer / Add Action */}
            <div className="p-2">
                {isAdding ? (
                <form 
                    onSubmit={handleAddSubmit} 
                    className="bg-[#22272b] p-2 rounded-lg shadow-sm"
                    onPointerDown={stopPropagation}
                    onMouseDown={stopPropagation}
                >
                    <textarea
                        autoFocus
                        value={newTaskContent}
                        onChange={(e) => setNewTaskContent(e.target.value)}
                        placeholder="Enter a title for this card..."
                        className="w-full bg-transparent text-sm text-[#DCDFE4] placeholder-white/40 resize-none outline-none mb-2 min-h-[56px] block"
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddSubmit(e);
                            }
                        }}
                    />
                    <div className="flex items-center gap-2">
                        <button 
                            type="submit"
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
                        >
                            Add card
                        </button>
                        <button 
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="p-1.5 text-white/60 hover:text-white transition-colors"
                        >
                            <Plus size={20} className="rotate-45" />
                        </button>
                    </div>
                </form>
                ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 text-[#9FADBC] hover:text-[#DCDFE4] hover:bg-white/10 w-full px-2 py-1.5 rounded-lg transition-colors text-sm text-left"
                >
                    <Plus size={16} />
                    <span>Add a card</span>
                </button>
                )}
            </div>
         </div>
      )}
      
      {/* Click outside listener for palette could be implemented here, but simple toggle is okay for now */}
      {showPalette && (
         <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPalette(false)} 
         />
      )}
    </div>
  );
};

export default Column;