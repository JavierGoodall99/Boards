import React, { useState } from 'react';
import { Layout, Plus, Trash2, Kanban, ChevronLeft, Trello } from 'lucide-react';
import { motion } from 'framer-motion';
import { Board } from '../types';
import clsx from 'clsx';

interface SidebarProps {
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (id: string) => void;
  onAddBoard: (title: string) => void;
  onDeleteBoard: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ boards, activeBoardId, onSelectBoard, onAddBoard, onDeleteBoard, isOpen, onToggle }: SidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardTitle.trim()) {
      onAddBoard(newBoardTitle);
      setNewBoardTitle('');
      setIsCreating(false);
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isOpen ? 260 : 0,
        opacity: isOpen ? 1 : 0
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full shrink-0 border-r border-white/10 bg-[#1d2125] z-50 overflow-hidden relative shadow-xl"
    >
      <div className="w-[260px] h-full flex flex-col text-[#9FADBC]">
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
           <div className="flex items-center gap-2 text-white font-bold">
              <div className="p-1 bg-blue-500 rounded text-white">
                 <Trello size={16} />
              </div>
              <span>Trello</span>
           </div>
           <button 
              onClick={onToggle}
              className="p-1 hover:bg-white/10 rounded transition-colors"
           >
              <ChevronLeft size={16} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
                <span>Your boards</span>
                <Plus size={14} className="hover:text-white cursor-pointer" onClick={() => setIsCreating(true)} />
            </h2>
            
            <div className="space-y-1">
                {boards.map(board => (
                    <div 
                    key={board.id}
                    onClick={() => onSelectBoard(board.id)}
                    className={clsx(
                        "group flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors text-sm",
                        board.id === activeBoardId 
                        ? "bg-blue-600/20 text-blue-400" 
                        : "hover:bg-white/10 text-[#9FADBC] hover:text-[#DCDFE4]"
                    )}
                    >
                    <div className="flex items-center gap-3 truncate">
                        <div className="w-4 h-4 rounded-sm bg-gradient-to-tr from-pink-500 to-purple-500"></div>
                        <span className="truncate font-medium">{board.title}</span>
                    </div>
                    
                    {boards.length > 1 && (
                        <button
                            onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm(`Delete board "${board.title}"?`)) onDeleteBoard(board.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded text-white/50 hover:text-red-400"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                    </div>
                ))}
            </div>
          </div>

          {isCreating && (
             <form onSubmit={handleCreate} className="px-2 mb-4">
                <input 
                  autoFocus
                  className="w-full bg-[#22272b] border border-blue-500 rounded px-2 py-1 text-sm text-white outline-none"
                  placeholder="New board title..."
                  value={newBoardTitle}
                  onChange={e => setNewBoardTitle(e.target.value)}
                  onBlur={() => {
                      if (!newBoardTitle.trim()) setIsCreating(false);
                  }}
                />
             </form>
          )}
        </div>

        {/* User / Footer */}
        <div className="p-3 border-t border-white/10">
           <div className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                 JG
              </div>
              <div className="flex-1 overflow-hidden">
                 <div className="text-sm font-medium text-[#DCDFE4]">JayGood</div>
                 <div className="text-xs">Free Workspace</div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}