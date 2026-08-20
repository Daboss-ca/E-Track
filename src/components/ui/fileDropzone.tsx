// src/components/ui/fileDropzone.tsx
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { UploadCloud, X, ImageIcon, FileCheck } from 'lucide-react';
import Badge from './Badge/badge';

interface FileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  label?: string;
  helperText?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Sub-component na gumagamit ng FileReader para sa guaranteed image display
const ImagePreviewCard: React.FC<{
  file: File;
  index: number;
  onRemove: (index: number) => void;
}> = ({ file, index, onRemove }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const reader = new FileReader();

    reader.onloadend = () => {
      if (isMounted && typeof reader.result === 'string') {
        setDataUrl(reader.result);
      }
    };

    reader.readAsDataURL(file);

    return () => {
      isMounted = false;
    };
  }, [file]);

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-2 shadow-xs transition-all hover:border-emerald-500/40 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/80">
      {/* Image Preview Window */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={file.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ImageIcon className="h-6 w-6 text-gray-400 animate-pulse" />
        )}

        {/* Delete Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-white opacity-0 shadow-md backdrop-blur-xs transition-all hover:bg-red-700 group-hover:opacity-100"
          title={`Remove ${file.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* File Details */}
      <div className="mt-2 px-1 pb-0.5">
        <p className="truncate text-theme-xs font-medium text-gray-800 dark:text-white/90">
          {file.name}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          {formatFileSize(file.size)}
        </p>
      </div>
    </div>
  );
};

const FileDropzone: React.FC<FileDropzoneProps> = ({
  files,
  onFilesChange,
  maxFiles = 4,
  label = 'Upload image here',
  helperText = 'PNG or JPG, up to 5MB each',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming || incoming.length === 0) return;
      const next = [...files, ...Array.from(incoming)].slice(0, maxFiles);
      onFilesChange(next);
    },
    [files, maxFiles, onFilesChange]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (files.length >= maxFiles) return;
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const isLimitReached = files.length >= maxFiles;

  return (
    <div className="w-full space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isLimitReached) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isLimitReached && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isLimitReached) {
            inputRef.current?.click();
          }
        }}
        className={`flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isLimitReached
            ? 'cursor-not-allowed border-gray-200 bg-gray-50/50 opacity-60 dark:border-gray-800 dark:bg-white/[0.01]'
            : isDragging
            ? 'border-emerald-500 bg-emerald-500/10 dark:border-emerald-500 dark:bg-emerald-500/10'
            : 'cursor-pointer border-gray-200 bg-gray-50/50 hover:border-emerald-500/50 hover:bg-gray-100/60 dark:border-gray-800 dark:bg-white/[0.02] dark:hover:border-emerald-500/50 dark:hover:bg-white/[0.04]'
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          <UploadCloud className="h-6 w-6 stroke-[1.75]" />
        </div>
        
        <div>
          <p className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
            {isLimitReached ? 'Maximum upload limit reached' : label}
          </p>
          <p className="mt-0.5 text-theme-xs text-gray-400 dark:text-gray-500">
            {isLimitReached ? `You have reached the ${maxFiles} image limit.` : helperText}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={isLimitReached}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Grid Previews */}
      {files.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-theme-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Attached Images
            </span>
            <Badge
              color={isLimitReached ? 'warning' : 'success'}
              variant="light"
              size="sm"
              startIcon={<FileCheck className="h-3 w-3" />}
            >
              {files.length} of {maxFiles} Uploaded
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {files.map((file, index) => (
              <ImagePreviewCard
                key={`${file.name}-${file.lastModified}-${index}`}
                file={file}
                index={index}
                onRemove={removeFile}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;