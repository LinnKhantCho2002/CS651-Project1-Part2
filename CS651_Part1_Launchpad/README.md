# Roomwise — CS651 Project 1, Part 1

A practical room-planning startup frontend, adapted from Sean Farmer's original Launchpad project. Original source history and attribution are preserved. Starting commit: `82c27a93732492ce02729c2b7e98d18584c4138d`.

## Run locally

From `CS651_Part1_Launchpad`:

```sh
npm ci
npm run build
npm start
```

Open http://localhost:3000. The esbuild build writes `dist/`; the Node preview serves it on port 3000. A prebuilt dist is included. Dependencies are pinned in package.json and package-lock.json.

## Demonstrate the App

1. Open App and compare the sample room photo with its prepared floor plan.
2. Drag a furniture piece, or select it and use arrow keys / movement buttons. Arrow movements are 10 cm in the approximate plan.
3. Rotate it 90 degrees and edit its width/depth. Watch the overlap and door-area checks update.
4. Enter a known sofa width to rescale the sample plan. Other room/furniture dimensions remain editable estimates.
5. Compare Original with Your layout. Try a clearer doorway or reset the starting layout.
6. Save the layout, open My saved layout, and continue editing the saved snapshot.

Automatic photo reconstruction is simulated. No uploaded image is analyzed and no ML runs. The room image is AI-generated and paired with a hand-authored illustrative plan. Dimensions require real-world confirmation; checks use simple axis-aligned furniture footprints and do not certify walking clearance. Edits and saved layouts are React state and reset on refresh.

## Required Part1 structure

- Traditional Home, About, Contact pages: public/index.html, about.html, contact.html.
- React App SPA: src/workspace.jsx; minimal public/app.html host.
- Reusable components: Navigation, Footer, NumericField, FurnitureItem, RoomCanvas, MeasurementPanel, SavedLayout.
- State: selection, position, rotation, dimensions, scale, comparison, saved snapshot; hash navigation between editor and saved layout.
- Bootstrap navbar and responsive layout; room graphics and shared box-model CSS throughout.
- React Sign In: src/login.jsx and minimal public/login.html. Create account opens a separate Name, Email, Login, Password form to the right of the original sign-in form on desktop and below it on mobile. Enter hides registration and fills the original login/password fields with the registration details. This is an in-memory demo; no authentication or real account storage is connected. Use sample credentials.

## Assets and editing

`public/images/sample-room.png` was created using the built-in imagegen tool. Its final prompt is in `public/images/sample-room.prompt.txt`. The room diagram and editor are native SVG/React. Home uses the same room photo and `public/images/planner-preview.jpg`, an actual browser capture of the working planner. Sean Farmer's original source attribution and commit history are preserved in this README and Git history; the public site uses Roomwise product branding.

Edit public HTML/CSS and src JSX, then rebuild. `generate-pages.py` contains the original Launchpad content and overwrites the adapted pages; do not rerun it over Roomwise.

Part2/Part3 infrastructure and cloud deployment are separate, deferred work.
