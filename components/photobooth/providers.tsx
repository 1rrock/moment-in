"use client";

import React from "react";
import { PhotoboothProvider, usePhotobooth } from "./photobooth-context";
import { ConfirmDialog } from "./confirm-dialog";

function GlobalConfirmDialog() {
    const { isConfirmOpen, setIsConfirmOpen, handleConfirmDownload } = usePhotobooth();

    return (
        <ConfirmDialog
            isOpen={isConfirmOpen}
            title={"광고 시청 후 다운로드"}
            description={"리워드 광고를 시청하시면\n이미지를 다운로드할 수 있습니다."}
            confirmText="광고 보기"
            cancelText="취소"
            onConfirm={handleConfirmDownload}
            onCancel={() => setIsConfirmOpen(false)}
        />
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PhotoboothProvider>
            {children}
            <GlobalConfirmDialog />
        </PhotoboothProvider>
    );
}
