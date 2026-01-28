"use client";
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { usePhotobooth } from "./photobooth-context";

interface CameraPreviewProps {
    extraFilterStyle?: string;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({ extraFilterStyle = "" }) => {
    const {
        videoRef, canvasRef, cameraError, showFlash, countdown, isStreamReady, toggleCamera
    } = usePhotobooth();

    return (
        <div className="relative rounded-3xl overflow-hidden bg-gray-900 aspect-[3/4]">
            {showFlash && <div className="absolute inset-0 z-50 bg-white animate-out fade-out duration-150" />}
            {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                    <p className="text-white text-sm">{cameraError}</p>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{
                            transform: "scaleX(-1)",
                            filter: extraFilterStyle || ""
                        }}
                    />
                    {!isStreamReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    )}
                    {countdown !== null && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 overflow-hidden">
                            <span className="text-[200px] font-bold text-white animate-in zoom-in duration-300 drop-shadow-2xl">
                                {countdown}
                            </span>
                        </div>
                    )}
                </>
            )}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button
                    onClick={toggleCamera}
                    className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                    <RefreshCw className="w-5 h-5 text-gray-700 rotate-90" />
                </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
