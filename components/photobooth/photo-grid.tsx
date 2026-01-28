"use client";
import React from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhotobooth, FILTERS } from "./photobooth-context";

interface PhotoGridProps {
    showNumbers?: boolean;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ showNumbers = false }) => {
    const { photos, layout, filter } = usePhotobooth();
    const isVertical = layout === "4cut-vertical";

    return (
        <div className={cn("grid gap-2", isVertical ? "grid-cols-1" : "grid-cols-2")}>
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
                            src={photos[index]}
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
