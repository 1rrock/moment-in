"use client";
import React from "react";
import { Check, Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePhotobooth } from "../photobooth-context";
import { StepIndicator } from "../step-indicator";
import { CameraPreview } from "../camera-preview";

export const CameraCheckStep = () => {
    const { setStep, isStreamReady } = usePhotobooth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 p-6">
            <div className="max-w-4xl mx-auto">
                <StepIndicator />
                <div className="flex items-center justify-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">카메라 확인</h2>
                </div>
                <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
                    <CameraPreview />
                    <p className="text-center text-gray-500 text-sm">카메라가 정상적으로 작동하는지 확인하세요</p>
                    <div className={cn("rounded-2xl p-4 flex items-center gap-3", isStreamReady ? "bg-green-50" : "bg-yellow-50")}>
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isStreamReady ? "bg-green-100" : "bg-yellow-100")}>
                            {isStreamReady ? <Check className="w-5 h-5 text-green-600" /> : <Camera className="w-5 h-5 text-yellow-600" />}
                        </div>
                        <div>
                            <h3 className={cn("font-semibold", isStreamReady ? "text-green-700" : "text-yellow-700")}>
                                {isStreamReady ? "카메라 연결됨" : "카메라 연결 중..."}
                            </h3>
                            <p className={cn("text-sm", isStreamReady ? "text-green-600" : "text-yellow-600")}>
                                {isStreamReady ? "화면에 자신이 보이면 정상입니다" : "잠시만 기다려주세요"}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setStep("layout")}
                        disabled={!isStreamReady}
                        className="w-full py-5 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl shadow-lg disabled:opacity-50"
                    >
                        레이아웃 선택하기
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
