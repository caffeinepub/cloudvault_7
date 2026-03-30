import { Archive, File, FileText, Play, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { FileMeta } from "../backend";
import { FileType } from "../fileTypes";

interface MediaCardProps {
  file: FileMeta;
  index: number;
  onClick: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

function getDocIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") {
    return {
      icon: <FileText className="w-8 h-8 text-rose-400" />,
      bg: "bg-rose-500/15",
      badge: "PDF",
      badgeColor: "bg-rose-500/80",
    };
  }
  if (ext === "doc" || ext === "docx") {
    return {
      icon: <FileText className="w-8 h-8 text-blue-400" />,
      bg: "bg-blue-500/15",
      badge: ext.toUpperCase(),
      badgeColor: "bg-blue-500/80",
    };
  }
  if (ext === "txt") {
    return {
      icon: <FileText className="w-8 h-8 text-slate-400" />,
      bg: "bg-slate-500/15",
      badge: "TXT",
      badgeColor: "bg-slate-500/80",
    };
  }
  if (ext === "zip" || ext === "rar") {
    return {
      icon: <Archive className="w-8 h-8 text-yellow-400" />,
      bg: "bg-yellow-500/15",
      badge: ext.toUpperCase(),
      badgeColor: "bg-yellow-500/80",
    };
  }
  return {
    icon: <File className="w-8 h-8 text-muted-foreground" />,
    bg: "bg-muted",
    badge: ext ? ext.toUpperCase() : "FILE",
    badgeColor: "bg-muted-foreground/60",
  };
}

export default function MediaCard({
  file,
  index,
  onClick,
  onDelete,
  isDeleting,
}: MediaCardProps) {
  const [hovered, setHovered] = useState(false);
  const ft = file.fileType as string;
  const isVideo = ft === FileType.video;
  const isDocument = ft === FileType.document || ft === FileType.other;
  const url = file.blob.getDirectURL();

  const docInfo = isDocument ? getDocIcon(file.fileName) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.22 }}
      className="relative rounded-xl overflow-hidden border border-border shadow-card group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-ocid={`media.item.${index + 1}`}
    >
      {/* Thumbnail */}
      <button
        type="button"
        className="aspect-square w-full overflow-hidden block cursor-pointer bg-muted"
        onClick={onClick}
        aria-label={`View ${file.fileName}`}
      >
        {isDocument && docInfo ? (
          <div className="w-full h-full flex items-center justify-center relative">
            <div
              className={`w-14 h-14 rounded-2xl ${docInfo.bg} flex items-center justify-center`}
            >
              {docInfo.icon}
            </div>
            <div
              className={`absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] text-white font-semibold ${docInfo.badgeColor}`}
            >
              {docInfo.badge}
            </div>
          </div>
        ) : isVideo ? (
          <div className="w-full h-full relative">
            {/* biome-ignore lint/a11y/useMediaCaption: user content */}
            <video
              src={url}
              className="w-full h-full object-cover opacity-50"
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(11,18,32,0.65)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
            </div>
            <div
              className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] text-white font-semibold"
              style={{ background: "rgba(11,18,32,0.7)" }}
            >
              VIDEO
            </div>
          </div>
        ) : (
          <img
            src={url}
            alt={file.fileName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}
      </button>

      {/* Hover overlay with delete */}
      {(hovered || isDeleting) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2"
        >
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-destructive flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            data-ocid={`media.delete_button.${index + 1}`}
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive-foreground" />
          </button>
        </motion.div>
      )}

      {/* Footer */}
      <button
        type="button"
        className="px-2.5 py-2 w-full text-left bg-card"
        onClick={onClick}
      >
        <p className="text-xs font-semibold text-foreground truncate">
          {file.fileName}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {new Date(
            Number(file.uploadDate / BigInt(1_000_000)),
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </button>
    </motion.div>
  );
}
