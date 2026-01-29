"use client";
import React from "react";
import { Download, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePhotobooth, FRAME_THEMES, FILTERS } from "../photobooth-context";
import { StepIndicator } from "../step-indicator";

export const ResultStep = () => {
    const {
        setStep, photos, layout, filter, frameTheme, setFrameTheme, resetPhotos, handleDownloadWithAd, hasDownloaded
    } = usePhotobooth();

    const selectedTheme = FRAME_THEMES.find(t => t.id === frameTheme);
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}, ${String(now.getHours() % 12 || 12).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;

    const isVertical = layout === "4cut-vertical";

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 p-6">
            <div className="max-w-md mx-auto">
                <StepIndicator />
                <div className="w-full h-full flex items-center justify-center p-4">
                    <div
                        className={cn(
                            "shadow-2xl transition-all duration-300 flex flex-col items-center relative",
                            isVertical ? "aspect-[1375/4096] h-[60vh]" : "aspect-[2/3] w-full max-w-[340px]"
                        )}
                        style={{ background: selectedTheme?.gradient }}
                    >
                        {/* Top Area - Title */}
                        <div className="w-full h-[12%] flex items-center justify-center">
                            <p className="font-medium tracking-tight whitespace-nowrap"
                                style={{
                                    color: selectedTheme?.textColor,
                                    fontSize: isVertical ? "1.0rem" : "1.2rem",
                                    fontFamily: "Pretendard Variable, sans-serif"
                                }}>
                                moment in 📸
                            </p>
                        </div>

                        {/* Photo Grid Area */}
                        <div className="flex-1 w-full px-[6%] flex flex-col">
                            <div className={cn(
                                "grid w-full h-full",
                                isVertical ? "grid-cols-1 gap-[1.5%]" : "grid-cols-2 gap-[2%]"
                            )}>
                                {photos.map((p, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "overflow-hidden bg-gray-50 w-full h-full",
                                            "relative"
                                        )}
                                    >
                                        <img
                                            src={p}
                                            className="w-full h-full object-cover absolute inset-0"
                                            style={{ filter: FILTERS.find(f => f.id === filter)?.style || "" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Area - Date */}
                        <div className="w-full h-[8%] flex items-center justify-center">
                            <p className="font-medium opacity-80"
                                style={{
                                    color: selectedTheme?.textColor,
                                    fontSize: isVertical ? "0.6rem" : "0.7rem",
                                    fontFamily: "Pretendard Variable, sans-serif"
                                }}>
                                {dateStr}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <h3 className="font-bold text-gray-800">프레임 테마</h3>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-1">
                            {FRAME_THEMES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setFrameTheme(t.id)}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-1 transition-all",
                                        frameTheme === t.id ? "scale-105" : "hover:scale-105"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all",
                                            frameTheme === t.id ? "ring-2 ring-purple-500 ring-offset-2" : "ring-1 ring-gray-100"
                                        )}
                                        style={{ background: t.gradient }}
                                    >
                                        {t.icon}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-medium transition-colors",
                                        frameTheme === t.id ? "text-purple-600 font-bold" : "text-gray-400"
                                    )}>
                                        {t.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleDownloadWithAd}
                        className="w-full py-6 text-lg font-bold transition-all rounded-2xl shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        사진 다운로드
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
