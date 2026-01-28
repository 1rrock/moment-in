"use client";
import React from "react";
import { Camera, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePhotobooth, FILTERS } from "../photobooth-context";
import { StepIndicator } from "../step-indicator";
import { CameraPreview } from "../camera-preview";
import { PhotoGrid } from "../photo-grid";

export const CaptureStep = () => {
    const {
        setStep, photos, maxPhotos, filter, handleManualCapture, handleAutoCapture,
        isCapturing, isStreamReady, isAutoCapturing, stopAutoCapture, delayTime, setDelayTime
    } = usePhotobooth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 p-6">
            <div className="max-w-5xl mx-auto">
                <StepIndicator />
                <div className="flex items-center justify-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">촬영 ({photos.length}/{maxPhotos})</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <CameraPreview extraFilterStyle={FILTERS.find((f) => f.id === filter)?.style} />
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={handleManualCapture}
                                disabled={isCapturing || !isStreamReady || photos.length >= maxPhotos || isAutoCapturing}
                                className="py-5 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl shadow-lg transition-all font-bold"
                            >
                                <Camera className="w-5 h-5 mr-2" />
                                수동 촬영
                            </Button>
                            <Button
                                onClick={isAutoCapturing ? stopAutoCapture : handleAutoCapture}
                                disabled={(!isAutoCapturing && (isCapturing || photos.length >= maxPhotos)) || !isStreamReady}
                                className={cn(
                                    "py-5 text-base rounded-2xl shadow-lg transition-all font-bold text-white",
                                    isAutoCapturing
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                                )}
                            >
                                {isAutoCapturing ? "중지" : (
                                    <>
                                        <Play className="w-5 h-5 mr-2" />
                                        자동 촬영
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-gray-500 text-sm">대기시간:</span>
                            {[3, 5, 7].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setDelayTime(t)}
                                    className={cn("px-4 py-2 rounded-full text-sm", delayTime === t ? "bg-purple-500 text-white" : "bg-gray-100")}
                                >
                                    {t}초
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl shadow-xl p-6">
                        <h3 className="font-bold mb-4">내 갤러리</h3>
                        <PhotoGrid showNumbers />
                    </div>
                </div>
            </div>
        </div>
    );
};
