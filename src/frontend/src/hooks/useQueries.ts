import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob, type FileMeta, type UserProfile } from "../backend";
import { FileType } from "../fileTypes";
import { useActor } from "./useActor";

export function useListFiles() {
  const { actor, isFetching } = useActor();
  return useQuery<FileMeta[]>({
    queryKey: ["files"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.register(username);
      await actor.saveCallerUserProfile({ username });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useUploadFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Not connected");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mimeType = file.type.toLowerCase();
      let fileType: FileType;
      if (mimeType.startsWith("video/")) {
        fileType = FileType.video;
      } else if (mimeType.startsWith("image/")) {
        fileType = FileType.image;
      } else if (
        mimeType === "application/pdf" ||
        mimeType.includes("word") ||
        mimeType.includes("document") ||
        mimeType === "text/plain" ||
        mimeType === "text/csv"
      ) {
        fileType = FileType.document;
      } else {
        fileType = FileType.other;
      }
      let externalBlob = ExternalBlob.fromBytes(bytes);
      if (onProgress) {
        externalBlob = externalBlob.withUploadProgress(onProgress);
      }
      // Cast needed: backend type declaration only knows image/video,
      // but the deployed canister accepts all four variants.
      await actor.uploadFile(file.name, fileType as any, externalBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useDeleteFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileName: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteFile(fileName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}
