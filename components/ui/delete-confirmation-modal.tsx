"use client";

import React from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string | React.ReactNode;
  message?: string | React.ReactNode;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  message = "Are you sure you want to delete this item?",
  itemName,
  confirmText = "Delete",
  cancelText = "Cancel",
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4 transition-all duration-300 animate-in fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 transform transition-all duration-300 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {message}
              {itemName && (
                <span className="font-semibold text-slate-900">
                  {" "}
                  &ldquo;{itemName}&rdquo;
                </span>
              )}
              <span className="block mt-1 text-red-500 font-medium">This action cannot be undone.</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-50/50 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 justify-end border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 h-11 px-6 rounded-xl font-semibold transition-all shadow-sm sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white h-11 px-8 rounded-xl font-semibold transition-all shadow-md shadow-red-200 sm:w-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
