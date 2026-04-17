"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  maxSize?: number; // in MB
  accept?: string;
}

const ImageUpload = ({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
  maxSize = 5,
  accept = "image/*,.gif"
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>(value || "");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, [disabled]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const processFile = async (file: File) => {
    setError("");
    
    // Validate file type
    if (!file.type.startsWith('image/') && !file.name.endsWith('.gif')) {
      setError("Ce fichier n'est pas une image valide");
      return;
    }

    // Validate file size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSize) {
      setError(`L'image ne doit pas dépasser ${maxSize}MB`);
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload to server
      const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const data = await response.json();
      
      setPreview(data.url);
      onChange(data.url);
    } catch (err) {
      setError("Erreur lors du téléchargement de l'image");
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept={accept}
        disabled={disabled}
      />

      {preview ? (
        <div className="relative group">
          <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-slate-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                disabled={disabled}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={handleClick}
                disabled={disabled}
                className="rounded-full"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-slate-600">Téléchargement...</p>
            </div>
          ) : (
            <>
              <div className={cn(
                "p-4 rounded-full mb-3 transition-colors",
                isDragging ? "bg-primary/10" : "bg-slate-100"
              )}>
                <ImageIcon className={cn(
                  "h-8 w-8 transition-colors",
                  isDragging ? "text-primary" : "text-slate-400"
                )} />
              </div>
              <p className="text-sm font-bold text-slate-700">
                {isDragging ? "Déposez l'image ici" : "Glissez-déposez une image"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ou cliquez pour sélectionner
              </p>
              <p className="text-[10px] text-slate-400 mt-2">
                PNG, JPG, GIF jusqu'à {maxSize}MB
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
