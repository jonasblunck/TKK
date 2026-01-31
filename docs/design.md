# Instructor Scheduler - Design Document

> **Purpose**: A minimal local scheduling app for assigning instructors to training groups based on availability.

**Last Updated**: 2026-01-31 by jonasblunck

---

## 1. Introduction/Overview

A single admin user needs to schedule instructors for training sessions across three skill-level groups (Beginners, Intermediate, Advanced). The app should auto-generate an optimal schedule based on instructor availability and group assignments, while allowing manual adjustments. The output is a calendar view that can be screen-captured for sharing.

This is a **demo/prototype** - no authentication, no backend, session-only data storage.

---

## 2. Goals

| Goal | Success Criteria |
|------|------------------|
| Quick instructor entry | Add instructor with name, availability, teachable groups in < 30 seconds |
| Auto-schedule generation | One-click generates valid schedule respecting all constraints |
| Manual adjustments | Drag-and-drop to reassign after auto-generation |
| Visual output | Calendar view suitable for print-screen sharing |
| Cross-platform | Works on Windows and macOS in any modern browser |

---

## 3. User Stories

### US-1: Add Instructor

> As an admin, I want to add an instructor with their name, available dates, and which groups they can teach, so that the system knows who is available for scheduling.

**Acceptance Criteria**:

- Form to enter instructor name (required)
- Date picker to select available dates (multi-select)
- Checkboxes to select teachable groups (Beginners, Intermediate, Advanced)
- Instructor appears in instructor list after saving

### US-2: View Instructors

> As an admin, I want to see a list of all instructors and their details, so that I can review and edit the team.

**Acceptance Criteria**:

- List shows all instructors with name, availability summary, and groups
- Can edit or delete any instructor
- Changes reflect immediately

### US-3: Auto-Generate Schedule

> As an admin, I want to click a button to auto-generate a schedule that assigns available instructors to groups, so that I don't have to manually figure out assignments.

**Acceptance Criteria**:

- Single button triggers auto-generation
- Algorithm assigns instructors to groups respecting:
  - Instructor availability (only scheduled on available dates)
  - Instructor group preferences (only assigned to groups they can teach)
  - No double-booking (one instructor per group per time slot)
- Shows error/warning if constraints can't be satisfied

### US-4: View Schedule Calendar

> As an admin, I want to see the schedule as a calendar view, so that I can visualize assignments and take a screenshot to share.

**Acceptance Criteria**:

- Calendar shows dates on one axis, groups on the other
- Each cell shows assigned instructor name
- Color-coding by group (Beginners = green, Intermediate = yellow, Advanced = red)
- Clean visual suitable for print-screen

### US-5: Manually Adjust Schedule

> As an admin, I want to drag and drop assignments to make manual changes, so that I can override the auto-generated schedule when needed.

**Acceptance Criteria**:

