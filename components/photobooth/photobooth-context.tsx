"use client";
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { generateHapticFeedback, saveBase64Data } from "@apps-in-toss/web-framework";
import { useRewardedAd } from "@/hooks/use-rewarded-ad";
import { useRouter, usePathname } from "next/navigation";

export type LayoutType = "4cut" | "4cut-vertical" | "6cut";
export type FilterType = "none" | "vintage" | "bw" | "warm" | "cool" | "soft";
export type FrameTheme = "coral" | "peach" | "sunset" | "cream" | "mint" | "sage" | "rose" | "lavender" | "sky" | "ocean" | "mono" | "dark" | "blush" | "honey" | "aqua" | "violet";
export type Step = "landing" | "camera" | "layout" | "filter" | "capture" | "result";

export const FILTERS: { id: FilterType; name: string; icon: string; style: string }[] = [
    { id: "none", name: "원본", icon: "✨", style: "" },
    { id: "vintage", name: "빈티지", icon: "📷", style: "sepia(0.4) contrast(1.1) brightness(0.95)" },
    { id: "bw", name: "흑백", icon: "⚫", style: "grayscale(1) contrast(1.2)" },
    { id: "warm", name: "따뜻", icon: "🌅", style: "sepia(0.2) saturate(1.3) brightness(1.05)" },
    { id: "cool", name: "시원", icon: "❄️", style: "saturate(0.9) brightness(1.05) hue-rotate(10deg)" },
    { id: "soft", name: "부드러움", icon: "🌸", style: "contrast(0.9) brightness(1.1) saturate(0.9)" },
];

