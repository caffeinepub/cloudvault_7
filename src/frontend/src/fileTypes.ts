// Extended FileType constants that augment the backend-generated enum.
// backend.ts is auto-generated and only knows about image/video;
// we add document and other here for frontend use.
export const FileType = {
  video: "video",
  image: "image",
  document: "document",
  other: "other",
} as const;

export type FileType = (typeof FileType)[keyof typeof FileType];
