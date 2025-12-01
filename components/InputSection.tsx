import React, { useRef, useState, DragEvent, ClipboardEvent } from 'react';
import { ArrowRight, Loader2, Image as ImageIcon, X, Upload } from 'lucide-react';

interface InputSectionProps {
  value: string;
  image: string | null;
  onChange: (text: string) => void;
  onImageChange: (image: string | null) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  value, 
  image, 
  onChange, 
  onImageChange, 
  onSubmit, 
  isLoading 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onSubmit();
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          e.preventDefault(); // Prevent default if we found an image
          return;
        }
      }
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const hasContent = value.trim().length > 0 || !!image;

  return (
    <div className="flex flex-col gap-4">
      <div 
        className={`relative transition-all duration-200 ease-in-out ${isDragging ? 'scale-[1.02]' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <textarea
          className={`
            w-full h-48 p-4 bg-gray-50 border rounded-xl 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none 
            resize-none text-gray-700 placeholder-gray-400 transition-all font-mono text-sm leading-relaxed
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
          `}
          placeholder="Paste text here or drop a screenshot..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={isLoading}
        />
        
        <div className="absolute bottom-3 right-3 flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) processFile(e.target.files[0]);
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Upload Image"
            disabled={isLoading}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <div className="text-xs text-gray-400 pointer-events-none">
            {value.length} chars
          </div>
        </div>

        {isDragging && (
          <div className="absolute inset-0 bg-blue-50/80 backdrop-blur-sm rounded-xl border-2 border-blue-500 border-dashed flex flex-col items-center justify-center text-blue-600 pointer-events-none">
            <Upload className="w-8 h-8 mb-2" />
            <span className="font-semibold">Drop image to attach</span>
          </div>
        )}
      </div>

      {image && (
        <div className="relative group w-fit">
          <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm max-h-32">
            <img src={image} alt="Attached" className="h-full max-h-32 w-auto object-contain bg-gray-100" />
            <button
              onClick={() => onImageChange(null)}
              className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Image attached</p>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!hasContent || isLoading}
        className={`
          flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all transform active:scale-[0.98]
          ${!hasContent || isLoading 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <span>Generate Link</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
      <div className="text-center">
         <span className="text-xs text-gray-400">Press Cmd/Ctrl + Enter to submit</span>
      </div>
    </div>
  );
};

export default InputSection;