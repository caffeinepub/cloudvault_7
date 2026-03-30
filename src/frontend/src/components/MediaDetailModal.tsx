import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Archive,
  Calendar,
  Download,
  File,
  FileText,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { FileMeta } from "../backend";
import { FileType } from "../fileTypes";

interface MediaDetailModalProps {
  file: FileMeta | null;
  onClose: () => void;
  onDelete: (fileName: string) => void;
  isDeleting?: boolean;
}

function DocPreview({ fileName, url }: { fileName: string; url: string }) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (ext === "pdf") {
    return (
      <iframe
        src={url}
        title={fileName}
        className="w-full h-[60vh] rounded-lg border-0"
      />
    );
  }

  let icon = <File className="w-16 h-16 text-muted-foreground" />;
  let label = "File";
  let iconBg = "bg-muted";

  if (ext === "doc" || ext === "docx") {
    icon = <FileText className="w-16 h-16 text-blue-400" />;
    label = "Word Document";
    iconBg = "bg-blue-500/10";
  } else if (ext === "txt") {
    icon = <FileText className="w-16 h-16 text-slate-400" />;
    label = "Text File";
    iconBg = "bg-slate-500/10";
  } else if (ext === "zip" || ext === "rar") {
    icon = <Archive className="w-16 h-16 text-yellow-400" />;
    label = "Archive";
    iconBg = "bg-yellow-500/10";
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <div
        className={`w-24 h-24 rounded-2xl ${iconBg} flex items-center justify-center`}
      >
        {icon}
      </div>
      <div className="text-center">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Click the download button above to open this file
        </p>
      </div>
    </div>
  );
}

export default function MediaDetailModal({
  file,
  onClose,
  onDelete,
  isDeleting,
}: MediaDetailModalProps) {
  if (!file) return null;

  const ft = file.fileType as string;
  const isVideo = ft === FileType.video;
  const isDocument = ft === FileType.document || ft === FileType.other;
  const url = file.blob.getDirectURL();
  const dateStr = new Date(
    Number(file.uploadDate / BigInt(1_000_000)),
  ).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AnimatePresence>
      {file && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
          data-ocid="media.modal"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="rounded-2xl shadow-card overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col border border-border"
            style={{ background: "oklch(0.19 0.038 248)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="min-w-0">
                <h2 className="font-semibold text-foreground truncate">
                  {file.fileName}
                </h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {dateStr}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={url}
                    download={file.fileName}
                    data-ocid="media.detail.download_button"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={isDeleting}
                      data-ocid="media.detail.delete_button"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    className="bg-card border-border"
                    data-ocid="media.detail.dialog"
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">
                        Delete file?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        "{file.fileName}" will be permanently deleted. This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="bg-muted border-border hover:bg-accent"
                        data-ocid="media.detail.cancel_button"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onDelete(file.fileName)}
                        data-ocid="media.detail.confirm_button"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  data-ocid="media.detail.close_button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Media / Document preview */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/30 min-h-[300px]">
              {isDocument ? (
                <DocPreview fileName={file.fileName} url={url} />
              ) : isVideo ? (
                // biome-ignore lint/a11y/useMediaCaption: user-uploaded video
                <video
                  src={url}
                  controls
                  autoPlay={false}
                  className="max-w-full max-h-[60vh] rounded-lg"
                />
              ) : (
                <img
                  src={url}
                  alt={file.fileName}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
