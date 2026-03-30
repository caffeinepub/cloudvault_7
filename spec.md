# Storage King

## Current State
- Dashboard shows a media grid via `MediaCard` components
- Each `MediaCard` has an individual delete button on hover
- No multi-select functionality exists
- `Dashboard.tsx` manages file listing, filtering, deletion, and upload

## Requested Changes (Diff)

### Add
- Multi-select mode for the media gallery
- Long-press (500ms) on any thumbnail enters selection mode
- Checkboxes appear on all thumbnails when in selection mode
- Tap/click to select/deselect individual files in selection mode
- "Select All" button appears in toolbar when in selection mode
- Bottom action bar appears when files are selected: shows count, Delete and Download buttons
- Cancel/exit selection mode button

### Modify
- `MediaCard` component: accept `isSelectionMode`, `isSelected`, `onSelect` props; show checkbox overlay when in selection mode
- `Dashboard.tsx`: manage selection state (`selectionMode`, `selectedFileNames` Set), handle bulk delete and bulk download

### Remove
- Nothing removed

## Implementation Plan
1. Update `MediaCard` to support selection mode with checkbox overlay and visual selected state
2. Add selection state management in `Dashboard` (`selectionMode: boolean`, `selectedFileNames: Set<string>`)
3. Add long-press handler in `MediaCard` to trigger entering selection mode (callback to parent)
4. Add "Select All" / count label in section header when in selection mode
5. Add sticky bottom action bar with file count, Delete All Selected, Download All Selected, and Cancel buttons
6. Bulk delete: iterate selectedFileNames and call deleteFile for each
7. Bulk download: iterate selectedFileNames and trigger file download for each via blob URL
