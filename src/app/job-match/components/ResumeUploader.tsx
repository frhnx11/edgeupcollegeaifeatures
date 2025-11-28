"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function ResumeUploader({ onUpload, isLoading }: ResumeUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        // Create preview
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
        onUpload(file);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative overflow-hidden
        border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer
        transition-all duration-300 ease-out
        ${isDragActive
          ? "border-blue-400 bg-blue-50/50 scale-[1.02] shadow-xl shadow-blue-500/10"
          : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-lg"
        }
        ${isLoading ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}
      `}
    >
      <input {...getInputProps()} />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`
          absolute -top-24 -right-24 w-48 h-48 rounded-full
          transition-all duration-500
          ${isDragActive ? "bg-blue-100 scale-150" : "bg-slate-50"}
        `} />
        <div className={`
          absolute -bottom-16 -left-16 w-32 h-32 rounded-full
          transition-all duration-500
          ${isDragActive ? "bg-blue-100 scale-150" : "bg-slate-50"}
        `} />
      </div>

      <div className="relative flex flex-col items-center gap-5">
        {/* Icon */}
        <div className={`
          relative w-20 h-20 rounded-2xl flex items-center justify-center
          transition-all duration-300
          ${isDragActive
            ? "bg-blue-500 shadow-lg shadow-blue-500/30 scale-110"
            : "bg-gradient-to-br from-blue-50 to-blue-100"
          }
        `}>
          {isLoading ? (
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className={`w-10 h-10 transition-all duration-300 ${isDragActive ? "text-white scale-110" : "text-blue-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isDragActive ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              )}
            </svg>
          )}

          {/* Pulse effect when dragging */}
          {isDragActive && (
            <div className="absolute inset-0 rounded-2xl bg-blue-400 animate-ping opacity-20" />
          )}
        </div>

        {/* Text */}
        {isLoading ? (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-700">Processing your resume...</p>
            <p className="text-sm text-slate-400">This may take a few seconds</p>
          </div>
        ) : isDragActive ? (
          <div className="space-y-2">
            <p className="text-xl font-semibold text-blue-600">Drop it here!</p>
            <p className="text-sm text-blue-400">Release to upload your resume</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-600">
              <span className="text-lg font-semibold text-slate-800">
                Drop your resume image here
              </span>
            </p>
            <p className="text-sm text-slate-400">
              or <span className="text-blue-500 font-medium hover:text-blue-600">browse files</span>
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500">JPG</span>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500">PNG</span>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500">WebP</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
