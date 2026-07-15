# Editor.tsx Refactoring Progress

**Goal**: Decompose 1,734-line monolithic component into 4-5 smaller components + custom hooks

**Original State**: 
- 1 file: `src/routes/editor.tsx` (1,734 lines)
- 19 useState hooks
- 7 useEffect hooks
- 45 total hooks

**Target State**:
- Multiple focused components (<400 lines each)
- Reusable custom hooks
- Presentational components with clear props

---

## Completed Steps

### ✅ Step 1: Extract Types & Constants
- **File**: `src/lib/inviteTypes.ts` (150 lines)
- **Moved**: All types, constants, and tour steps
- **Status**: DONE

### ✅ Step 2: Extract Utility Functions  
- **File**: `src/lib/inviteUtils.ts` (180 lines)
- **Moved**: All pure functions (blob conversion, normalization, persistence)
- **Status**: DONE

### ✅ Step 3: Create useInviteDraft Hook
- **File**: `src/hooks/useInviteDraft.ts` (85 lines)
- **Features**: 10 state fields + palette + draft object + image picker
- **Autosave**: Local storage (debounced 400ms)
- **Status**: DONE

### ✅ Step 4: Create useInviteAuth Hook
- **File**: `src/hooks/useInviteAuth.ts` (90 lines)
- **Features**: Auth listener, migration, fetch saved invites
- **Status**: DONE

### ✅ Step 5: Create useInviteTour Hook
- **File**: `src/hooks/useInviteTour.ts` (28 lines)
- **Features**: Tour state + auto-launch + close handler
- **Status**: DONE

### ✅ Step 6: Create useInviteVersions Hook
- **File**: `src/hooks/useInviteVersions.ts` (125 lines)
- **Features**: Save/load/delete versions, fetch from cloud
- **Status**: DONE

---

## TODO Steps

### ⏳ Step 5: Create useInviteExport Hook
- Export individual (PNG, JPG, PDF)
- Target: ~180 lines

### ⏳ Step 6: Create useBatchExport Hook
- Batch export + all batch UI state
- Target: ~280 lines

### ⏳ Step 9: Create Presentational Components
- EditorHeader.tsx
- EditorPreview.tsx
- EditorForm.tsx
- BatchExportModals.tsx
- Shared: Field.tsx, Section.tsx, OrnamentLine.tsx

### ⏳ Step 14: Refactor editor.tsx
- Remove all extracted code
- Import and compose all hooks + components
- Should be ~180 lines (layout only)

---

## Build Status

✅ `npm run build` - Passing  
✅ `npm run lint` - Passing (expected errors from original file)  
✅ TypeScript - No errors from new files

---

## Next Session

Priority order:
1. Create useInviteExport + useBatchExport hooks
2. Create presentational components
3. Refactor editor.tsx to use all new code
4. Test functionality end-to-end
5. Make commit

---

**Last Updated**: 2026-07-15  
**Progress**: 6 of 14 steps complete (43%)
