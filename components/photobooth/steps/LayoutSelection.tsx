"use client";
import React from "react";
import { LayoutGrid, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePhotobooth } from "../photobooth-context";
import { StepIndicator } from "../step-indicator";
import { CameraPreview } from "../camera-preview";

export const LayoutSelectionStep = () => {
    const { setStep, layout, setLayout } = usePhotobooth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 p-6">
            <div className="max-w-5xl mx-auto">
                <StepIndicator />
                <div className="flex items-center justify-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">레이아웃 선택</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl shadow-xl p-4 relative">
                        <CameraPreview />
                    </div>
                    <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-purple-600" />
                            <h3 className="font-bold text-gray-800">레이아웃 선택</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setLayout("4cut")}
                                className={cn(
                                    "p-6 rounded-2xl border-2 transition-all",
                                    layout === "4cut" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <div className="grid grid-cols-2 gap-1.5 mb-4 mx-auto w-fit">
                                    {[1, 2, 3, 4].map((i) => (<div key={i} className="w-8 h-10 bg-pink-200 rounded" />))}
                                </div>
                                <p className="font-bold text-gray-800">4컷</p>
                            </button>
                            <button
                                onClick={() => setLayout("4cut-vertical")}
                                className={cn(
                                    "p-6 rounded-2xl border-2 transition-all",
                                    layout === "4cut-vertical" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <div className="flex flex-col gap-1 mb-4 mx-auto w-fit">
                                    {[1, 2, 3, 4].map((i) => (<div key={i} className="w-12 h-5 bg-blue-200 rounded" />))}
                                </div>
                                <p className="font-bold text-gray-800">4컷 (세로)</p>
                            </button>
                        </div>
                        <Button
                            onClick={() => setStep("filter")}
                            className="w-full py-5 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl shadow-lg"
                        >
                            필터 선택하기
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
