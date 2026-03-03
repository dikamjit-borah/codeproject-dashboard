import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

export default function AppDetails() {
  const [notice, setNotice] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [smileCoinRate, setSmileCoinRate] = useState("");
  const [carouselImages, setCarouselImages] = useState<
    Array<{ id: string; url: string; file: File }>
  >([]);
  const [gameImages, setGameImages] = useState<
    Array<{ id: string; url: string; file: File }>
  >([]);
  const [dragActive, setDragActive] = useState(false);
  const [gameDragActive, setGameDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gameFileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: e.target?.result as string,
          file: file,
        };
        setCarouselImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setCarouselImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeGameImage = (id: string) => {
    setGameImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleGameButtonClick = () => {
    gameFileInputRef.current?.click();
  };

  const handleGameDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setGameDragActive(true);
    } else if (e.type === "dragleave") {
      setGameDragActive(false);
    }
  };

  const handleGameDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGameDragActive(false);

    if (gameImages.length >= 5) {
      alert("Maximum 5 game images allowed");
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    handleGameFiles(files);
  };

  const handleGameFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (gameImages.length >= 5) {
        alert("Maximum 5 game images allowed");
        return;
      }
      const files = Array.from(e.target.files);
      handleGameFiles(files);
    }
  };

  const handleGameFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const remainingSlots = 5 - gameImages.length;
    const filesToAdd = imageFiles.slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: e.target?.result as string,
          file: file,
        };
        setGameImages((prev) => {
          if (prev.length < 5) {
            return [...prev, newImage];
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });

    if (imageFiles.length > remainingSlots) {
      alert(`Only ${remainingSlots} more image(s) can be added`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          App Details
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your app details and carousel images
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        {/* Notice Field */}
        <div>
          <label
            htmlFor="notice"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Notice
          </label>
          <textarea
            id="notice"
            rows={6}
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter your notice here..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter a large text notice for your app
          </p>
        </div>

        {/* Exchange Rate Field */}
        <div>
          <label
            htmlFor="exchangeRate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Exchange Rate
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              1 INR =
            </span>
            <input
              id="exchangeRate"
              type="number"
              step="0.01"
              min="0"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              className="flex-1 max-w-xs px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Brazilian Real
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Set the conversion rate from Indian Rupee to Brazilian Real
          </p>
        </div>

        {/* Smile Coin Rate Field */}
        <div>
          <label
            htmlFor="smileCoinRate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Smile Coin Rate
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              1 Brazilian Real =
            </span>
            <input
              id="smileCoinRate"
              type="number"
              step="0.01"
              min="0"
              value={smileCoinRate}
              onChange={(e) => setSmileCoinRate(e.target.value)}
              className="flex-1 max-w-xs px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Smile Coin
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Set the conversion rate from Brazilian Real to Smile Coin
          </p>
        </div>

        {/* Carousel Images Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Carousel Images
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Recommended dimension: 1920 x 1080 pixels
          </p>

          {/* Drag and Drop Area */}
          <div className="max-w-2xl mx-auto">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg overflow-hidden transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                  : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              }`}
              style={{ aspectRatio: "16/9" }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />

              {carouselImages.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <button
                        type="button"
                        onClick={handleButtonClick}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 font-medium"
                      >
                        Click to upload
                      </button>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={carouselImages[carouselImages.length - 1].url}
                    alt="Carousel preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleButtonClick}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
                      aria-label="Add more images"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(carouselImages[carouselImages.length - 1].id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3">
                    <p className="text-sm text-white font-medium">
                      {carouselImages.length} image{carouselImages.length !== 1 ? "s" : ""} uploaded
                    </p>
                    <p className="text-xs text-gray-300 mt-1 truncate">
                      {carouselImages[carouselImages.length - 1].file.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Pictures Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Game Pictures
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Upload up to 5 images (1080 x 1920 pixels - Vertical)
          </p>

          {/* Game Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => {
              const image = gameImages[index];
              return (
                <div
                  key={index}
                  onDragEnter={!image ? handleGameDrag : undefined}
                  onDragLeave={!image ? handleGameDrag : undefined}
                  onDragOver={!image ? handleGameDrag : undefined}
                  onDrop={!image ? handleGameDrop : undefined}
                  className={`relative aspect-[9/16] rounded-lg overflow-hidden border-2 transition-colors ${
                    !image
                      ? gameDragActive && gameImages.length < 5
                        ? "border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                        : "border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                      : "border-solid border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {!image ? (
                    <button
                      type="button"
                      onClick={handleGameButtonClick}
                      disabled={gameImages.length >= 5}
                      className="absolute inset-0 flex flex-col items-center justify-center p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        {index + 1}
                      </p>
                    </button>
                  ) : (
                    <div className="relative w-full h-full group">
                      <img
                        src={image.url}
                        alt={`Game picture ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGameImage(image.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        aria-label="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white truncate">
                          {image.file.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <input
            ref={gameFileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleGameFileInput}
            className="hidden"
          />

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {gameImages.length} of 5 images uploaded
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
