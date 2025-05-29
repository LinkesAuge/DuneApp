import React, { useState, useRef } from 'react';
import { Smile } from 'lucide-react';

interface EmojiTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: string;
  maxLength?: number;
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
  minHeight = '80px',
  maxLength
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = (emoji: string) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    if (maxLength && (currentVal.length - (end - start) + emoji.length > maxLength)) {
      return;
    }

    const newValue = currentVal.slice(0, start) + emoji + currentVal.slice(end);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
    setShowEmojiPicker(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;
    if (maxLength && val.length > maxLength) {
      val = val.slice(0, maxLength);
    }
    onChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            w-full p-3 pr-12 border border-slate-600 bg-slate-800 text-slate-100 
            focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400
            disabled:opacity-50 disabled:bg-slate-700
            ${className}
          `}
          style={{ minHeight }}
        />
        
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="absolute right-3 top-3 text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
          title="Add emoji"
          disabled={disabled}
        >
          <Smile size={18} />
        </button>
      </div>

      {!disabled && !className.includes('min-h-') && !className.includes('h-') && minHeight === '80px' &&
        <div className="mt-1 text-xs text-slate-500">
          💡 Tip: Use Win + . or Win + ; for system emoji picker.
        </div>
      }

      {showEmojiPicker && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-slate-800 border border-slate-700 shadow-lg p-3 w-64">
          <div className="grid grid-cols-10 gap-1">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-sm transition-colors"
                title={`Insert ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-400">
            Click an emoji to insert.
          </div>
        </div>
      )}

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