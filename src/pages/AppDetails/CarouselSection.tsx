import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, X, Loader2, ImagePlay, Save, GripVertical, RefreshCw } from "lucide-react";
import {
  fetchCarouselImages,
  uploadCarouselImage,
  saveCarouselImages,
  deleteCarouselImage,
  getCarouselImageURL,
  type CarouselImage,
} from "../../lib/appMediaService";

export default function CarouselSection() {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [carouselPreviewURLs, setCarouselPreviewURLs] = useState<Record<string, string>>({});
  const [loadingCarousel, setLoadingCarousel] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [carouselError, setCarouselError] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dirty tracking
  const [carouselDirty, setCarouselDirty] = useState(false);

  // Carousel reorder
  const cardDragSrcId = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Carousel replace
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [reuploading, setReuploading] = useState(false);
  const [reuploadProgress, setReuploadProgress] = useState(0);

  // Load carousel from Firebase on mount
  useEffect(() => {
    const load = async () => {
      setLoadingCarousel(true);
      setCarouselError(null);
      try {
        const images = await fetchCarouselImages();
        setCarouselImages(images);
        // Resolve preview URLs for each image
        const urlMap: Record<string, string> = {};
        await Promise.all(
          images.map(async (img) => {
            urlMap[img.id] = await getCarouselImageURL(img.storagePath);
          })
        );
        setCarouselPreviewURLs(urlMap);
        setCarouselDirty(false);
      } catch (err) {
        console.error("Failed to load carousel:", err);
        setCarouselError("Failed to load carousel images");
      } finally {
        setLoadingCarousel(false);
      }
    };
    load();
  }, []);

  // Upload new images to Firebase Storage
  const handleFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    setUploading(true);
    setCarouselError(null);
    try {
      for (const file of imageFiles) {
        const img = await uploadCarouselImage(file, setUploadProgress);
        const url = await getCarouselImageURL(img.storagePath);
        setCarouselImages((prev) => {
          const updated = [...prev, { ...img, order: prev.length }];
          return updated;
        });
        setCarouselPreviewURLs((prev) => ({ ...prev, [img.id]: url }));
        setCarouselDirty(true);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setCarouselError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Delete a carousel image
  const removeImage = useCallback(async (img: CarouselImage) => {
    try {
      await deleteCarouselImage(img.storagePath);
      setCarouselImages((prev) =>
        prev.filter((i) => i.id !== img.id).map((i, idx) => ({ ...i, order: idx }))
      );
      setCarouselPreviewURLs((prev) => {
        const next = { ...prev };
        delete next[img.id];
        return next;
      });
      setCarouselDirty(true);
    } catch (err) {
      console.error("Delete failed:", err);
      setCarouselError("Failed to delete image.");
    }
  }, []);

  // Save carousel order to Firestore
  const handleSaveCarousel = useCallback(async () => {
    setSaving(true);
    setCarouselError(null);
    try {
      await saveCarouselImages(carouselImages);
      setCarouselDirty(false);
      alert("Carousel saved!");
    } catch (err) {
      console.error("Save failed:", err);
      setCarouselError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [carouselImages]);

  const handleDrag = (e: React.DragEvent) => {
    if (cardDragSrcId.current) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (cardDragSrcId.current) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
  };

  // Carousel card drag-to-reorder
  const handleCardDragStart = (id: string) => {
    cardDragSrcId.current = id;
    setDraggingId(id);
  };

  const handleCardDragOver = (e: React.DragEvent, id: string) => {
    if (!cardDragSrcId.current) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(id);
  };

  const handleCardDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const srcId = cardDragSrcId.current;
    cardDragSrcId.current = null;
    setDraggingId(null);
    setDragOverId(null);
    if (!srcId || srcId === targetId) return;
    setCarouselDirty(true);
    setCarouselImages((prev) => {
      const next = [...prev];
      const srcIdx = next.findIndex((i) => i.id === srcId);
      const tgtIdx = next.findIndex((i) => i.id === targetId);
      if (srcIdx < 0 || tgtIdx < 0) return prev;
      const [moved] = next.splice(srcIdx, 1);
      next.splice(tgtIdx, 0, moved);
      return next.map((img, idx) => ({ ...img, order: idx }));
    });
  };

  const handleCardDragEnd = () => {
    cardDragSrcId.current = null;
    setDraggingId(null);
    setDragOverId(null);
  };

  // Carousel image replace
  const handleReplaceClick = (imgId: string) => {
    setReplaceTargetId(imgId);
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !replaceTargetId) return;
    const targetImg = carouselImages.find((i) => i.id === replaceTargetId);
    if (!targetImg) return;
    setReuploading(true);
    setCarouselError(null);
    try {
      await deleteCarouselImage(targetImg.storagePath);
      const newImg = await uploadCarouselImage(file, setReuploadProgress);
      const url = await getCarouselImageURL(newImg.storagePath);
      setCarouselImages((prev) =>
        prev.map((i) => i.id === replaceTargetId ? { ...newImg, order: i.order } : i)
      );
      setCarouselPreviewURLs((prev) => {
        const next = { ...prev };
        delete next[replaceTargetId];
        next[newImg.id] = url;
        return next;
      });
      setCarouselDirty(true);
    } catch (err) {
      console.error("Replace failed:", err);
      setCarouselError("Failed to replace image. Please try again.");
    } finally {
      setReuploading(false);
      setReuploadProgress(0);
      setReplaceTargetId(null);
    }
  }, [replaceTargetId, carouselImages]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <ImagePlay className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Carousel Images</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recommended: 1920 × 1080 px &middot; Changes are live after saving
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
            {carouselImages.length} image{carouselImages.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={handleSaveCarousel}
            disabled={saving || uploading || loadingCarousel || !carouselDirty}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Carousel"}
          </button>
        </div>
      </div>

      {/* Section body */}
      <div className="p-6 space-y-5">
        {carouselError && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {carouselError}
          </div>
        )}

        {/* Hidden input for replacing an existing image */}
        <input
          ref={replaceFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleReplaceFileInput}
          className="hidden"
        />

        {/* Current images grid */}
        {loadingCarousel ? (
          <div className="flex items-center justify-center h-28 text-gray-400 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Loading current images…</span>
          </div>
        ) : carouselImages.length > 0 ? (
          <>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
              Drag cards to reorder &middot; Hover a card to replace or remove it
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {carouselImages.map((img) => {
                const isBeingReplaced = reuploading && replaceTargetId === img.id;
                const isDragging = draggingId === img.id;
                const isDropTarget = dragOverId === img.id && draggingId !== img.id;
                return (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleCardDragStart(img.id)}
                    onDragOver={(e) => handleCardDragOver(e, img.id)}
                    onDrop={(e) => handleCardDrop(e, img.id)}
                    onDragEnd={handleCardDragEnd}
                    className={`relative group aspect-video rounded-lg overflow-hidden border-2 bg-gray-100 dark:bg-gray-800 transition-all select-none ${
                      isDragging
                        ? "opacity-40 scale-95 border-blue-400 dark:border-blue-500"
                        : isDropTarget
                        ? "border-blue-500 ring-2 ring-blue-400 scale-[1.02]"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {isBeingReplaced ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                        <span className="text-xs text-white">{reuploadProgress}%</span>
                      </div>
                    ) : null}

                    {carouselPreviewURLs[img.id] ? (
                      <img
                        src={carouselPreviewURLs[img.id]}
                        alt={img.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}

                    {/* Drag handle */}
                    <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                      <div className="p-1 rounded bg-black/50 backdrop-blur-sm">
                        <GripVertical className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    {/* Replace + Delete buttons */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleReplaceClick(img.id)}
                        disabled={reuploading}
                        className="p-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded shadow-lg"
                        aria-label="Replace image"
                        title="Replace image"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(img)}
                        disabled={reuploading}
                        className="p-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded shadow-lg"
                        aria-label="Remove image"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Filename bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate">{img.fileName}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No carousel images uploaded yet.</p>
        )}

        {/* Drop zone — compact strip */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
              : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400">Uploading… {uploadProgress}%</p>
                <div className="mt-1.5 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm shrink-0">
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="text-blue-600 dark:text-blue-400">Click to upload</span>
                  {" "}or drag &amp; drop
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">PNG, JPG, GIF up to 10 MB</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