- Can drag an instructor assignment to a different cell
- Can swap two instructors by dragging one onto a cell that already has an instructor assigned
- System warns if move/swap violates constraints (instructor not available, can't teach that group)
- Can still proceed with warning (override)
- Can clear/unassign a cell

### US-6: Add Class Details and Feedback Points

> As an admin, I want to add focus areas and feedback points to each class slot, so that instructors know what to cover and what specific skills to provide feedback on.

**Acceptance Criteria**:

- Can double-click on any calendar cell to open the class details modal
- Can enter a class focus/description (what the class will cover)
- Can enter feedback points (specific areas instructors should focus their feedback on)
- Feedback points are indicated with a 📝 icon in the calendar when present
- Both fields are optional and can be edited at any time

### US-7: See Available Instructor Surplus

> As an admin, I want to see at a glance which days have more available instructors than currently assigned, so that I can identify scheduling flexibility or opportunities to add assistant instructors.

**Acceptance Criteria**:

- Each day row displays an indicator when unassigned instructors are still available
- Indicator shows a visual icon (e.g., 👥 or ➕) in the day column
- Hovering over the indicator shows a tooltip with the count of additional available instructors
- Indicator only appears when at least one instructor is available but not yet assigned to any group that day

### US-8: Add Assistant Instructors to a Class

> As an admin, I want to add one or more assistant instructors to a class alongside the main instructor, so that classes requiring more support have adequate staffing.

**Acceptance Criteria**:

- When dragging an instructor onto a slot that already has an instructor assigned, a prompt appears asking whether to:
  - **Replace** the current instructor (existing behavior)
  - **Add as assistant** (new behavior)
- Assistant instructors are displayed to the right of the main instructor in the calendar cell
- Visual distinction between main instructor and assistants (e.g., main instructor in bold, assistants in regular text or with a smaller font)
- Can remove individual assistant instructors without affecting the main instructor
- Can have multiple assistant instructors per class (no hard limit)
- Constraint validation still applies to assistant instructors (availability and group preferences)
- Swapping the main instructor does not affect assigned assistants

---

## 4. Functional Requirements

### FR-1: Instructor Management

1. The system must allow adding an instructor with:
   - Name (text, required)
   - Available dates (list of dates, at least one required)
   - Teachable groups (checkboxes: Beginners, Intermediate, Advanced - at least one required)

2. The system must display all instructors in a list view

3. The system must allow editing any instructor's details

4. The system must allow deleting an instructor

### FR-2: Schedule Configuration

5. The system must allow selecting a month to schedule (month picker)

6. The system must display all days of the selected month in the calendar

7. The system must use three fixed groups: Beginners, Intermediate, Advanced

8. All three groups run simultaneously each day (one time slot)

### FR-3: Auto-Generation

9. The system must auto-generate a schedule with one button click

10. The algorithm must respect instructor availability constraints

11. The algorithm must respect instructor group preferences

12. The algorithm must not double-book instructors (one group per instructor per day - cannot teach multiple groups simultaneously)

13. The system must display warnings for unassigned slots (no available instructor)

### FR-4: Calendar Display

14. The system must display schedule as a monthly calendar grid

15. Calendar must show dates as rows and groups as columns

16. Each assignment must display the instructor name

17. Groups must be color-coded for visual distinction

18. User must be able to navigate between months

### FR-5: Manual Adjustment

19. The system must allow drag-and-drop to move assignments

20. The system must allow drag-and-drop to swap two instructors when dropping onto an occupied slot

21. The system must allow clicking to clear/unassign a slot

22. The system must warn (not block) when a move or swap violates constraints

23. The system must validate both instructors' constraints when performing a swap

### FR-6: Class Details and Feedback

24. The system must allow adding a focus/description to each class slot

25. The system must allow adding feedback points to each class slot (specific areas for instructor feedback)

26. The system must display a visual indicator (📝) when feedback points are present

27. Both focus/description and feedback points must be saved with the schedule

### FR-7: Available Instructor Indicator

28. The system must calculate the number of available instructors per day who are not assigned to any group

29. The system must display a visual indicator (👥 or ➕) in the day column when surplus instructors are available

30. The system must show the count of additional available instructors on hover (tooltip)

31. The indicator must only appear when at least one unassigned instructor is available for that day

### FR-8: Assistant Instructors

32. The system must support multiple instructors per class slot (one main instructor + zero or more assistants)

33. When dropping an instructor onto an occupied slot, the system must prompt the user to choose between replacing the main instructor or adding as assistant

34. The system must display assistant instructors to the right of the main instructor in the calendar cell

35. The system must visually distinguish between main instructor and assistant instructors (e.g., bold vs regular text, size difference, or separator)

36. The system must allow removing individual assistant instructors independently

37. The system must validate assistant instructor constraints (availability and group preferences) with warnings (not blocking)

38. The system must preserve assistant instructors when the main instructor is swapped or replaced

---

## 5. Non-Goals (Out of Scope)

The following are explicitly **NOT** included in this version:

- ❌ User authentication or login
- ❌ Persistent storage (data resets on browser refresh)
- ❌ Multiple admins or user roles
- ❌ Backend server or database
- ❌ Export to file (PDF, Excel, etc.)
- ❌ Time-of-day scheduling (AM/PM slots) - just dates
- ❌ Recurring schedules
- ❌ Instructor capacity limits (teaching multiple groups same day)
- ❌ Mobile-optimized responsive design
- ❌ Undo/redo functionality
- ❌ Notifications or reminders

---

## 6. Design Considerations

### UI Layout

```
+--------------------------------------------------+
|  INSTRUCTOR SCHEDULER          [< Jan 2025 >]    |
+--------------------------------------------------+
|                                                  |
|  [+ Add Instructor]  [Auto-Generate Schedule]    |
|                                                  |
+------------------------+-------------------------+
|  INSTRUCTORS           |  JANUARY 2025           |
|------------------------|-------------------------|
|  • Alice               |      | Beg | Int | Adv  |
|    Jan 6-10, 13-17     |------|-----|-----|------|
|    [Beg] [Int]         |Mon 6 | Bob |Alice|      |
|                        |Tue 7 |Alice| Bob | Bob  |
|  • Bob                 |Wed 8👥| Bob |Alice|Alice |
|    Jan 6-31            |      |     |+Carl|      |
|    [Beg] [Int] [Adv]   |  ... |     |     |      |
|                        |Fri31 | Bob |Alice| Bob  |
+------------------------+-------------------------+

Legend:
- 👥 = Additional instructors available (hover for count)
- +Carl = Assistant instructor (shown to right/below main)
```

### Color Coding

- Beginners: Green (`#4CAF50`)
- Intermediate: Yellow/Orange (`#FF9800`)
- Advanced: Red (`#F44336`)

### Interaction Patterns

- **Add Instructor**: Modal or slide-out form
- **Edit Instructor**: Click on instructor in list
- **Drag-and-Drop**: Drag instructor name between calendar cells
- **Clear Assignment**: Click "X" on assigned cell or drag to trash
- **Add Assistant**: Drag instructor to occupied cell → prompt appears → choose "Add as Assistant"
- **Remove Assistant**: Click "X" next to assistant name in cell
- **Available Surplus**: Hover over 👥 icon to see tooltip with count of available instructors

---

## 7. Technical Considerations

### Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Frontend | Single HTML file with vanilla JS or React | Cross-platform, no build required for vanilla |
| Styling | Tailwind CSS (CDN) or simple CSS | Quick styling, no build step |
| Calendar | Custom grid or lightweight library (e.g., FullCalendar lite) | Simple requirements |
| Drag-and-drop | Native HTML5 drag-and-drop or lightweight library | Avoid dependencies |
| Data storage | JavaScript in-memory (session only) | Simplest approach per requirements |

### Recommended Approach

**Option A - Vanilla (Simplest)**:

- Single `index.html` with inline CSS and JS
- No build tools, open directly in browser
- Best for "quick to produce"

**Option B - React (More maintainable)**:

- Vite + React for quick setup
- Component-based for easier extension
- Requires `npm install` but works cross-platform

### File Structure (Vanilla)

```
instructor-scheduler/
  index.html      # Single file with HTML, CSS, JS
  README.md       # How to run
```

### Auto-Generation Algorithm

Simple greedy assignment:

```
for each date in schedule range:
  for each group in [Beginners, Intermediate, Advanced]:
    find instructors who:
      - are available on this date
      - can teach this group
      - are not already assigned to another group this date
    assign first available instructor (or random for variety)
```

---

## 8. Success Metrics

Since this is a local demo, success is qualitative:

| Metric | Target |
|--------|--------|
| Time to add instructor | < 30 seconds |
| Time to generate schedule | < 1 second (instant) |
| Usability | Admin can use without instructions |
| Visual clarity | Calendar screenshot is immediately understandable |

---

## 9. Clarified Constraints

| Constraint | Decision |
|------------|----------|
| Time slots per day | One slot - all three groups run simultaneously |
| Instructor per day | One group max (cannot be in two places at once) |
| Schedule duration | Monthly - user picks which month to plan |
| Future persistence | Out of scope for MVP; consider local storage later |

---

## 10. Future Enhancements (Post-MVP)

If this prototype proves useful, consider:

- Local storage persistence (survives refresh)
- Export schedule to JSON/CSV
- Import instructor list from file
- Time-of-day slots (AM/PM or hourly)
- Conflict resolution suggestions
- Print-friendly CSS

---

## 11. Help System

The app includes a built-in help modal accessible via the ❓ button in the header. This provides users with instructions on how to use all features.

### Help Content Location

The help content is defined in `src/index.html` within the `#helpModal` element.

### ⚠️ Maintenance Requirement

**When adding new features, always update the help modal content to include:**
- What the feature does
- How to access/use it
- Any relevant tips or notes

This ensures users can discover and understand new functionality without external documentation.

