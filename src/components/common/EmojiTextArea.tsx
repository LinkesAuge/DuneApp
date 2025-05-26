import React, { useState, useRef } from 'react';
import { Smile } from 'lucide-react';

interface EmojiTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: string;
}

const commonEmojis = [
  '😀', '😊', '😄', '😎', '🤔', '😮', '😢', '😡', '👍', '👎', 
  '❤️', '🔥', '⭐', '✅', '❌', '💯', '🎉', '🚀', '💎', '⚡'
];

const EmojiTextArea: React.FC<EmojiTextAreaProps> = ({
  value,
  onChange,
  placeholder = "Type your message...",
  className = '',
  disabled = false,
  minHeight = '80px'
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = (emoji: string) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.slice(0, start) + emoji + value.slice(end);
    
    onChange(newValue);
    
    // Restore cursor position after emoji
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
    
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Close emoji picker on Escape
    if (e.key === 'Escape') {
      setShowEmojiPicker(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          ref={textAreaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full p-3 pr-12 border border-sand-300 rounded-lg resize-none 
            focus:outline-none focus:ring-2 focus:ring-spice-500 focus:border-transparent
            ${className}
          `}
          style={{ minHeight }}
        />
        
        {/* Emoji button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="absolute right-3 top-3 text-sand-600 hover:text-spice-600 transition-colors"
          title="Add emoji"
          disabled={disabled}
        >
          <Smile size={18} />
        </button>
      </div>

      {/* Emoji hint */}
      {!disabled && (
        <div className="mt-1 text-xs text-sand-500">
          💡 Tip: Use keyboard shortcuts (Win + . or Win + ;) for more emojis
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-sand-300 rounded-lg shadow-lg p-3 w-64">
          <div className="grid grid-cols-10 gap-1">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="w-6 h-6 flex items-center justify-center hover:bg-sand-100 rounded text-sm transition-colors"
                title={`Insert ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-sand-200 text-xs text-sand-500">
            Click an emoji to insert it
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showEmojiPicker && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};

export default EmojiTextArea; 