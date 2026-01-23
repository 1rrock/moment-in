"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmText = "예",
    cancelText = "아니오",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div
                className="w-full max-w-[320px] bg-white rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                style={{ boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
            >
                <div className="space-y-2 mb-8">
                    <h3 className="text-[20px] font-bold text-[#1a1f27] leading-tight whitespace-pre-wrap">
                        {title}
                    </h3>
                    <p className="text-[15px] text-[#4e5968] leading-relaxed whitespace-pre-wrap">
                        {description}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-4 px-4 rounded-[16px] bg-[#f2f4f6] text-[#4e5968] font-bold text-[16px] active:scale-[0.98] transition-all hover:bg-[#e5e8eb]"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-4 px-4 rounded-[16px] bg-[#3182f6] text-white font-bold text-[16px] active:scale-[0.98] transition-all hover:bg-[#1b64da]"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
