import { useState, useEffect } from "react";
import { resolveStorageUrl } from "../../utils/media";

export default function UserAvatar({
  name,
  avatar,
  size = "md",
  className = "",
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatar]);

  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-20 h-20 text-xl",
  };

  const fallbackInitial = (name || "?").trim().charAt(0).toUpperCase();
  const normalizedAvatar = resolveStorageUrl(avatar);

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full bg-white/20 text-white font-bold ring-1 ring-white/30 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {normalizedAvatar && !imageFailed ? (
        <img
          src={normalizedAvatar}
          alt={name || "User avatar"}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{fallbackInitial}</span>
      )}
    </div>
  );
}

