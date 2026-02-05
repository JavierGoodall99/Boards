import React from 'react';
import { motion } from 'framer-motion';
import { AlignLeft, Sparkles } from 'lucide-react';
import { Task } from '../types';
import { THEME } from '../constants';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
  index: number;
  columnId: string;
  onDragStart: (e: React.DragEvent, id: string, columnId: string, index: number, type: 'TASK') => void;
  onEnhance: (taskId: string, content: string) => void;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, columnId, onDragStart, onEnhance, onClick }) => {
  
  const stopPropagation = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      layout
      layoutId={task.id}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        // @ts-ignore - native event typing
        onDragStart(e, task.id, columnId, index, 'TASK');
      }}
      onClick={() => onClick(task)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        "group relative p-3 mb-2 rounded-lg shadow-sm cursor-pointer transition-colors duration-200",
        THEME.card,
        THEME.cardHover,
        "border border-transparent hover:border-white/10"
      )}
    >
      {/* Priority Label */}
      {task.priority && (
        <div className={clsx(
          "h-1.5 w-8 rounded-full mb-2",
          task.priority === 'high' ? "bg-red-500" :
          task.priority === 'medium' ? "bg-yellow-400" :
          "bg-green-500"
        )} title={`Priority: ${task.priority}`} />
      )}

      <div className="flex justify-between items-start gap-2 mb-2">
        <h3 className={clsx("text-sm font-normal leading-snug break-words", THEME.textMain)}>
          {task.content}
        </h3>
        
        <button 
          className="text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onEnhance(task.id, task.content);
          }}
          onPointerDown={stopPropagation}
          onMouseDown={stopPropagation}
          title="Enhance with AI"
        >
          <Sparkles size={12} className="pointer-events-none" />
        </button>
      </div>

      {/* Tags moved below title */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
            {task.tags.map(tag => (
                <span key={tag} className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#9FADBC]/20 text-[#9FADBC] border border-transparent">
                    {tag}
                </span>
            ))}
        </div>
      )}

      {task.description && (
        <div className="flex items-center text-white/50">
          <AlignLeft size={14} />
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;