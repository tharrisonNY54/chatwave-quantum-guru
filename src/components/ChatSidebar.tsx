import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="w-72 bg-black/90 text-white p-4 space-y-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Chat History</h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>History not yet implemented.</p>
          {/* You can map over past conversations here later */}
        </div>
      </div>

      {/* overlay */}
      <div className="flex-1 bg-black/50" onClick={onClose}></div>
    </div>
  );
};

export default ChatSidebar;
