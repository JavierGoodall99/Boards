import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Tag, AlignLeft, Flag, Plus, Check, Trash2 } from 'lucide-react';
import { Task } from '../types';
import clsx from 'clsx';

interface TaskModalProps {
  task: Task;
  columnTitle: string;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, columnTitle, onClose, onUpdate, onDelete }) => {
  const [description, setDescription] = useState(task.description || '');
  const [newTag, setNewTag] = useState('');
  const [isEditingTag, setIsEditingTag] = useState(false);

  // Sync state if prop changes (e.g. AI update happens while modal is open)
  useEffect(() => {
    setDescription(task.description || '');
  }, [task.description]);

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      onUpdate(task.id, { description });
    }
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    onUpdate(task.id, { priority });
  };

  const saveTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) {
        setIsEditingTag(false);
        return;
    }
    
    const currentTags = task.tags || [];
    if (!currentTags.includes(trimmedTag)) {
      onUpdate(task.id, { tags: [...currentTags, trimmedTag] });
    }
    setNewTag('');
    setIsEditingTag(false);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    saveTag();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = task.tags || [];
    onUpdate(task.id, { tags: currentTags.filter(t => t !== tagToRemove) });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/5 bg-white/[0.02]">
           <div className="flex-1 mr-8">
             <h2 className="text-xl font-bold text-white mb-2 leading-snug">{task.content}</h2>
             <div className="text-sm text-white/40 flex items-center gap-2">
                in list <span className="text-indigo-400 font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 underline decoration-indigo-500/30">{columnTitle}</span>
             </div>
           </div>
           <button 
             type="button"
             onClick={onClose}
             className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
           >
             <X size={20} />
           </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="flex gap-8 flex-col md:flex-row">
            {/* Main Content Area */}
            <div className="flex-1 space-y-8">
               
               {/* Description Section */}
               <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white/80 font-semibold">
                    <AlignLeft size={18} />
                    <h3>Description</h3>
                  </div>
                  <div className="relative">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleDescriptionBlur}
                        placeholder="Add a more detailed description..."
                        className="w-full bg-black/20 rounded-xl p-4 border border-white/5 min-h-[150px] text-sm text-white/90 leading-relaxed whitespace-pre-wrap outline-none focus:border-indigo-500/30 focus:bg-black/40 transition-all resize-none placeholder-white/20"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-white/20 pointer-events-none">
                        Markdown supported
                    </div>
                  </div>
               </div>

            </div>

            {/* Sidebar Metadata */}
            <div className="w-full md:w-56 space-y-8 flex flex-col">
                {/* Priority */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider">Priority</h4>
                    <div className="flex flex-col gap-2">
                        {(['high', 'medium', 'low'] as const).map(p => {
                            const isActive = task.priority === p;
                            return (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => handlePriorityChange(p)}
                                    className={clsx(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium w-full transition-all duration-200",
                                        isActive && p === 'high' ? "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)]" :
                                        isActive && p === 'medium' ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)]" :
                                        isActive && p === 'low' ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]" :
                                        "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <Flag size={14} fill={isActive ? "currentColor" : "none"} />
                                    <span className="capitalize flex-1 text-left">{p}</span>
                                    {isActive && <Check size={12} />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {task.tags?.map(tag => (
                            <div key={tag} className="group relative px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/70 text-xs flex items-center gap-1.5 hover:border-white/20 transition-colors">
                                <Tag size={10} />
                                {tag}
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={8} />
                                </button>
                            </div>
                        ))}
                        
                        {isEditingTag ? (
                            <form onSubmit={handleAddTag} className="w-full">
                                <input
                                    autoFocus
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onBlur={saveTag}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            setIsEditingTag(false);
                                            setNewTag('');
                                            e.stopPropagation();
                                        }
                                    }}
                                    placeholder="New tag..."
                                    className="w-full bg-black/40 border border-indigo-500/50 rounded px-2 py-1 text-xs text-white outline-none focus:bg-black/60 transition-colors"
                                />
                            </form>
                        ) : (
                            <button 
                                type="button"
                                onClick={() => setIsEditingTag(true)}
                                className="px-2.5 py-1 rounded-md bg-white/5 border border-dashed border-white/20 text-white/40 text-xs flex items-center gap-1.5 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <Plus size={10} />
                                Add tag
                            </button>
                        )}
                    </div>
                </div>

                {/* Spacer to push actions down if needed */}
                <div className="flex-1" />

                {/* Actions */}
                <div className="pt-6 border-t border-white/5 space-y-3">
                     <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                     >
                        <Trash2 size={14} />
                        Delete Card
                     </button>
                </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskModal;