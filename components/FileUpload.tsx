import React, { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { FileData } from '../types';

interface FileUploadProps {
  onFilesSelected: (files: FileData[]) => void;
  files: FileData[];
  onRemoveFile: (index: number) => void;
  text: string;
  onTextChange: (text: string) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesSelected, 
  files, 
  onRemoveFile,
  text,
  onTextChange,
  disabled 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (fileList: File[]) => {
    const newFiles: FileData[] = [];
    
    for (const file of fileList) {
      const base64 = await readFileAsBase64(file);
      newFiles.push({
        name: file.name,
        type: file.type,
        data: base64
      });
    }
    onFilesSelected(newFiles);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-40 rounded-lg border border-dashed transition-all duration-300 cursor-pointer group
          ${dragActive ? "border-white bg-white/5" : "border-white/20 bg-transparent hover:bg-white/[0.02] hover:border-white/40"}
          ${disabled ? "opacity-50 pointer-events-none" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          className="hidden" 
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center gap-3 text-neutral-400 group-hover:text-neutral-300 transition-colors">
          <div className="p-3 bg-white/5 rounded-full ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium tracking-wide">
            UPLOAD ANY FILES
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-neutral-200 rounded-md text-xs border border-white/10">
              <FileText className="w-3 h-3 text-neutral-400" />
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button 
                onClick={() => onRemoveFile(idx)}
                disabled={disabled}
                className="hover:bg-white/10 p-0.5 rounded-full transition-colors text-neutral-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Text Input Area */}
      <div className="relative group">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste text or detailed instructions..."
          className="w-full h-32 p-4 rounded-lg bg-transparent border border-white/20 focus:border-white/50 focus:ring-0 outline-none resize-none text-neutral-200 placeholder:text-neutral-600 text-sm transition-all"
        />
      </div>
    </div>
  );
};

export default FileUpload;