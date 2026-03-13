import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, X, Loader2, Bell, ImagePlay, Gamepad2, Save, GripVertical, RefreshCw } from "lucide-react";
import {
  fetchCarouselImages,
  uploadCarouselImage,
  saveCarouselImages,
  deleteCarouselImage,
  getCarouselImageURL,
  type CarouselImage,
  fetchGameCardImages,
  uploadGameCardImage,
  saveGameCardImages,
  deleteGameCardImage,
  getGameCardImageURL,
  type GameCardImage,
  fetchNotice,
  saveNotice,
} from "../../lib/appMediaService";

export default function AppDetails() {
  const [noticeHeading, setNoticeHeading] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const [loadingNotice, setLoadingNotice] = useState(true);
  const [savingNotice, setSavingNotice] = useState(false);
  const [noticeError, setNoticeError] = useState<string | null>(null);
  // Carousel — Firebase backed
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [carouselPreviewURLs, setCarouselPreviewURLs] = useState<Record<string, string>>({});
  const [loadingCarousel, setLoadingCarousel] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [carouselError, setCarouselError] = useState<string | null>(null);

  // Game card images — Firebase backed
  const [gameCardImages, setGameCardImages] = useState<GameCardImage[]>([]);
  const [gameCardPreviewURLs, setGameCardPreviewURLs] = useState<Record<string, string>>({});
  const [loadingGameCards, setLoadingGameCards] = useState(true);
  const [uploadingGameSlot, setUploadingGameSlot] = useState<number | null>(null);
  const [uploadGameProgress, setUploadGameProgress] = useState(0);
  const [gameCardError, setGameCardError] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [gameDragActive, setGameDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gameFileInputRef = useRef<HTMLInputElement>(null);

  // Dirty tracking
  const savedNoticeRef = useRef({ heading: "", text: "" });
  // Carousel reorder
  const cardDragSrcId = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Carousel replace
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [reuploading, setReuploading] = useState(false);
  const [reuploadProgress, setReuploadProgress] = useState(0);

  // Game card reorder
  const gameCardDragSrcId = useRef<string | null>(null);
  const [draggingGameId, setDraggingGameId] = useState<string | null>(null);
  const [dragOverGameSlot, setDragOverGameSlot] = useState<number | null>(null);

  // Game card replace
  const gameReplaceFileInputRef = useRef<HTMLInputElement>(null);
  const gameReplaceTargetIdRef = useRef<string | null>(null);      // read in callback (avoids stale closure)
  const [gameReplaceTargetId, setGameReplaceTargetId] = useState<string | null>(null); // drives UI indicator only
  const [gameReuploading, setGameReuploading] = useState(false);
  const [gameReuploadProgress, setGameReuploadProgress] = useState(0);

  // ── Load notice from Firebase on mount ───────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingNotice(true);
      setNoticeError(null);
      try {
        const notice = await fetchNotice();
        setNoticeHeading(notice.heading);
        setNoticeText(notice.text);
        savedNoticeRef.current = { heading: notice.heading, text: notice.text };
      } catch (err) {
        console.error("Failed to load notice:", err);
        setNoticeError("Failed to load notice");
      } finally {
        setLoadingNotice(false);
      }
    };
    load();
  }, []);

  const handleSaveNotice = useCallback(async () => {
    setSavingNotice(true);
    setNoticeError(null);
    try {
      await saveNotice({ heading: noticeHeading, text: noticeText });
      savedNoticeRef.current = { heading: noticeHeading, text: noticeText };
      alert("Notice saved!");
    } catch (err) {
      console.error("Save notice failed:", err);
      setNoticeError("Failed to save notice. Please try again.");
    } finally {
      setSavingNotice(false);
    }
  }, [noticeHeading, noticeText]);

  // ── Load game card images from Firebase on mount ──────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingGameCards(true);
      setGameCardError(null);
      try {
        const images = await fetchGameCardImages();
        setGameCardImages(images);
        const urlMap: Record<string, string> = {};
        const results = await Promise.allSettled(
          images.map(async (img) => {
            const url = await getGameCardImageURL(img.storagePath);
            urlMap[img.id] = url;
          })
        );
        const anyFailed = results.some((r) => r.status === "rejected");
        if (anyFailed) {
          console.warn(
            "Some game card image URLs failed to load:",
            results
              .map((r, i) => (r.status === "rejected" ? images[i].storagePath : null))
              .filter(Boolean)
          );
          setGameCardError("Some images could not be loaded — their files may have been deleted from Storage.");
        }
        setGameCardPreviewURLs(urlMap);
      } catch (err) {
        console.error("Failed to load game cards:", err);
        setGameCardError("Failed to load game card images");
      } finally {
        setLoadingGameCards(false);
      }
    };
    load();
  }, []);

  // ── Load carousel from Firebase on mount ────────────────────────────────
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
      } catch (err) {
        console.error("Failed to load carousel:", err);
        setCarouselError("Failed to load carousel images");
      } finally {
        setLoadingCarousel(false);
      }
    };
    load();
  }, []);

  // ── Warn on reload/navigation while any upload is in progress ─────────────
  const isUploading = uploading || reuploading || uploadingGameSlot !== null || gameReuploading;
  useEffect(() => {
    if (!isUploading) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isUploading]);

  // ── Upload new images to Firebase Storage ─────────────────────────────────
  const handleFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    setUploading(true);
    setCarouselError(null);
    const uploadedSoFar: CarouselImage[] = [];
    try {
      const newImages: CarouselImage[] = [];
      const newURLs: Record<string, string> = {};
      for (const file of imageFiles) {
        const img = await uploadCarouselImage(file, setUploadProgress);
        uploadedSoFar.push(img); // track for cleanup on failure
        const url = await getCarouselImageURL(img.storagePath);
        newImages.push(img);
        newURLs[img.id] = url;
      }
      const updated = [...carouselImages, ...newImages].map((img, idx) => ({ ...img, order: idx }));
      await saveCarouselImages(updated);
      setCarouselImages(updated);
      setCarouselPreviewURLs((prev) => ({ ...prev, ...newURLs }));
    } catch (err) {
      console.error("Upload failed:", err);
      setCarouselError("Upload failed. Please try again.");
      // Remove any files that made it to Storage so they don't become orphans
      uploadedSoFar.forEach((img) =>
        deleteCarouselImage(img.storagePath).catch((e) =>
          console.warn("Storage cleanup after failed upload:", e)
        )
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [carouselImages]);

  // ── Delete a carousel image ───────────────────────────────────────────────
  const removeImage = useCallback(async (img: CarouselImage) => {
    try {
      const updatedImages = carouselImages
        .filter((i) => i.id !== img.id)
        .map((i, idx) => ({ ...i, order: idx }));
      await saveCarouselImages(updatedImages);
      // Delete from storage after Firestore is updated — best-effort cleanup
      deleteCarouselImage(img.storagePath).catch((err) =>
        console.warn("Old carousel image cleanup failed:", err)
      );
      setCarouselImages(updatedImages);
      setCarouselPreviewURLs((prev) => {
        const next = { ...prev };
        delete next[img.id];
        return next;
      });
    } catch (err) {
      console.error("Delete failed:", err);
      setCarouselError("Failed to delete image.");
    }
  }, [carouselImages]);

  const handleDrag = (e: React.DragEvent) => {
    if (cardDragSrcId.current) return; // card reorder in progress — ignore
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

  // ── Carousel card drag-to-reorder ─────────────────────────────────────────
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
    const next = [...carouselImages];
    const srcIdx = next.findIndex((i) => i.id === srcId);
    const tgtIdx = next.findIndex((i) => i.id === targetId);
    if (srcIdx < 0 || tgtIdx < 0) return;
    const [moved] = next.splice(srcIdx, 1);
    next.splice(tgtIdx, 0, moved);
    const updatedImages = next.map((img, idx) => ({ ...img, order: idx }));
    setCarouselImages(updatedImages);
    saveCarouselImages(updatedImages).catch((err) => {
      console.error("Auto-save reorder failed:", err);
      setCarouselError("Failed to save reorder. Please try again.");
    });
  };

  const handleCardDragEnd = () => {
    cardDragSrcId.current = null;
    setDraggingId(null);
    setDragOverId(null);
  };

  // ── Carousel image replace ────────────────────────────────────────────────
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
    let newImg: CarouselImage | null = null;
    try {
      newImg = await uploadCarouselImage(file, setReuploadProgress);
      const url = await getCarouselImageURL(newImg.storagePath);
      const updatedImages = carouselImages.map((i) =>
        i.id === replaceTargetId ? { ...newImg!, order: i.order } : i
      );
      await saveCarouselImages(updatedImages);
      // Delete old image after Firestore is updated — best-effort cleanup
      deleteCarouselImage(targetImg.storagePath).catch((err) =>
        console.warn("Old carousel image cleanup failed:", err)
      );
      setCarouselImages(updatedImages);
      setCarouselPreviewURLs((prev) => {
        const next = { ...prev };
        delete next[replaceTargetId];
        next[newImg!.id] = url;
        return next;
      });
    } catch (err) {
      console.error("Replace failed:", err);
      setCarouselError("Failed to replace image. Please try again.");
      // If the new file reached Storage but save failed, remove it so it doesn't orphan
      if (newImg) {
        deleteCarouselImage(newImg.storagePath).catch((e) =>
          console.warn("Storage cleanup after failed replace:", e)
        );
      }
    } finally {
      setReuploading(false);
      setReuploadProgress(0);
      setReplaceTargetId(null);
    }
  }, [replaceTargetId, carouselImages]);

  // ── Game card drag-to-reorder ────────────────────────────────────────────
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
    const srcImg = gameCardImages.find((i) => i.id === srcId);
    if (!srcImg || srcImg.slot === targetSlot) return;
    const updatedImages = gameCardImages.map((img) => {
      if (img.id === srcId) return { ...img, slot: targetSlot };
      if (img.slot === targetSlot) return { ...img, slot: srcImg.slot };
      return img;
    }).sort((a, b) => a.slot - b.slot);
    setGameCardImages(updatedImages);
    saveGameCardImages(updatedImages).catch((err) => {
      console.error("Auto-save reorder failed:", err);
      setGameCardError("Failed to save reorder. Please try again.");
    });
  };

  const handleGameCardDragEnd = () => {
    gameCardDragSrcId.current = null;
    setDraggingGameId(null);
    setDragOverGameSlot(null);
  };

  // ── Game card replace ─────────────────────────────────────────────────────
  const handleGameReplaceClick = (imgId: string) => {
    gameReplaceTargetIdRef.current = imgId;
    setGameReplaceTargetId(imgId);
    gameReplaceFileInputRef.current?.click();
  };

  const handleGameReplaceFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const targetId = gameReplaceTargetIdRef.current;
    if (!file || !targetId) return;
    const targetImg = gameCardImages.find((i) => i.id === targetId);
    if (!targetImg) return;
    setGameReuploading(true);
    setGameCardError(null);
    let newImg: GameCardImage | null = null;
    try {
      newImg = await uploadGameCardImage(file, targetImg.slot, setGameReuploadProgress);
      const url = await getGameCardImageURL(newImg.storagePath);
      const updatedImages = gameCardImages.map((i) =>
        i.id === targetId ? { ...newImg!, slot: i.slot } : i
      );
      await saveGameCardImages(updatedImages);
      // Delete old image after Firestore is updated — best-effort cleanup
      deleteGameCardImage(targetImg.storagePath).catch((err) =>
        console.warn("Old game card image cleanup failed:", err)
      );
      setGameCardImages(updatedImages);
      setGameCardPreviewURLs((prev) => {
        const next = { ...prev };
        delete next[targetId];
        next[newImg!.id] = url;
        return next;
      });
    } catch (err) {
      console.error("Game replace failed:", err);
      setGameCardError("Failed to replace image. Please try again.");
      // If the new file reached Storage but save failed, remove it so it doesn't orphan
      if (newImg) {
        deleteGameCardImage(newImg.storagePath).catch((e) =>
          console.warn("Storage cleanup after failed replace:", e)
        );
      }
    } finally {
      gameReplaceTargetIdRef.current = null;
      setGameReuploading(false);
      setGameReuploadProgress(0);
      setGameReplaceTargetId(null);
    }
  }, [gameCardImages]);

  const handleGameButtonClick = () => {
    gameFileInputRef.current?.click();
  };

  const handleGameDrag = (e: React.DragEvent) => {
    if (gameCardDragSrcId.current) return; // card reorder in progress — ignore
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
      // card reorder onto an empty slot — move the card there
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

    setGameCardError(null);
    const uploadedSoFar: GameCardImage[] = [];
    try {
      const newImages: GameCardImage[] = [];
      const newURLs: Record<string, string> = {};
      for (let i = 0; i < filesToAdd.length; i++) {
        const slot = emptySlots[i];
        setUploadingGameSlot(slot);
        const img = await uploadGameCardImage(filesToAdd[i], slot, setUploadGameProgress);
        uploadedSoFar.push(img); // track for cleanup on failure
        const url = await getGameCardImageURL(img.storagePath);
        newImages.push(img);
        newURLs[img.id] = url;
      }
      const updated = [...gameCardImages, ...newImages].sort((a, b) => a.slot - b.slot);
      await saveGameCardImages(updated);
      setGameCardImages(updated);
      setGameCardPreviewURLs((prev) => ({ ...prev, ...newURLs }));
    } catch (err) {
      console.error("Game card upload failed:", err);
      setGameCardError("Upload failed. Please try again.");
      // Remove any files that made it to Storage so they don't become orphans
      uploadedSoFar.forEach((img) =>
        deleteGameCardImage(img.storagePath).catch((e) =>
          console.warn("Storage cleanup after failed upload:", e)
        )
      );
    } finally {
      setUploadingGameSlot(null);
      setUploadGameProgress(0);
    }
  }, [gameCardImages]);

  const noticeDirty =
    !loadingNotice &&
    (noticeHeading !== savedNoticeRef.current.heading ||
      noticeText !== savedNoticeRef.current.text);

  return (
    <div className="space-y-8">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            App Details
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage notices, carousel slides, and game card images shown in the main app.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Live
        </span>
      </div>

      {/* ── Section 1: Notice ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Notice</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">In-app announcement shown to all users</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveNotice}
            disabled={savingNotice || loadingNotice || !noticeDirty}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {savingNotice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savingNotice ? "Saving..." : "Save Notice"}
          </button>
        </div>

        {/* Section body */}
        <div className="p-6 space-y-5">
          {noticeError && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {noticeError}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Notice Heading */}
            <div>
              <label
                htmlFor="noticeHeading"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Heading
              </label>
              {loadingNotice ? (
                <div className="flex items-center gap-2 h-10 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading…
                </div>
              ) : (
                <input
                  id="noticeHeading"
                  type="text"
                  value={noticeHeading}
                  onChange={(e) => setNoticeHeading(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter notice heading..."
                />
              )}
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Short title displayed at the top of the notice
              </p>
            </div>

            {/* Spacer on mobile, nothing on sm+ */}
            <div className="hidden sm:block" />
          </div>

          {/* Notice Text */}
          <div>
            <label
              htmlFor="noticeText"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Body Text
            </label>
            {loadingNotice ? (
              <div className="flex items-center gap-2 h-20 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </div>
            ) : (
              <textarea
                id="noticeText"
                rows={5}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter notice body text here..."
              />
            )}
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Full notice message displayed in the app
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 2: Carousel Images ────────────────────────────────── */}
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
                Recommended: 1920 × 1080 px &middot; Changes are saved automatically
              </p>
            </div>
          </div>
          <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
            {carouselImages.length} image{carouselImages.length !== 1 ? "s" : ""}
          </span>
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

      {/* ── Section 3: Game Pictures ──────────────────────────────────── */}
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
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                gameCardImages.length === 5 ? "bg-green-500" : "bg-amber-400"
              }`}
            />
            {gameCardImages.length} / 5 filled
          </span>
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
                          disabled={uploadingGameSlot !== null || gameCardImages.length >= 5}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {uploadingGameSlot === slot ? (
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
          {(uploadingGameSlot !== null || gameReuploading) && (
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
              <span>{gameReuploading ? "Replacing" : `Uploading slot #${uploadingGameSlot}`}… {gameReuploading ? gameReuploadProgress : uploadGameProgress}%</span>
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
    </div>
  );
}