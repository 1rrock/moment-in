"use client";
import React from "react";
import { Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePhotobooth } from "../photobooth-context";

export const LandingStep = () => {
    const { setStep } = usePhotobooth();

    return (
        <div className="h-[100dvh] bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-sm space-y-4 flex flex-col py-4 h-full max-h-[850px]">
                <div className="text-center space-y-2 py-4">
                    <div className="w-20 h-20 mx-auto border-4 border-pink-400 rounded-3xl flex items-center justify-center bg-white/50 cursor-pointer active:scale-95 transition-transform">
                        <Camera className="w-10 h-10 text-pink-500" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                        Moment In
                    </h1>
                    <p className="text-gray-500 text-base">언제 어디서나 특별한 순간을 담아보세요</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-5 space-y-4 flex-1 flex flex-col justify-center overflow-auto max-h-[500px]">
                    <h2 className="text-lg font-bold text-center text-gray-800 flex items-center justify-center gap-2">
                        <span>📸</span> 시작하기 전에
                    </h2>

                    <div className="space-y-2">
                        <div className="bg-pink-50/50 rounded-2xl p-3 flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">1</div>
                            <div>
                                <h3 className="font-semibold text-pink-600 text-sm">카메라 권한 허용</h3>
                                <p className="text-gray-500 text-xs">"허용"을 눌러주세요.</p>
                            </div>
                        </div>
                        <div className="bg-purple-50/50 rounded-2xl p-3 flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">2</div>
                            <div>
                                <h3 className="font-semibold text-purple-600 text-sm">카메라 확인</h3>
                                <p className="text-gray-500 text-xs">작동 상태를 확인하세요.</p>
                            </div>
                        </div>
                        <div className="bg-blue-50/50 rounded-2xl p-3 flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">3</div>
                            <div>
                                <h3 className="font-semibold text-blue-600 text-sm">프레임 설정 & 촬영</h3>
                                <p className="text-gray-500 text-xs">레이아웃을 고르고 촬영하세요.</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => setStep("camera")}
                        className="w-full py-5 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl shadow-lg mt-2"
                    >
                        <Camera className="w-5 h-5 mr-2" />
                        카메라 시작하기
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
                <p className="text-center text-gray-400 text-xs mt-auto py-2">💡 충분한 조명 아래 촬영하면 더 예쁘게 나와요!</p>
            </div>
        </div>
    );
};
