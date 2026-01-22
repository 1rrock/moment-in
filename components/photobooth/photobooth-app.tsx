"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  openCamera,
  generateHapticFeedback,
  saveBase64Data,
} from "@apps-in-toss/web-framework";
import {
  Camera,
  RefreshCw,
  Sparkles,
  Download,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Check,
  LayoutGrid,
  Play,
  ImageIcon,
  PartyPopper,
  CameraIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LayoutType = "4cut" | "4cut-vertical" | "6cut";
type FilterType = "none" | "vintage" | "bw" | "warm" | "cool" | "soft";
type FrameTheme = "coral" | "peach" | "sunset" | "cream" | "mint" | "sage" | "rose" | "lavender" | "sky" | "ocean" | "mono" | "dark";
type Step = "landing" | "camera" | "layout" | "filter" | "capture" | "result";

const FILTERS: { id: FilterType; name: string; icon: string; style: string }[] = [
  { id: "none", name: "원본", icon: "✨", style: "" },
  { id: "vintage", name: "빈티지", icon: "📷", style: "sepia(0.4) contrast(1.1) brightness(0.95)" },
  { id: "bw", name: "흑백", icon: "⚫", style: "grayscale(1) contrast(1.2)" },
  { id: "warm", name: "따뜻", icon: "🌅", style: "sepia(0.2) saturate(1.3) brightness(1.05)" },
  { id: "cool", name: "시원", icon: "❄️", style: "saturate(0.9) brightness(1.05) hue-rotate(10deg)" },
  { id: "soft", name: "부드러움", icon: "🌸", style: "contrast(0.9) brightness(1.1) saturate(0.9)" },
];

const FRAME_THEMES: { id: FrameTheme; name: string; icon: string; gradient: string; textColor: string }[] = [
  { id: "coral", name: "코랄", icon: "🌺", gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", textColor: "#d63384" },
  { id: "peach", name: "피치", icon: "🍑", gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", textColor: "#e85d04" },
  { id: "sunset", name: "선셋", icon: "🌇", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", textColor: "#d00000" },
  { id: "cream", name: "크림", icon: "🍦", gradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)", textColor: "#6c757d" },
  { id: "mint", name: "민트", icon: "🌱", gradient: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)", textColor: "#2d6a4f" },
  { id: "sage", name: "세이지", icon: "🌿", gradient: "linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)", textColor: "#40916c" },
  { id: "rose", name: "로즈", icon: "🌹", gradient: "linear-gradient(135deg, #ffc3a0 0%, #ffafbd 100%)", textColor: "#c9184a" },
  { id: "lavender", name: "라벤더", icon: "💜", gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", textColor: "#7209b7" },
  { id: "sky", name: "스카이", icon: "☁️", gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)", textColor: "#0077b6" },
  { id: "ocean", name: "오션", icon: "🌊", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", textColor: "#ffffff" },
  { id: "mono", name: "모노", icon: "⬜", gradient: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)", textColor: "#424242" },
  { id: "dark", name: "다크", icon: "⬛", gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)", textColor: "#ffffff" },
];

const STEPS = [
  { id: "camera", name: "카메라", icon: "📹" },
  { id: "layout", name: "레이아웃", icon: "🖼️" },
  { id: "filter", name: "필터", icon: "✨" },
  { id: "capture", name: "촬영", icon: "📸" },
  { id: "result", name: "완료", icon: "🎉" },
];

const DebugOverlay = ({ logs, onClose }: { logs: string[], onClose: () => void }) => (
  <div className="fixed inset-0 z-[9999] bg-black/90 text-green-400 p-4 font-mono text-xs overflow-auto flex flex-col">
    <div className="flex justify-between items-center mb-4 border-b border-green-400 pb-2">
      <h3 className="text-lg font-bold">Terminal Logs</h3>
      <button onClick={onClose} className="px-3 py-1 bg-green-400 text-black rounded font-bold">CLOSE</button>
    </div>
    <div className="flex-1 space-y-1">
      {logs.length === 0 ? (
        <p className="text-gray-500 italic">No logs yet...</p>
      ) : (
        logs.map((log, i) => <div key={i}>{log}</div>)
      )}
    </div>
  </div>
);

export default function PhotoboothApp() {
  const [step, setStep] = useState<Step>("landing");
  const [layout, setLayout] = useState<LayoutType>("4cut");
  const [filter, setFilter] = useState<FilterType>("none");
  const [frameTheme, setFrameTheme] = useState<FrameTheme>("peach");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<"prompt" | "granted" | "denied">("prompt");
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [delayTime, setDelayTime] = useState(5);
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const autoCapturingRef = useRef(false);
  const autoCaptureTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-30), `[${timestamp}] ${msg}`]);
    console.log(`[DEBUG] ${msg}`);
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const maxPhotos = 4;

  const startCamera = useCallback(async () => {
    setCameraError(null);
    addLog("카메라 시작 시도...");

    if (!navigator.mediaDevices) {
      addLog("오류: navigator.mediaDevices가 존재하지 않음");
    } else if (!navigator.mediaDevices.getUserMedia) {
      addLog("오류: getUserMedia가 존재하지 않음");
    }

    // If stream already exists and is active, just attach to video
    if (streamRef.current && streamRef.current.active) {
      addLog("기존 활성 스트림 사용 중...");
      if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        try {
          await videoRef.current.play();
          setIsStreamReady(true);
          addLog("기존 비디오 재생 성공");
        } catch (err) {
          if (err instanceof Error && err.name !== "AbortError") {
            addLog(`비디오 재생 오류: ${err.message}`);
            console.error("Video play error:", err);
          }
        }
      }
      return;
    }

    setIsStreamReady(false);

    try {
      if (streamRef.current) {
        addLog("기존 스트림 중지 중...");
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      addLog(`getUserMedia 호출 중... (모드: ${facingMode})`);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      addLog("스트림 획득 성공!");
      streamRef.current = stream;
      setCameraPermission("granted");

      if (videoRef.current) {
        addLog("비디오 요소 설정 중...");
        const video = videoRef.current;

        // 속성 설정 (srcObject 지정 전 수행)
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.muted = true;
        video.autoplay = true;

        video.srcObject = stream;

        // 5초 안전장치
        const forceReadyTimeout = setTimeout(() => {
          if (!isStreamReady) {
            addLog("안전장치: 5초 경과로 강제 준비 완료 처리");
            setIsStreamReady(true);
          }
        }, 5000);

        video.onloadedmetadata = () => {
          addLog(`비디오 메타데이터 로드: ${video.videoWidth}x${video.videoHeight}`);
          // 캔버스 크기 미리 설정
          if (canvasRef.current) {
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
          }
          video.play().catch(e => addLog(`Play 실패: ${e.message}`));
        };

        video.onplaying = () => {
          addLog("비디오 재생 시작됨 (playing)");
          clearTimeout(forceReadyTimeout);
          setIsStreamReady(true);
        };

        video.oncanplay = () => {
          addLog("비디오 재성 가능상태 (canplay)");
        };
      } else {
        addLog("오류: videoRef.current가 존재하지 않음");
      }
    } catch (err) {
      if (err instanceof Error) {
        addLog(`getUserMedia 실패: ${err.name} - ${err.message}`);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraPermission("denied");
          setCameraError("카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.");
        } else if (err.name === "NotFoundError") {
          setCameraError("카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.");
        } else if (err.name === "NotReadableError") {
          setCameraError("카메라가 다른 앱에서 사용 중입니다.");
        } else {
          setCameraError(`카메라 오류: ${err.message}`);
        }
      }
    }
  }, [addLog, facingMode]);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreamReady(false);
  }, []);

  useEffect(() => {
    if (step === "camera" || step === "layout" || step === "filter" || step === "capture") {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [step, startCamera, stopCamera, facingMode]);

  useEffect(() => {
    if (photos.length >= maxPhotos && step === "capture") {
      addLog("모든 사진 촬영 완료. 결과 화면으로 이동합니다.");
      stopAutoCapture();
      setStep("result");
    }
  }, [photos.length, maxPhotos, step, addLog]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreamReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      addLog("오류: 캔버스 컨텍스트를 획득할 수 없음");
      return;
    }

    try {
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;

      addLog(`캡처 시도 해상도: ${vWidth}x${vHeight}`);

      if (vWidth === 0 || vHeight === 0) {
        addLog("경고: 비디오 크기가 0입니다. 기본 해상도(640x480)로 시도합니다.");
        canvas.width = 640;
        canvas.height = 480;
      } else {
        canvas.width = vWidth;
        canvas.height = vHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const photoData = canvas.toDataURL("image/png");

      if (photoData === "data:," || photoData.length < 100) {
        addLog("오류: 캡처된 데이터가 비어있습니다. (iOS 전체화면 이슈 가능성)");
        throw new Error("Empty image data received");
      }

      // 플래시 효과
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 150);

      // 햅틱 피드백
      generateHapticFeedback({ type: "success" }).catch(() => { });

      addLog(`캡처 성공: ${Math.round(photoData.length / 1024)}KB`);
      setPhotos((prev) => [...prev, photoData]);
    } catch (err) {
      addLog(`캡처 실패: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [isStreamReady, addLog, photos.length]);

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
        // 중지 체크
        if (!autoCapturingRef.current) {
          clearInterval(timer);
          return;
        }

        currentCount -= 1;
        if (currentCount <= 0) {
          clearInterval(timer);
          setCountdown(null);
          setIsCapturing(false);

          if (videoRef.current && canvasRef.current && isStreamReady) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            if (ctx) {
              try {
                addLog(`자동 촬영 캡처 (${currentPhotos + 1}/${maxPhotos})`);
                const vWidth = video.videoWidth || 640;
                const vHeight = video.videoHeight || 480;
                canvas.width = vWidth;
                canvas.height = vHeight;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, vWidth, vHeight, 0, 0, canvas.width, canvas.height);
                ctx.restore();

                const photoData = canvas.toDataURL("image/png");

                if (photoData === "data:," || photoData.length < 100) {
                  addLog("자동 촬영 실패: 빈 데이터");
                } else {
                  setPhotos((prev) => {
                    const newPhotos = [...prev, photoData];
                    addLog(`저장 성공 (${newPhotos.length}/${maxPhotos})`);

                    // 다음 촬영 예약 전 중지 여부 재확인
                    if (autoCapturingRef.current) {
                      const nextTimer = setTimeout(() => captureNext(newPhotos.length), 800);
                      autoCaptureTimerRef.current = nextTimer;
                    }
                    return newPhotos;
                  });
                }
              } catch (err) {
                addLog(`자동 촬영 중 오류: ${err instanceof Error ? err.message : String(err)}`);
                setIsAutoCapturing(false);
                autoCapturingRef.current = false;
              }
            }
          }
        } else {
          setCountdown(currentCount);
        }
      }, 1000);
      autoCaptureTimerRef.current = timer;
    };

    captureNext(photos.length);
  }, [isAutoCapturing, photos.length, maxPhotos, delayTime, isStreamReady]);

  const stopAutoCapture = useCallback(() => {
    addLog("자동 촬영 중단 요청");
    autoCapturingRef.current = false;
    setIsAutoCapturing(false);
    setIsCapturing(false);
    setCountdown(null);

    if (autoCaptureTimerRef.current) {
      clearInterval(autoCaptureTimerRef.current);
      clearTimeout(autoCaptureTimerRef.current);
      autoCaptureTimerRef.current = null;
    }
  }, [addLog]);

  const resetPhotos = () => {
    setPhotos([]);
    stopAutoCapture();
  };

  const downloadResult = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 30;
    const photoWidth = 280;
    const photoHeight = 360;
    const gap = 12;
    const topPadding = 60;
    const bottomPadding = 50;

    if (layout === "4cut") {
      canvas.width = photoWidth * 2 + gap + padding * 2;
      canvas.height = photoHeight * 2 + gap + padding * 2 + topPadding + bottomPadding;
    } else {
      canvas.width = photoWidth * 2 + gap + padding * 2;
      canvas.height = photoHeight * 3 + gap * 2 + padding * 2 + topPadding + bottomPadding;
    }

    const theme = FRAME_THEMES.find((t) => t.id === frameTheme);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

    if (frameTheme === "dark") {
      gradient.addColorStop(0, "#434343");
      gradient.addColorStop(1, "#000000");
    } else if (frameTheme === "ocean") {
      gradient.addColorStop(0, "#667eea");
      gradient.addColorStop(1, "#764ba2");
    } else if (frameTheme === "peach") {
      gradient.addColorStop(0, "#ffecd2");
      gradient.addColorStop(1, "#fcb69f");
    } else if (frameTheme === "coral") {
      gradient.addColorStop(0, "#ff9a9e");
      gradient.addColorStop(1, "#fecfef");
    } else if (frameTheme === "mint") {
      gradient.addColorStop(0, "#d4fc79");
      gradient.addColorStop(1, "#96e6a1");
    } else if (frameTheme === "lavender") {
      gradient.addColorStop(0, "#e0c3fc");
      gradient.addColorStop(1, "#8ec5fc");
    } else if (frameTheme === "sky") {
      gradient.addColorStop(0, "#a1c4fd");
      gradient.addColorStop(1, "#c2e9fb");
    } else {
      gradient.addColorStop(0, "#ffecd2");
      gradient.addColorStop(1, "#fcb69f");
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const filterStyle = FILTERS.find((f) => f.id === filter)?.style || "";

    const loadPromises = photos.map((photo, index) => {
      return new Promise<void>((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const col = index % 2;
          const row = Math.floor(index / 2);
          const x = padding + col * (photoWidth + gap);
          const y = padding + topPadding + row * (photoHeight + gap);

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, y, photoWidth, photoHeight, 6);
          ctx.clip();

          if (filterStyle) {
            ctx.filter = filterStyle;
          }

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

    Promise.all(loadPromises).then(async () => {
      ctx.fillStyle = theme?.textColor || "#e85d04";
      ctx.textAlign = "center";

      // Top logo
      ctx.font = "bold 28px 'Geist', sans-serif";
      ctx.fillText("Moment In", canvas.width / 2, padding + 35);

      // Bottom date
      const now = new Date();
      const dateStr = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;
      ctx.font = "500 16px 'Geist', sans-serif";
      ctx.fillText(dateStr, canvas.width / 2, canvas.height - 20);

      try {
        addLog("이미지 데이터 저장 시작 (saveBase64Data)");
        const dataUrl = canvas.toDataURL("image/png");
        const base64Data = dataUrl.split(",")[1];

        await saveBase64Data({
          data: base64Data,
          fileName: `moment-in-${Date.now()}.png`,
          mimeType: "image/png"
        });

        addLog("이미지 저장 성공!");
        generateHapticFeedback({ type: "success" }).catch(() => { });
      } catch (err) {
        addLog(`저장 실패: ${err instanceof Error ? err.message : String(err)}`);
        // 폴백: 일반 브라우저용 다운로드
        const link = document.createElement("a");
        link.download = `moment-in-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    });
  };

  const getStepIndex = (s: Step): number => {
    const stepOrder: Step[] = ["camera", "layout", "filter", "capture", "result"];
    return stepOrder.indexOf(s);
  };

  const currentStepIndex = getStepIndex(step);

  const StepIndicator = () => (
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

  // 공통 카메라 프리뷰 렌더러 함수
  const renderCameraPreview = (extraFilterStyle: string = "") => (
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
              filter: extraFilterStyle || FILTERS.find((f) => f.id === filter)?.style || ""
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

  const PhotoGrid = ({ showNumbers = false }: { showNumbers?: boolean }) => {
    const isVertical = layout === "4cut-vertical";

    return (
      <div className={cn(
        "grid gap-2",
        isVertical ? "grid-cols-1" : "grid-cols-2"
      )}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "bg-gray-100 rounded-lg overflow-hidden relative",
              isVertical ? "aspect-[4/3]" : "aspect-[3/4]"
            )}
          >
            {photos[index] ? (
              <img
                src={photos[index] || "/placeholder.svg"}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
                style={{ filter: FILTERS.find((f) => f.id === filter)?.style || "" }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                <Camera className="w-8 h-8 mb-1" />
                {showNumbers && <span className="text-sm">{index + 1}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    // Landing Page
    if (step === "landing") {
      return (
        <div className="h-[100dvh] bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4 overflow-hidden">
          <div className="w-full max-w-sm space-y-4 flex flex-col py-4 h-full max-h-[850px]">
            <div className="text-center space-y-2 py-4">
              <div
                className="w-20 h-20 mx-auto border-4 border-pink-400 rounded-3xl flex items-center justify-center bg-white/50 cursor-pointer active:scale-95 transition-transform"
                onClick={() => {
                  const newCount = clickCount + 1;
                  if (newCount >= 5) {
                    setShowDebug(true);
                    setClickCount(0);
                    addLog("디버그 모드 활성화됨");
                  } else {
                    setClickCount(newCount);
                  }
                }}
              >
                <Camera className="w-10 h-10 text-pink-500" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Moment In
              </h1>
              <p className="text-gray-500 text-base">
                언제 어디서나 특별한 순간을 담아보세요
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-5 space-y-4 flex-1 flex flex-col justify-center overflow-auto max-h-[500px]">
              <h2 className="text-lg font-bold text-center text-gray-800 flex items-center justify-center gap-2">
                <span>📸</span> 시작하기 전에
              </h2>

              <div className="space-y-2">
                <div className="bg-pink-50/50 rounded-2xl p-3 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-pink-600 text-sm">카메라 권한 허용</h3>
                    <p className="text-gray-500 text-xs">"허용"을 눌러주세요.</p>
                  </div>
                </div>

                <div className="bg-purple-50/50 rounded-2xl p-3 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-600 text-sm">카메라 확인</h3>
                    <p className="text-gray-500 text-xs">작동 상태를 확인하세요.</p>
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-3 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    3
                  </div>
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

            <p className="text-center text-gray-400 text-xs mt-auto py-2">
              💡 충분한 조명 아래 촬영하면 더 예쁘게 나와요!
            </p>
          </div>
        </div>
      );
    }

    // Camera Check Step
    if (step === "camera") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 p-6">
          <div className="max-w-4xl mx-auto">
            <StepIndicator />
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setStep("landing")} className="flex items-center text-gray-600 hover:text-gray-800">
                <ChevronLeft className="w-5 h-5 mr-1" />
                처음으로
              </button>
              <h2 className="text-xl font-bold text-gray-800">카메라 확인</h2>
              <div className="w-20" />
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
              {renderCameraPreview()}
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
              <Button onClick={() => setStep("layout")} disabled={!isStreamReady} className="w-full py-6 text-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl shadow-lg disabled:opacity-50">
                레이아웃 선택하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Layout Step
    if (step === "layout") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 p-6">
          <div className="max-w-5xl mx-auto">
            <StepIndicator />
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setStep("camera")} className="flex items-center text-gray-600 hover:text-gray-800">
                <ChevronLeft className="w-5 h-5 mr-1" />
                카메라 확인
              </button>
              <h2 className="text-xl font-bold text-gray-800">레이아웃 선택</h2>
              <div className="w-24" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-xl p-4 relative">
                {renderCameraPreview()}
              </div>
              <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
                <div className="flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-purple-600" /><h3 className="font-bold text-gray-800">레이아웃 선택</h3></div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setLayout("4cut")} className={cn("p-6 rounded-2xl border-2 transition-all", layout === "4cut" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300")}>
                    <div className="grid grid-cols-2 gap-1.5 mb-4 mx-auto w-fit">{[1, 2, 3, 4].map((i) => (<div key={i} className="w-8 h-10 bg-pink-200 rounded" />))}</div>
                    <p className="font-bold text-gray-800">4컷</p>
                  </button>
                  <button onClick={() => setLayout("4cut-vertical")} className={cn("p-6 rounded-2xl border-2 transition-all", layout === "4cut-vertical" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300")}>
                    <div className="flex flex-col gap-1 mb-4 mx-auto w-fit">{[1, 2, 3, 4].map((i) => (<div key={i} className="w-12 h-5 bg-blue-200 rounded" />))}</div>
                    <p className="font-bold text-gray-800">4컷 (세로)</p>
                  </button>
                </div>
                <Button onClick={() => setStep("filter")} className="w-full py-6 text-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl shadow-lg">필터 선택하기<ArrowRight className="ml-2 w-5 h-5" /></Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Filter Selection
    if (step === "filter") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 p-6">
          <div className="max-w-5xl mx-auto">
            <StepIndicator />
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setStep("layout")} className="flex items-center text-gray-600 hover:text-gray-800">
                <ChevronLeft className="w-5 h-5 mr-1" />
                레이아웃 선택
              </button>
              <h2 className="text-xl font-bold text-gray-800">필터 선택</h2>
              <div className="w-24" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-xl p-4 relative">
                {renderCameraPreview(FILTERS.find((f) => f.id === filter)?.style)}
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
                <Button onClick={() => setStep("capture")} className="w-full py-6 text-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl shadow-lg">
                  촬영 시작하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Capture Step
    if (step === "capture") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 p-6">
          <div className="max-w-5xl mx-auto">
            <StepIndicator />
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => { resetPhotos(); setStep("filter"); }} className="flex items-center text-gray-600 hover:text-gray-800">
                <ChevronLeft className="w-5 h-5 mr-1" />
                필터 선택
              </button>
              <h2 className="text-xl font-bold text-gray-800">촬영 ({photos.length}/{maxPhotos})</h2>
              <div className="w-24" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {renderCameraPreview(FILTERS.find((f) => f.id === filter)?.style)}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleManualCapture}
                    disabled={isCapturing || !isStreamReady || photos.length >= maxPhotos || isAutoCapturing}
                    className="py-6 text-lg bg-pink-500 hover:bg-pink-600 text-white rounded-2xl shadow-lg border-b-4 border-pink-700 active:translate-y-1 active:border-b-0 transition-all font-bold"
                  >
                    <Camera className="w-6 h-6 mr-2" />
                    수동 촬영
                  </Button>
                  <Button
                    onClick={isAutoCapturing ? stopAutoCapture : handleAutoCapture}
                    disabled={(!isAutoCapturing && (isCapturing || photos.length >= maxPhotos)) || !isStreamReady}
                    className={cn(
                      "py-6 text-lg rounded-2xl shadow-lg border-b-4 transition-all font-bold",
                      isAutoCapturing
                        ? "bg-red-500 hover:bg-red-600 text-white border-red-700"
                        : "bg-purple-500 hover:bg-purple-600 text-white border-purple-700"
                    )}
                  >
                    {isAutoCapturing ? "중지" : (
                      <>
                        <Play className="w-6 h-6 mr-2" />
                        자동 촬영
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-500 text-sm">대기시간:</span>
                  {[3, 5, 7].map(t => <button key={t} onClick={() => setDelayTime(t)} className={cn("px-4 py-2 rounded-full text-sm", delayTime === t ? "bg-purple-500 text-white" : "bg-gray-100")}>{t}초</button>)}
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="font-bold mb-4">내 갤러리</h3>
                <PhotoGrid showNumbers />
                {photos.length === maxPhotos && <Button onClick={() => setStep("result")} className="w-full mt-4 py-5 bg-purple-500 text-white rounded-2xl">완료하기</Button>}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Result Step
    if (step === "result") {
      const selectedTheme = FRAME_THEMES.find(t => t.id === frameTheme);
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-pink-100 p-6">
          <div className="max-w-md mx-auto">
            <StepIndicator />
            <div className="rounded-3xl shadow-xl p-4 mb-6" style={{ background: selectedTheme?.gradient }}>
              <p className="text-center mb-3 font-bold text-2xl" style={{ color: selectedTheme?.textColor }}>Moment In</p>
              <div className="grid grid-cols-2 gap-2">
                {photos.map((p, i) => <img key={i} src={p} className="w-full aspect-[3/4] object-cover rounded-md" style={{ filter: FILTERS.find(f => f.id === filter)?.style || "" }} />)}
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
              <div className="grid grid-cols-6 gap-2">
                {FRAME_THEMES.map(t => <button key={t.id} onClick={() => setFrameTheme(t.id)} className={cn("w-10 h-10 rounded-lg flex items-center justify-center", frameTheme === t.id ? "ring-2 ring-purple-500" : "")} style={{ background: t.gradient }}>{t.icon}</button>)}
              </div>
              <Button onClick={downloadResult} className="w-full py-5 bg-pink-500 text-white rounded-2xl">다운로드</Button>
              <Button onClick={() => { resetPhotos(); setStep("landing"); }} variant="outline" className="w-full py-5 text-gray-500 rounded-2xl">다시 찍기</Button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {showDebug && <DebugOverlay logs={logs} onClose={() => setShowDebug(false)} />}
      {renderContent()}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors text-[10px]"
        >
          LOG
        </button>
      </div>
    </>
  );
}
