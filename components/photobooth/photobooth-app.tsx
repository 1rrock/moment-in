"use client";
import React from "react";
import { PhotoboothProvider, usePhotobooth } from "./photobooth-context";
import { LandingStep } from "./steps/Landing";
import { CameraCheckStep } from "./steps/CameraCheck";
import { LayoutSelectionStep } from "./steps/LayoutSelection";
import { FilterSelectionStep } from "./steps/FilterSelection";
import { CaptureStep } from "./steps/Capture";
import { ResultStep } from "./steps/Result";
import { ConfirmDialog } from "./confirm-dialog";

const PhotoboothRouter = () => {
  const { step, isConfirmOpen, setIsConfirmOpen, handleConfirmDownload } = usePhotobooth();

  const renderCurrentStep = () => {
    switch (step) {
      case "landing":
        return <LandingStep />;
      case "camera":
        return <CameraCheckStep />;
      case "layout":
        return <LayoutSelectionStep />;
      case "filter":
        return <FilterSelectionStep />;
      case "capture":
        return <CaptureStep />;
      case "result":
        return <ResultStep />;
      default:
        return <LandingStep />;
    }
  };

  return (
    <>
      {renderCurrentStep()}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={"광고 시청 후 다운로드"}
        description={"리워드 광고를 시청하시면\n이미지를 다운로드할 수 있습니다."}
        confirmText="광고 보기"
        cancelText="취소"
        onConfirm={handleConfirmDownload}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
};

export default function PhotoboothApp() {
  return (
    <PhotoboothProvider>
      <PhotoboothRouter />
    </PhotoboothProvider>
  );
}
