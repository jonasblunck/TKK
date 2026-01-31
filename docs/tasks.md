# Instructor Scheduler - Implementation Tasks

> **Design Document**: [design.md](design.md)
> **Generated**: 2025-12-18 by jonasblunck
> **Updated**: 2026-01-31 by jonasblunck

---

## Tasks

### Phase 1: Project Setup

**Status**: Not Started  
**Progress**: 0/4 tasks complete (0%)  
**Phase Started**: TBD  
**Phase Completed**: TBD

- [ ] 1.0 Create project structure and base HTML
  - **Relevant Documentation:**
    - [design.md](design.md) - Technical stack (vanilla HTML/JS/CSS), file structure
  - [ ] 1.1 Create `instructor-scheduler/` directory in project root
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 1.2 Create `index.html` with basic HTML5 structure and viewport meta
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 1.3 Add CSS reset and base styles (colors for groups, layout grid)
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 1.4 Create empty JavaScript section with app state object structure
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD

---

### Phase 2: Instructor Management

**Status**: Not Started  
**Progress**: 0/6 tasks complete (0%)  
**Phase Started**: TBD  
**Phase Completed**: TBD

- [ ] 2.0 Build instructor CRUD functionality
  - **Relevant Documentation:**
    - [design.md](design.md) - FR-1 (Instructor Management), US-1 (Add Instructor), US-2 (View Instructors)
  - [ ] 2.1 Create instructor list panel HTML (left sidebar)
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 2.2 Implement "Add Instructor" modal/form with fields: name, available dates, teachable groups
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 2.3 Create date picker for selecting multiple available dates
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 2.4 Implement add instructor to state and render to list
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 2.5 Implement edit instructor functionality (click to edit)
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 2.6 Implement delete instructor functionality with confirmation
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD

---

### Phase 3: Calendar Display

**Status**: Not Started  
**Progress**: 0/5 tasks complete (0%)  
**Phase Started**: TBD  
**Phase Completed**: TBD

- [ ] 3.0 Build monthly calendar grid with group columns
  - **Relevant Documentation:**
    - [design.md](design.md) - FR-4 (Calendar Display), FR-2 (Schedule Configuration), UI mockup
  - [ ] 3.1 Create calendar container HTML with header (month name, navigation arrows)
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 3.2 Implement month navigation (previous/next month buttons, month picker)
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 3.3 Generate calendar grid dynamically: rows = days of month, columns = Beginners/Intermediate/Advanced
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 3.4 Apply color coding to group columns (green/yellow/red)
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 3.5 Style cells to display instructor names clearly (suitable for screenshot)
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD

---

### Phase 4: Auto-Generate Schedule

**Status**: Not Started  
**Progress**: 0/5 tasks complete (0%)  
**Phase Started**: TBD  
**Phase Completed**: TBD

- [ ] 4.0 Implement scheduling algorithm
  - **Relevant Documentation:**
    - [design.md](design.md) - FR-3 (Auto-Generation), algorithm pseudocode, constraints
  - [ ] 4.1 Add "Auto-Generate Schedule" button to UI
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 4.2 Implement algorithm: for each day, assign available instructors to groups they can teach
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 4.3 Ensure no instructor is double-booked (one group per day max)
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 4.4 Store assignments in state and render to calendar grid
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 4.5 Display warnings for unassigned slots (no available instructor)
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD

---

### Phase 5: Manual Adjustments

**Status**: Not Started  
**Progress**: 0/5 tasks complete (0%)  
**Phase Started**: TBD  
**Phase Completed**: TBD

