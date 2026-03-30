# CloudVault – Full Document & File Support

## Current State
CloudVault supports user auth (username/password), per-user file storage, upload, gallery grid, and file detail view. Currently only `image` and `video` FileTypes are supported. UploadDropzone only accepts `image/*,video/*`. MediaCard only renders images/videos. MediaDetailModal only previews images/videos.

## Requested Changes (Diff)

### Add
- `document` and `other` variants to `FileType` enum in Motoko backend
- Support for PDF, DOC, DOCX, TXT, ZIP file uploads
- File type icons for documents and other files in MediaCard
- PDF inline preview (iframe) in MediaDetailModal
- Document download button for non-previewable files
- "Documents & Files" filter tab in Dashboard sidebar and mobile pills
- File rename functionality (optional, frontend only via rename modal)
- Dashboard section labeling: Photos & Videos / Documents & Files

### Modify
- `FileType` enum: add `#document` and `#other` variants
- `UploadDropzone`: accept all supported file types, detect type correctly
- `useUploadFile` hook: map MIME types to new FileType variants
- `MediaCard`: render document icons (PDF, DOC, TXT, ZIP) with colored badge
- `MediaDetailModal`: handle document preview (PDF iframe, download for others)
- `Dashboard`: update filter type and sidebar items to include documents

### Remove
- Nothing

## Implementation Plan
1. Update `main.mo` FileType to add `#document` and `#other`
2. Update `useQueries.ts` uploadFile to detect document/other MIME types
3. Update `UploadDropzone` to accept all file types and display correct icons
4. Update `MediaCard` to render file-type icons (FileText, Archive, etc.) for documents/other
5. Update `MediaDetailModal` to show PDF iframe preview or download link for docs
6. Update `Dashboard` filter to add `documents` tab; update sidebar, mobile pills, empty state messaging
