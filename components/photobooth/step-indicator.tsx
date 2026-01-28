"use client";
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhotobooth, STEPS } from "./photobooth-context";

export const StepIndicator = () => {
    const { step } = usePhotobooth();

    const getStepIndex = (s: string): number => {
        const stepOrder = ["camera", "layout", "filter", "capture", "result"];
        return stepOrder.indexOf(s);
    };

    const currentStepIndex = getStepIndex(step);

    return (
        <div className="bg-white rounded-3xl shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between relative">
                <div className="absolute top-6 left-6 right-6 h-1 bg-gray-100 -translate-y-1/2 z-0" />
                <div
                    className="absolute top-6 left-6 h-1 bg-gradient-to-r from-pink-500 to-purple-500 -translate-y-1/2 z-0 transition-all duration-300"
                    style={{ width: `calc(${(currentStepIndex / (STEPS.length - 1)) * 100}% - 48px)` }}
                />
                {STEPS.map((s, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                        <div key={s.id} className="flex flex-col items-center z-10">
                            <div
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all",
                                    isCompleted && "bg-gradient-to-r from-pink-500 to-purple-500 text-white",
                                    isCurrent && "bg-gradient-to-r from-pink-500 to-purple-500 text-white ring-4 ring-purple-200",
                                    !isCompleted && !isCurrent && "bg-gray-100 text-gray-400"
                                )}
                            >
                                {isCompleted ? <Check className="w-5 h-5" /> : s.icon}
                            </div>
                            <span className={cn(
                                "text-xs mt-2 font-medium",
                                (isCompleted || isCurrent) ? "text-purple-600" : "text-gray-400"
                            )}>
                                {s.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
