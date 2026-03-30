import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, ImageIcon, Upload, Video } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useUploadFile } from "../hooks/useQueries";

interface UploadDropzoneProps {
  onSuccess?: () => void;
}

export default function UploadDropzone({ onSuccess }: UploadDropzoneProps) {
  const uploadMutation = useUploadFile();
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadingName, setUploadingName] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      setUploadingName(file.name);
      setProgress(0);
      try {
        await uploadMutation.mutateAsync({
          file,
          onProgress: (pct) => setProgress(pct),
        });
        toast.success(`${file.name} uploaded successfully`);
        onSuccess?.();
      } catch {
        toast.error("Upload failed. Please try again.");
      } finally {
        setUploadingName(null);
        setProgress(0);
      }
    },
    [uploadMutation, onSuccess],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleBrowse = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar,.csv,.xlsx";
    input.onchange = (e) => handleFiles((e.target as HTMLInputElement).files);
    input.click();
  };

  return (
    <div
      className={`rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
        isDragging
          ? "border-primary bg-accent/30"
          : "border-border bg-muted/40 hover:border-primary/40 hover:bg-accent/20"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      data-ocid="upload.dropzone"
    >
      {uploadingName ? (
        <div className="space-y-4" data-ocid="upload.loading_state">
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 mx-auto flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary animate-bounce" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Uploading {uploadingName}...
          </p>
          <Progress value={progress} className="h-1.5 max-w-xs mx-auto" />
          <p className="text-xs text-muted-foreground">{progress}%</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Drag & drop files here
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports photos, videos, and documents · Click below to browse
            </p>
          </div>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
            onClick={handleBrowse}
            data-ocid="upload.upload_button"
          >
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
        </div>
      )}
    </div>
  );
}
