import React, { useState, useEffect } from "react";

interface AvatarProps {
  src: string; // URL of the avatar image
  alt?: string; // Alt text for the avatar
  size?: "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge"; // Avatar size
  status?: "online" | "offline" | "busy" | "none"; // Status indicator
  name?: string; // Name for generating initials placeholder
}

const sizeClasses = {
  xsmall: "h-6 w-6 max-w-6",
  small: "h-8 w-8 max-w-8",
  medium: "h-10 w-10 max-w-10",
  large: "h-12 w-12 max-w-12",
  xlarge: "h-14 w-14 max-w-14",
  xxlarge: "h-16 w-16 max-w-16",
};

const textSizeClasses = {
  xsmall: "text-xs",
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
  xlarge: "text-xl",
  xxlarge: "text-2xl",
};

const statusSizeClasses = {
  xsmall: "h-1.5 w-1.5 max-w-1.5",
  small: "h-2 w-2 max-w-2",
  medium: "h-2.5 w-2.5 max-w-2.5",
  large: "h-3 w-3 max-w-3",
  xlarge: "h-3.5 w-3.5 max-w-3.5",
  xxlarge: "h-4 w-4 max-w-4",
};

const statusColorClasses = {
  online: "bg-success-500",
  offline: "bg-error-400",
  busy: "bg-warning-500",
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User Avatar",
  size = "medium",
  status = "none",
  name,
}) => {
  const [showPlaceholder, setShowPlaceholder] = useState(!src || src.trim() === "");
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    const hasValidSrc = src && src.trim() !== "";
    setShowPlaceholder(!hasValidSrc);
    setHasTriedFallback(false);
  }, [src]);

  const handleImageError = () => {
    if (!hasTriedFallback && src && src.includes('googleusercontent.com')) {
      // Try to load the image without size parameter for Google URLs
      const urlWithoutSize = src.replace(/=s\d+-c$/, '');
      if (urlWithoutSize !== src) {
        setHasTriedFallback(true);
        // Force re-render with new URL by updating the key
        return;
      }
    }
    // Show placeholder if image fails to load
    setShowPlaceholder(true);
  };

  const getInitials = (name?: string) => {
    if (!name || name === "—") return "?";
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const getBackgroundColor = (name?: string) => {
    if (!name || name === "—") return "bg-gray-400";
    
    // Generate a consistent color based on the name
    const colors = [
      "bg-blue-500",
      "bg-green-500", 
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // If no valid src or placeholder should be shown
  if (showPlaceholder || !src || src.trim() === "") {
    return (
      <div className={`relative rounded-full ${sizeClasses[size]}`}>
        <div className={`flex items-center justify-center rounded-full w-full h-full text-white font-medium ${getBackgroundColor(name)} ${textSizeClasses[size]}`}>
          {getInitials(name)}
        </div>
        
        {/* Status Indicator */}
        {status !== "none" && (
          <span
            className={`absolute bottom-0 right-0 rounded-full border-[1.5px] border-white dark:border-gray-900 ${
              statusSizeClasses[size]
            } ${statusColorClasses[status] || ""}`}
          ></span>
        )}
      </div>
    );
  }

  // Try to show image
  const imgSrc = hasTriedFallback && src.includes('googleusercontent.com') 
    ? src.replace(/=s\d+-c$/, '') 
    : src;

  return (
    <div className={`relative rounded-full ${sizeClasses[size]}`}>
      <img 
        key={`${imgSrc}-${hasTriedFallback}`} // Force re-render when trying fallback
        src={imgSrc} 
        alt={alt} 
        className="object-cover rounded-full w-full h-full" 
        onError={handleImageError}
        crossOrigin="anonymous"
      />

      {/* Status Indicator */}
      {status !== "none" && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-[1.5px] border-white dark:border-gray-900 ${
            statusSizeClasses[size]
          } ${statusColorClasses[status] || ""}`}
        ></span>
      )}
    </div>
  );
};

export default Avatar;
