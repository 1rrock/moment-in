"use client";
import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePhotobooth, FILTERS } from "../photobooth-context";
import { StepIndicator } from "../step-indicator";
import { CameraPreview } from "../camera-preview";

export const FilterSelectionStep = () => {
    const { setStep, filter, setFilter } = usePhotobooth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 p-6">
            <div className="max-w-5xl mx-auto">
                <StepIndicator />
                <div className="flex items-center justify-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">필터 선택</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl shadow-xl p-4 relative">
                        <CameraPreview extraFilterStyle={FILTERS.find((f) => f.id === filter)?.style} />
                    </div>
                    <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            <h3 className="font-bold text-gray-800">필터 선택</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {FILTERS.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                        filter === f.id ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <span className="text-2xl">{f.icon}</span>
                                    <span className="text-sm">{f.name}</span>
                                </button>
                            ))}
                        </div>
                        <Button
                            onClick={() => setStep("capture")}
                            className="w-full py-5 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl shadow-lg"
                        >
                            촬영 시작하기
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
