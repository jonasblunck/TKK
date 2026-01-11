# Instructor Scheduler

A simple, local scheduling app for assigning instructors to training groups.

## Quick Start

1. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge)
2. That's it - no installation or server required!

## Features

- **Add Instructors**: Enter name, select teachable groups (Beginners/Intermediate/Advanced), pick available dates
- **Monthly Calendar**: View and navigate by month
- **Auto-Generate**: One-click schedule generation respecting all constraints
- **Drag and Drop**: Manually adjust assignments by dragging
- **Constraint Warnings**: Get warned when assignments violate availability or group preferences

## Usage

### Adding Instructors

1. Click **+ Add** in the Instructors sidebar
2. Enter the instructor's name
3. Check which groups they can teach
4. Click dates in the calendar to mark availability
5. Click **Save**

### Generating a Schedule

1. Add at least one instructor
2. Navigate to the month you want to schedule
3. Click **Auto-Generate Schedule**
4. The algorithm assigns instructors respecting:
   - Their available dates
   - Groups they can teach
   - One group per instructor per day (no double-booking)

### Manual Adjustments

- **Drag from sidebar**: Drag an instructor card onto a calendar cell
- **Drag within calendar**: Move an assignment to a different slot
- **Remove assignment**: Click on an assigned name, then confirm removal

### Sharing

Take a screenshot of the calendar to share the schedule.

## Constraints

- One time slot per day (all three groups run simultaneously)
- Each instructor can only teach ONE group per day
- Instructors can only be assigned to groups they're qualified for
- Instructors can only be assigned on dates they're available

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Works on Windows and macOS.

## Data

Data is stored in browser memory only (session storage). Refreshing the page will clear all data. This is a demo/prototype - for persistent storage, a future version would add local storage or file export.

---

*Part of the AI-First training materials*
