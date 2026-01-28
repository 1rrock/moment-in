"use client";
import React from "react";
import { Download, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePhotobooth, FRAME_THEMES, FILTERS } from "../photobooth-context";
import { StepIndicator } from "../step-indicator";

export const ResultStep = () => {
    const {
        setStep, photos, layout, filter, frameTheme, setFrameTheme, resetPhotos, handleDownloadWithAd
    } = usePhotobooth();

    const selectedTheme = FRAME_THEMES.find(t => t.id === frameTheme);
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}, ${String(now.getHours() % 12 || 12).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 p-6">
            <div className="max-w-md mx-auto">
                <StepIndicator />
                <div className="rounded-3xl shadow-xl p-4 mb-6" style={{ background: selectedTheme?.gradient }}>
                    <p className="text-center mb-3 font-bold text-2xl" style={{ color: selectedTheme?.textColor }}>moment in 📸</p>
                    <div className={cn("grid gap-2", layout === "4cut-vertical" ? "grid-cols-1" : "grid-cols-2")}>
                        {photos.map((p, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "overflow-hidden rounded-md",
                                    layout === "4cut-vertical" ? "aspect-[4/3]" : "aspect-[3/4]"
                                )}
                            >
                                <img
                                    src={p}
                                    className="w-full h-full object-cover"
                                    style={{ filter: FILTERS.find(f => f.id === filter)?.style || "" }}
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-center mt-3 text-xs opacity-70" style={{ color: selectedTheme?.textColor }}>{dateStr}</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
                    <div className="grid grid-cols-6 gap-2">
                        {FRAME_THEMES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setFrameTheme(t.id)}
                                className={cn("w-10 h-10 rounded-lg flex items-center justify-center", frameTheme === t.id ? "ring-2 ring-purple-500" : "")}
                                style={{ background: t.gradient }}
                            >
                                {t.icon}
                            </button>
                        ))}
                    </div>
                    <Button
                        onClick={handleDownloadWithAd}
                        className="w-full py-5 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl shadow-lg"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        다운로드
                        <Sparkles className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                        onClick={() => { resetPhotos(); setStep("landing"); }}
                        variant="outline"
                        className="w-full py-5 text-base text-gray-500 rounded-2xl border-gray-200 hover:bg-gray-50"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        다시 찍기
                    </Button>
                </div>
            </div>
        </div>
    );
};
