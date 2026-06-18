"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

type Props = {
  imageSrc: string;
  onCancel: () => void;
  onSave: (blob: Blob) => Promise<void>;
};

function centerAspectCrop(w: number, h: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, 1, w, h),
    w,
    h
  );
}

export function AvatarCropModal({ imageSrc, onCancel, onSave }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [saving, setSaving] = useState(false);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  async function handleSave() {
    if (!imgRef.current || !crop) return;
    setSaving(true);
    try {
      const blob = await cropToBlob(imgRef.current, crop);
      await onSave(blob);
    } catch {
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-bold text-white">アイコン画像を設定</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="bg-black flex items-center justify-center p-2" style={{ minHeight: 260 }}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={1}
            circularCrop
            keepSelection
          >
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              alt="crop target"
              style={{ maxHeight: 300, maxWidth: "100%", display: "block" }}
            />
          </ReactCrop>
        </div>

        <div className="px-4 py-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-3">円をドラッグして範囲を調整してください</p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !crop}
              className="flex-2 flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 rounded-lg text-sm font-bold transition-colors"
            >
              {saving ? "保存中..." : "この範囲で保存"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function cropToBlob(img: HTMLImageElement, crop: Crop): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;

  const pixelCrop =
    crop.unit === "%"
      ? {
          x: (crop.x / 100) * img.width,
          y: (crop.y / 100) * img.height,
          width: (crop.width / 100) * img.width,
          height: (crop.height / 100) * img.height,
        }
      : crop;

  ctx.drawImage(
    img,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      0.9
    );
  });
}