export const FRAME_THEMES: { id: FrameTheme; name: string; icon: string; gradient: string; textColor: string }[] = [
    { id: "mono", name: "모노", icon: "⬜", gradient: "#ffffff", textColor: "#000000" },
    { id: "dark", name: "다크", icon: "⬛", gradient: "#000000", textColor: "#ffffff" },
    { id: "peach", name: "피치", icon: "🍑", gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", textColor: "#e85d04" },
    { id: "coral", name: "코랄", icon: "🌺", gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", textColor: "#d63384" },
    { id: "sunset", name: "선셋", icon: "🌇", gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", textColor: "#d35400" },
    { id: "cream", name: "크림", icon: "🍦", gradient: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", textColor: "#5d6d7e" },
    { id: "mint", name: "민트", icon: "🌱", gradient: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)", textColor: "#2d6a4f" },
    { id: "sage", name: "세이지", icon: "🌿", gradient: "linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)", textColor: "#1b4332" },
    { id: "rose", name: "로즈", icon: "🌹", gradient: "linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)", textColor: "#c0392b" },
    { id: "lavender", name: "라벤더", icon: "💜", gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", textColor: "#7209b7" },
    { id: "sky", name: "스카이", icon: "☁️", gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)", textColor: "#0077b6" },
    { id: "ocean", name: "오션", icon: "🌊", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", textColor: "#003049" },
    { id: "blush", name: "블러쉬", icon: "🌸", gradient: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)", textColor: "#a0522d" },
    { id: "honey", name: "허니", icon: "🍯", gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", textColor: "#b7950b" },
    { id: "aqua", name: "아쿠아", icon: "💧", gradient: "linear-gradient(135deg, #13547a 0%, #80d0c7 100%)", textColor: "#ffffff" },
    { id: "violet", name: "바이올렛", icon: "🍆", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", textColor: "#ffffff" },
];

export const STEPS = [
    { id: "camera", name: "카메라", icon: "📹" },
    { id: "layout", name: "레이아웃", icon: "🖼️" },
    { id: "filter", name: "필터", icon: "✨" },
    { id: "capture", name: "촬영", icon: "📸" },
    { id: "result", name: "프레임", icon: "🎨" },
];

interface PhotoboothContextType {
    // State
    step: Step;
    setStep: (s: Step) => void;
    layout: LayoutType;
    setLayout: (l: LayoutType) => void;
    filter: FilterType;
    setFilter: (f: FilterType) => void;
    frameTheme: FrameTheme;
    setFrameTheme: (t: FrameTheme) => void;
    photos: string[];
    setPhotos: React.Dispatch<React.SetStateAction<string[]>>;
    isCapturing: boolean;
    countdown: number | null;
    cameraError: string | null;
    isStreamReady: boolean;
    delayTime: number;
    setDelayTime: (t: number) => void;
    isAutoCapturing: boolean;
    showFlash: boolean;
    maxPhotos: number;
    isConfirmOpen: boolean;
    setIsConfirmOpen: (b: boolean) => void;
    hasDownloaded: boolean;

    // Refs
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;

    // Functions
    toggleCamera: () => void;
    resetPhotos: () => void;
    handleManualCapture: () => void;
    handleAutoCapture: () => void;
    stopAutoCapture: () => void;
    handleDownloadWithAd: () => void;
    handleConfirmDownload: () => void;
    downloadResult: () => Promise<void>;
}

const PhotoboothContext = createContext<PhotoboothContextType | undefined>(undefined);

export const PhotoboothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [step, setStep] = useState<Step>("landing");
    const [layout, setLayout] = useState<LayoutType>("4cut");
    const [filter, setFilter] = useState<FilterType>("none");
    const [frameTheme, setFrameTheme] = useState<FrameTheme>("mono");

    const [photos, setPhotos] = useState<string[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isStreamReady, setIsStreamReady] = useState(false);
    const [delayTime, setDelayTime] = useState(5);
    const [isAutoCapturing, setIsAutoCapturing] = useState(false);
    const [showFlash, setShowFlash] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [shouldDownload, setShouldDownload] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [hasDownloaded, setHasDownloaded] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const autoCapturingRef = useRef(false);
    const autoCaptureTimerRef = useRef<NodeJS.Timeout | null>(null);

    const { showRewardAd } = useRewardedAd();
    const maxPhotos = layout === "6cut" ? 6 : 4;

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsStreamReady(false);
    }, []);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        if (streamRef.current && streamRef.current.active) {
            if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
                videoRef.current.srcObject = streamRef.current;
                try {
                    await videoRef.current.play();
                    setIsStreamReady(true);
                } catch (err) {
                    if (err instanceof Error && err.name !== "AbortError") { }
                }
            }
            return;
        }

        setIsStreamReady(false);
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.setAttribute("playsinline", "");
                videoRef.current.setAttribute("webkit-playsinline", "");
                videoRef.current.muted = true;
                videoRef.current.autoplay = true;
                videoRef.current.srcObject = stream;

                const forceReadyTimeout = setTimeout(() => {
                    if (!isStreamReady) setIsStreamReady(true);
                }, 5000);

                videoRef.current.onloadedmetadata = () => {
                    if (canvasRef.current) {
                        canvasRef.current.width = videoRef.current!.videoWidth;
                        canvasRef.current.height = videoRef.current!.videoHeight;
                    }
                    videoRef.current!.play().catch(() => { });
                };
                videoRef.current.onplaying = () => {
                    clearTimeout(forceReadyTimeout);
                    setIsStreamReady(true);
                };
            }
        } catch (err) {
            if (err instanceof Error) {
                if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                    setCameraError("카메라 권한이 거부되었습니다.");
                } else {
                    setCameraError(`카메라 오류: ${err.message}`);
                }
            }
        }
    }, [facingMode]);

    useEffect(() => {
        const pathMap: Record<string, Step> = {
            "/": "landing",
            "/camera": "camera",
            "/layout-selection": "layout",
            "/filter": "filter",
            "/capture": "capture",
            "/result": "result",
        };
        const cleanPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
        const currentStep = pathMap[cleanPath] || "landing";
        if (currentStep !== step) {
            setStep(currentStep);
        }

        const titleMap: Record<string, string> = {
            "/": "모먼트인",
            "/camera": "카메라 확인",
            "/layout-selection": "레이아웃 선택",
            "/filter": "필터 선택",
            "/capture": "촬영하기",
            "/result": "결과 확인",
        };
        if (titleMap[pathname]) {
            document.title = titleMap[pathname];
        }
    }, [pathname, step]);

    const navigateToStep = useCallback((s: Step) => {
        const pathMap: Record<Step, string> = {
            "landing": "/",
            "camera": "/camera",
            "layout": "/layout-selection",
            "filter": "/filter",
            "capture": "/capture",
            "result": "/result",
        };
        router.push(pathMap[s]);
    }, [router]);

    // Override setStep to use navigation
    const setStepWithNavigation = useCallback((s: Step) => {
        navigateToStep(s);
    }, [navigateToStep]);

    useEffect(() => {
        if (["camera", "layout", "filter", "capture"].includes(step)) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [step, startCamera, stopCamera]);

    const toggleCamera = useCallback(() => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    }, []);

    const stopAutoCapture = useCallback(() => {
        autoCapturingRef.current = false;
        setIsAutoCapturing(false);
        setIsCapturing(false);
        setCountdown(null);
        if (autoCaptureTimerRef.current) {
            clearInterval(autoCaptureTimerRef.current);
            clearTimeout(autoCaptureTimerRef.current);
            autoCaptureTimerRef.current = null;
        }
    }, []);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !isStreamReady) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        try {
            canvasRef.current.width = videoRef.current.videoWidth || 640;
            canvasRef.current.height = videoRef.current.videoHeight || 480;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.save();
            ctx.translate(canvasRef.current.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.restore();
            const photoData = canvasRef.current.toDataURL("image/png");
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 150);
            generateHapticFeedback({ type: "success" }).catch(() => { });
            setPhotos((prev) => [...prev, photoData]);
        } catch (err) { }
    }, [isStreamReady]);

    const startCountdown = useCallback((onComplete: () => void) => {
        setIsCapturing(true);
        setCountdown(delayTime);
        let currentCount = delayTime;
        const timer = setInterval(() => {
            currentCount -= 1;
            if (currentCount <= 0) {
                clearInterval(timer);
                setCountdown(null);
                setIsCapturing(false);
                onComplete();
            } else {
                setCountdown(currentCount);
            }
        }, 1000);
        return timer;
    }, [delayTime]);

    const handleManualCapture = useCallback(() => {
        if (isCapturing || photos.length >= maxPhotos || isAutoCapturing) return;
        startCountdown(capturePhoto);
    }, [isCapturing, photos.length, maxPhotos, isAutoCapturing, startCountdown, capturePhoto]);

    const handleAutoCapture = useCallback(() => {
        if (isAutoCapturing || photos.length >= maxPhotos) return;
        setIsAutoCapturing(true);
        autoCapturingRef.current = true;
        const captureNext = (currentPhotos: number) => {
            if (!autoCapturingRef.current || currentPhotos >= maxPhotos) {
                setIsAutoCapturing(false);
                autoCapturingRef.current = false;
                return;
            }
            setIsCapturing(true);
            setCountdown(delayTime);
            let currentCount = delayTime;
            const timer = setInterval(() => {
                if (!autoCapturingRef.current) { clearInterval(timer); return; }
                currentCount -= 1;
                if (currentCount <= 0) {
                    clearInterval(timer);
                    setCountdown(null);
                    setIsCapturing(false);
                    if (videoRef.current && canvasRef.current && isStreamReady) {
                        const ctx = canvasRef.current.getContext("2d");
                        if (ctx) {
                            canvasRef.current.width = videoRef.current.videoWidth || 640;
                            canvasRef.current.height = videoRef.current.videoHeight || 480;
                            ctx.save();
                            ctx.translate(canvasRef.current.width, 0);
                            ctx.scale(-1, 1);
                            ctx.drawImage(videoRef.current, 0, 0);
                            ctx.restore();
                            const photoData = canvasRef.current.toDataURL("image/png");
                            setPhotos((prev) => {
                                const newPhotos = [...prev, photoData];
                                if (autoCapturingRef.current) {
                                    autoCaptureTimerRef.current = setTimeout(() => captureNext(newPhotos.length), 800);
                                }
                                return newPhotos;
                            });
                        }
                    }
                } else {
                    setCountdown(currentCount);
                }
            }, 1000);
        };
        captureNext(photos.length);
    }, [isAutoCapturing, photos.length, maxPhotos, delayTime, isStreamReady]);

    const resetPhotos = useCallback(() => {
        setPhotos([]);
        setHasDownloaded(false);
        stopAutoCapture();
    }, [stopAutoCapture]);

    useEffect(() => {
        if (photos.length >= maxPhotos && step === "capture") {
            // 소리나 피드백이 끝날 시간을 잠시 준 뒤 이동
            const timer = setTimeout(() => {
                stopAutoCapture();
                navigateToStep("result");
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [photos.length, step, stopAutoCapture, navigateToStep, maxPhotos]);

    const downloadResult = useCallback(async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const isVertical = layout === "4cut-vertical";
        if (isVertical) {
            canvas.width = 1375;
            canvas.height = 4096;
        } else {
            canvas.width = 1500;
            canvas.height = 2250;
        }

        const photoWidth = isVertical ? 1244 : 673;
        const photoHeight = isVertical ? 904 : 926;
        const gap = 23;
        
        const horizontalPadding = (canvas.width - (isVertical ? photoWidth : (photoWidth * 2 + gap))) / 2;
        
        const totalPhotosHeight = isVertical 
            ? (photoHeight * 4) + (gap * 3) 
            : (photoHeight * 2) + gap;
        
        const verticalSpace = canvas.height - totalPhotosHeight;
        const topAreaHeight = verticalSpace * 0.65;
        const bottomAreaHeight = verticalSpace * 0.35;
        const startY = topAreaHeight;

        const theme = FRAME_THEMES.find((t) => t.id === frameTheme);
        if (theme?.gradient.startsWith('linear-gradient')) {
            const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
            const colors = theme.gradient.match(/#[a-fA-F0-9]{6}/g);
            if (colors && colors.length >= 2) {
                g.addColorStop(0, colors[0]);
                g.addColorStop(1, colors[1]);
            } else {
                g.addColorStop(0, "#ffffff");
                g.addColorStop(1, "#f0f0f0");
            }
            ctx.fillStyle = g;
        } else {
            ctx.fillStyle = theme?.gradient || "#ffffff";
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const filterStyle = FILTERS.find((f) => f.id === filter)?.style || "";
        const loadPromises = photos.map((photo, index) => {
            return new Promise<void>((resolve) => {
                const img = new window.Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    let col, row;
                    if (isVertical) {
                        col = 0;
                        row = index;
                    } else {
                        col = index % 2;
                        row = Math.floor(index / 2);
                    }
                    
                    const x = horizontalPadding + col * (photoWidth + gap);
                    const y = startY + row * (photoHeight + gap);
                    
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(x, y, photoWidth, photoHeight);
                    ctx.clip();
                    
                    if (filterStyle) ctx.filter = filterStyle;
                    
                    const imgRatio = img.width / img.height;
                    const targetRatio = photoWidth / photoHeight;
                    let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
                    
                    if (imgRatio > targetRatio) {
                        sWidth = img.height * targetRatio;
                        sx = (img.width - sWidth) / 2;
                    } else {
                        sHeight = img.width / targetRatio;
                        sy = (img.height - sHeight) / 2;
                    }
                    
                    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, photoWidth, photoHeight);
                    ctx.restore();
                    resolve();
                };
                img.src = photo;
            });
        });

        try {
            await Promise.all(loadPromises);
            
            ctx.fillStyle = theme?.textColor || "#000000";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "500 66px 'Pretendard Variable', 'Pretendard', sans-serif";
            ctx.fillText("moment in 📸", canvas.width / 2, topAreaHeight / 2);

            const now = new Date();
            const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}, ${String(now.getHours() % 12 || 12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? "PM" : "AM"}`;
            ctx.font = "500 33px 'Pretendard Variable', 'Pretendard', sans-serif";
            const dateY = startY + totalPhotosHeight + (bottomAreaHeight / 2);
            ctx.fillText(dateStr, canvas.width / 2, dateY);

            const dataUrl = canvas.toDataURL("image/png", 1.0);
            const base64Data = dataUrl.split(",")[1];

            try {
                await saveBase64Data({ data: base64Data, fileName: `moment-in-${Date.now()}.png`, mimeType: "image/png" });
                generateHapticFeedback({ type: "success" }).catch(() => { });
            } catch {
                const link = document.createElement("a");
                link.download = `moment-in-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
            }
            setHasDownloaded(true);
        } catch { }
    }, [photos, layout, filter, frameTheme]);

    useEffect(() => {
        if (shouldDownload) {
            setShouldDownload(false);
            downloadResult();
        }
    }, [shouldDownload, downloadResult]);

    const handleDownloadWithAd = useCallback(() => {
        if (hasDownloaded) {
            downloadResult();
            return;
        }
        setIsConfirmOpen(true);
    }, [hasDownloaded, downloadResult]);

    const handleConfirmDownload = useCallback(() => {
        setIsConfirmOpen(false);
        showRewardAd({
            onRewarded: () => setTimeout(() => setShouldDownload(true), 1000),
            onDismiss: () => { }
        });
    }, [showRewardAd]);

    return (
        <PhotoboothContext.Provider value={{
            step, setStep: setStepWithNavigation, layout, setLayout, filter, setFilter, frameTheme, setFrameTheme,
            photos, setPhotos, isCapturing, countdown, cameraError, isStreamReady,
            delayTime, setDelayTime, isAutoCapturing, showFlash, maxPhotos,
            isConfirmOpen, setIsConfirmOpen, hasDownloaded, videoRef, canvasRef,
            toggleCamera, resetPhotos, handleManualCapture, handleAutoCapture,
            stopAutoCapture, handleDownloadWithAd, handleConfirmDownload, downloadResult
        }}>
            {children}
        </PhotoboothContext.Provider>
    );
};

export const usePhotobooth = () => {
    const context = useContext(PhotoboothContext);
    if (!context) throw new Error("usePhotobooth must be used within a PhotoboothProvider");
    return context;
};