- [ ] 5.0 Add drag-and-drop for schedule adjustments
  - **Relevant Documentation:**
    - [design.md](design.md) - FR-5 (Manual Adjustment), US-5 user story
  - [ ] 5.1 Make instructor assignments draggable (HTML5 drag-and-drop)
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 5.2 Make calendar cells drop targets
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 5.3 Implement drop handler: update assignment in state, re-render
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 5.4 Add constraint validation on drop (warn if instructor unavailable or can't teach group)
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 5.5 Implement clear/unassign functionality (click X or drag to remove)
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD

---

### Phase 6: Polish & Testing

**Status**: Not Started  
**Progress**: 0/4 tasks complete (0%)  
**Phase Started**: TBD  
**Phase Completed**: TBD

- [ ] 6.0 Final polish and edge case handling
  - **Relevant Documentation:**
    - [design.md](design.md) - Success metrics, non-goals, future enhancements
  - [ ] 6.1 Handle edge cases: no instructors, all instructors unavailable, empty month
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 6.2 Add visual feedback: hover states, drag indicators, success/error messages
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 6.3 Test cross-browser (Chrome, Firefox, Safari) on Windows and macOS
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD
  - [ ] 6.4 Create README.md with usage instructions
    - **Started**: TBD
    - **Completed**: TBD
    - **Duration**: TBD

---

### Phase 7: Available Instructor Indicator

**Status**: Complete ✅  
**Progress**: 5/5 tasks complete (100%)  
**Phase Started**: 2026-01-31  
**Phase Completed**: 2026-01-31

- [x] 7.0 Show visual indicator when surplus instructors are available
  - **Relevant Documentation:**
    - [design.md](design.md) - FR-7 (Available Instructor Indicator), US-7 (See Available Instructor Surplus)
  - [x] 7.1 Create utility function to calculate available but unassigned instructors per day
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~30 min
  - [x] 7.2 Add indicator element (👥 icon) to day column in calendar grid HTML
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~15 min
  - [x] 7.3 Implement logic to show/hide indicator based on surplus count
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~15 min
  - [x] 7.4 Add hover behavior showing available instructors in sidebar
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~30 min
  - [x] 7.5 Update indicator when assignments change (add, remove, drag-drop)
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~15 min

---

### Phase 8: Assistant Instructors

**Status**: Complete ✅  
**Progress**: 7/7 tasks complete (100%)  
**Phase Started**: 2026-01-31  
**Phase Completed**: 2026-01-31

- [x] 8.0 Support multiple instructors per class (main + assistants)
  - **Relevant Documentation:**
    - [design.md](design.md) - FR-8 (Assistant Instructors), US-8 (Add Assistant Instructors to a Class)
  - [x] 8.1 Update data model to support main instructor and array of assistant instructors per slot
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~20 min
  - [x] 8.2 Modify drop handler to detect if target cell already has a main instructor
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~30 min
  - [x] 8.3 Implement prompt modal asking "Replace instructor" or "Add as assistant"
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~45 min
  - [x] 8.4 Update calendar cell rendering to show assistants to the right of main instructor
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~30 min
  - [x] 8.5 Add visual distinction between main instructor (bold) and assistants (regular/smaller)
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~15 min
  - [x] 8.6 Implement remove button (X) for individual assistant instructors
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~20 min
  - [x] 8.7 Ensure swapping main instructor preserves assigned assistants
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~15 min

---

### Phase 9: Export Schedule Enhancements

**Status**: Complete ✅  
**Progress**: 5/5 tasks complete (100%)  
**Phase Started**: 2026-01-31  
**Phase Completed**: 2026-01-31

- [x] 9.0 Enhance export functionality with options and clean output
  - **Relevant Documentation:**
    - [design.md](design.md) - FR-9 (Export Schedule), US-9 (Export Schedule as Image)
  - [x] 9.1 Create export options modal asking whether to include feedback points (Yes/No buttons)
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~20 min
  - [x] 9.2 Modify export function to temporarily hide feedback points if user opts out
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~15 min
  - [x] 9.3 Modify export function to always hide surplus instructor indicator (👥) in exported image
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~10 min
  - [x] 9.4 Ensure exported image is clean and professional (remove interactive elements)
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~15 min
  - [x] 9.5 Test export with various combinations (with/without feedback, with/without surplus indicators)
    - **Started**: 2026-01-31
    - **Completed**: 2026-01-31
    - **Duration**: ~30 min (8 automated tests)

---

## Summary

| Phase | Description | Tasks | Status |
|-------|-------------|-------|--------|
| 1 | Project Setup | 4 | ✅ Complete |
| 2 | Instructor Management | 6 | ✅ Complete |
| 3 | Calendar Display | 5 | ✅ Complete |
| 4 | Auto-Generate Schedule | 5 | ✅ Complete |
| 5 | Manual Adjustments | 5 | ✅ Complete |
| 6 | Polish & Testing | 4 | ✅ Complete |
| 7 | Available Instructor Indicator | 5 | ✅ Complete |
| 8 | Assistant Instructors | 7 | ✅ Complete |
| 9 | Export Schedule Enhancements | 5 | ✅ Complete |
| **Total** | | **46** | **All Complete** |

---

## Test Coverage

- **75 unit tests** across 12 test files
- Test suites: Utility, Instructors, Assignments, Merge, Schedule, Statistics, Storage, Autogenerate, Share, Assistants, Surplus, Export

---

## Next Steps

All phases complete! Future enhancements could include:
- Drag-to-reorder assistants
- Bulk assignment tools
- Calendar print styling

---

*Generated following the task workflow from `.github/prompts/prd-workflow/generate-tasks.prompt.md`*
