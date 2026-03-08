import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Loader2, Gamepad2, Save, GripVertical, RefreshCw } from "lucide-react";
import {
  fetchGameCardImages,
  uploadGameCardImage,
  saveGameCardImages,
  deleteGameCardImage,
  getGameCardImageURL,
  type GameCardImage,
} from "../../lib/appMediaService";

export default function GameCardsSection() {
  const [gameCardImages, setGameCardImages] = useState<GameCardImage[]>([]);
  const [gameCardPreviewURLs, setGameCardPreviewURLs] = useState<Record<string, string>>({});
  const [loadingGameCards, setLoadingGameCards] = useState(true);
  const [uploadingGame, setUploadingGame] = useState(false);
  const [uploadGameProgress, setUploadGameProgress] = useState(0);
  const [savingGame, setSavingGame] = useState(false);
  const [gameCardError, setGameCardError] = useState<string | null>(null);

  const [gameDragActive, setGameDragActive] = useState(false);
  const gameFileInputRef = useRef<HTMLInputElement>(null);

  // Dirty tracking
  const [gameCardsDirty, setGameCardsDirty] = useState(false);

  // Game card reorder
  const gameCardDragSrcId = useRef<string | null>(null);
  const [draggingGameId, setDraggingGameId] = useState<string | null>(null);
  const [dragOverGameSlot, setDragOverGameSlot] = useState<number | null>(null);

  // Game card replace
  const gameReplaceFileInputRef = useRef<HTMLInputElement>(null);
  const [gameReplaceTargetId, setGameReplaceTargetId] = useState<string | null>(null);
  const [gameReuploading, setGameReuploading] = useState(false);
  const [gameReuploadProgress, setGameReuploadProgress] = useState(0);

  // Load game card images from Firebase on mount
  useEffect(() => {
    const load = async () => {
      setLoadingGameCards(true);
      setGameCardError(null);
      try {
        const images = await fetchGameCardImages();
        setGameCardImages(images);
        const urlMap: Record<string, string> = {};
        await Promise.all(
          images.map(async (img) => {
            urlMap[img.id] = await getGameCardImageURL(img.storagePath);
          })
        );
        setGameCardPreviewURLs(urlMap);
        setGameCardsDirty(false);
      } catch (err) {
        console.error("Failed to load game cards:", err);
        setGameCardError("Failed to load game card images");
      } finally {
        setLoadingGameCards(false);
      }
    };
    load();
  }, []);

  // Game card drag-to-reorder
  const handleGameCardDragStart = (id: string) => {
    gameCardDragSrcId.current = id;
    setDraggingGameId(id);
  };

  const handleGameCardDragOver = (e: React.DragEvent, slot: number) => {
    if (!gameCardDragSrcId.current) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverGameSlot(slot);
  };

  const handleGameCardDrop = (e: React.DragEvent, targetSlot: number) => {
    e.preventDefault();
    e.stopPropagation();
    const srcId = gameCardDragSrcId.current;
    gameCardDragSrcId.current = null;
    setDraggingGameId(null);
    setDragOverGameSlot(null);
    if (!srcId) return;
    setGameCardImages((prev) => {
      const srcImg = prev.find((i) => i.id === srcId);
      if (!srcImg || srcImg.slot === targetSlot) return prev;
      return prev.map((img) => {
        if (img.id === srcId) return { ...img, slot: targetSlot };
        if (img.slot === targetSlot) return { ...img, slot: srcImg.slot };
        return img;
      }).sort((a, b) => a.slot - b.slot);
    });
    setGameCardsDirty(true);
  };

  const handleGameCardDragEnd = () => {
    gameCardDragSrcId.current = null;
    setDraggingGameId(null);
    setDragOverGameSlot(null);
  };

  // Game card replace
  const handleGameReplaceClick = (imgId: string) => {
    setGameReplaceTargetId(imgId);
    gameReplaceFileInputRef.current?.click();
  };

  const handleGameReplaceFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !gameReplaceTargetId) return;
    const targetImg = gameCardImages.find((i) => i.id === gameReplaceTargetId);
    if (!targetImg) return;
    setGameReuploading(true);
    setGameCardError(null);
    try {
      await deleteGameCardImage(targetImg.storagePath);
      const newImg = await uploadGameCardImage(file, targetImg.slot, setGameReuploadProgress);
      const url = await getGameCardImageURL(newImg.storagePath);
      setGameCardImages((prev) =>
        prev.map((i) => i.id === gameReplaceTargetId ? { ...newImg, slot: i.slot } : i)
      );
      setGameCardPreviewURLs((prev) => {
        const next = { ...prev };
        delete next[gameReplaceTargetId];
        next[newImg.id] = url;
        return next;
      });
      setGameCardsDirty(true);
    } catch (err) {
      console.error("Game replace failed:", err);
      setGameCardError("Failed to replace image. Please try again.");
    } finally {
      setGameReuploading(false);
      setGameReuploadProgress(0);
      setGameReplaceTargetId(null);
    }
  }, [gameReplaceTargetId, gameCardImages]);

  const handleSaveGameCards = useCallback(async () => {
    setSavingGame(true);
    setGameCardError(null);
    try {
      await saveGameCardImages(gameCardImages);
      setGameCardsDirty(false);
      alert("Game pictures saved!");
    } catch (err) {
      console.error("Save failed:", err);
      setGameCardError("Failed to save. Please try again.");
    } finally {
      setSavingGame(false);
    }
  }, [gameCardImages]);

  const handleGameButtonClick = () => {
    gameFileInputRef.current?.click();
  };

  const handleGameDrag = (e: React.DragEvent) => {
    if (gameCardDragSrcId.current) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setGameDragActive(true);
    } else if (e.type === "dragleave") {
      setGameDragActive(false);
    }
  };

  const handleGameDrop = (e: React.DragEvent, slot?: number) => {
    if (gameCardDragSrcId.current) {
      if (slot !== undefined) handleGameCardDrop(e, slot);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setGameDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleGameFiles(files);
  };

  const handleGameFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleGameFiles(files);
    }
  };

  const handleGameFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;

    const occupiedSlots = new Set(gameCardImages.map((img) => img.slot));
    const emptySlots = [1, 2, 3, 4, 5].filter((s) => !occupiedSlots.has(s));
    const filesToAdd = imageFiles.slice(0, emptySlots.length);

    if (!filesToAdd.length) {
      alert("All 5 game card slots are full");
      return;
    }
    if (imageFiles.length > emptySlots.length) {
      alert(`Only ${emptySlots.length} slot(s) available`);
    }

    setUploadingGame(true);
    setGameCardError(null);
    try {
      const newImages: GameCardImage[] = [];
      const newURLs: Record<string, string> = {};
      for (let i = 0; i < filesToAdd.length; i++) {
        const slot = emptySlots[i];
        const img = await uploadGameCardImage(filesToAdd[i], slot, setUploadGameProgress);
        const url = await getGameCardImageURL(img.storagePath);
        newImages.push(img);
        newURLs[img.id] = url;
      }
      const updated = [...gameCardImages, ...newImages].sort((a, b) => a.slot - b.slot);
      setGameCardImages(updated);
      setGameCardPreviewURLs((prev) => ({ ...prev, ...newURLs }));
      setGameCardsDirty(true);
    } catch (err) {
      console.error("Game card upload failed:", err);
      setGameCardError("Upload failed. Please try again.");
    } finally {
      setUploadingGame(false);
      setUploadGameProgress(0);
    }
  }, [gameCardImages]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Gamepad2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Game Pictures</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Up to 5 vertical images (1080 × 1920 px) &middot; One per game card slot
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                gameCardImages.length === 5 ? "bg-green-500" : "bg-amber-400"
              }`}
            />
            {gameCardImages.length} / 5 filled
          </span>
          <button
            type="button"
            onClick={handleSaveGameCards}
            disabled={savingGame || uploadingGame || loadingGameCards || !gameCardsDirty}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {savingGame ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savingGame ? "Saving..." : "Save Game Pictures"}
          </button>
        </div>
      </div>

      {/* Section body */}
      <div className="p-6 space-y-5">
        {gameCardError && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {gameCardError}
          </div>
        )}

        {/* Hidden inputs */}
        <input ref={gameFileInputRef} type="file" multiple accept="image/*" onChange={handleGameFileInput} className="hidden" />
        <input ref={gameReplaceFileInputRef} type="file" accept="image/*" onChange={handleGameReplaceFileInput} className="hidden" />

        {loadingGameCards ? (
          <div className="flex items-center justify-center h-28 text-gray-400 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Loading game card images…</span>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
              Drag cards to reorder &middot; Hover a card to replace it &middot; Click an empty slot to upload
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, index) => {
                const slot = index + 1;
                const image = gameCardImages.find((img) => img.slot === slot);
                const previewURL = image ? gameCardPreviewURLs[image.id] : undefined;
                const isBeingReplaced = gameReuploading && gameReplaceTargetId === image?.id;
                const isDragging = image && draggingGameId === image.id;
                const isDropTarget = dragOverGameSlot === slot && (!image || draggingGameId !== image.id);
                return (
                  <div
                    key={slot}
                    draggable={!!image}
                    onDragStart={image ? () => handleGameCardDragStart(image.id) : undefined}
                    onDragOver={(e) => image ? handleGameCardDragOver(e, slot) : handleGameDrag(e)}
                    onDragEnter={!image ? handleGameDrag : (e) => handleGameCardDragOver(e, slot)}
                    onDragLeave={!image ? handleGameDrag : undefined}
                    onDrop={(e) => image ? handleGameCardDrop(e, slot) : handleGameDrop(e, slot)}
                    onDragEnd={image ? handleGameCardDragEnd : undefined}
                    className={`relative aspect-[9/16] rounded-xl overflow-hidden border-2 transition-all select-none ${
                      isDragging
                        ? "opacity-40 scale-95 border-blue-400 dark:border-blue-500"
                        : isDropTarget
                        ? "border-blue-500 ring-2 ring-blue-400 scale-[1.02]"
                        : !image
                        ? gameDragActive && gameCardImages.length < 5
                          ? "border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                          : "border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                        : "border-solid border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {/* Slot badge */}
                    <span className="absolute top-2 left-2 z-10 text-[10px] font-bold bg-black/60 backdrop-blur-sm text-white rounded-md px-1.5 py-0.5">
                      #{slot}
                    </span>

                    {!image ? (
                      <button
                        type="button"
                        onClick={handleGameButtonClick}
                        disabled={uploadingGame || gameCardImages.length >= 5}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploadingGame ? (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : (
                          <>
                            <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                              <Upload className="w-5 h-5 text-gray-400" />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">
                              Card {slot}
                            </span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="relative w-full h-full group">
                        {/* Replace overlay */}
                        {isBeingReplaced && (
                          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1.5 bg-black/60">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                            <span className="text-xs text-white">{gameReuploadProgress}%</span>
                          </div>
                        )}

                        {previewURL ? (
                          <img
                            src={previewURL}
                            alt={`Game card ${slot}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          </div>
                        )}

                        {/* Drag handle */}
                        <div className="absolute top-1.5 left-[calc(50%-10px)] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10">
                          <div className="p-1 rounded bg-black/50 backdrop-blur-sm">
                            <GripVertical className="w-3 h-3 text-white" />
                          </div>
                        </div>

                        {/* Replace button */}
                        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            type="button"
                            onClick={() => handleGameReplaceClick(image.id)}
                            disabled={gameReuploading}
                            className="p-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded shadow-lg"
                            aria-label="Replace image"
                            title="Replace image"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Filename bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-white truncate">{image.fileName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Upload / replace progress */}
        {(uploadingGame || gameReuploading) && (
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
            <span>{gameReuploading ? "Replacing" : "Uploading"}… {gameReuploading ? gameReuploadProgress : uploadGameProgress}%</span>
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${gameReuploading ? gameReuploadProgress : uploadGameProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
