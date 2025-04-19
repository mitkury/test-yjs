# Yjs Collaborative Editor Example

A simple example of using Yjs with SvelteKit to create a collaborative rich text editor that syncs in real-time across browser tabs.

## Features

- Real-time collaborative rich text editing with Quill
- Formatting options like bold, italic, headers, lists, and more
- Shows connected users and their status
- Uses Yjs for conflict-free merging of document changes
- Uses y-websocket to connect to a demo server
- Supports offline mode with the ability to pause/resume synchronization
- Visualizes actual document deltas with detailed change metrics

## How It Works

This application uses:

- **Yjs**: A CRDT (Conflict-free Replicated Data Type) implementation that enables seamless collaboration
- **y-quill**: A Yjs binding for the Quill rich text editor
- **Quill**: A powerful, extensible rich text editor
- **y-websocket**: A provider that syncs document updates via WebSockets
- **SvelteKit**: A modern web framework for building fast, reactive UIs

Changes made in one browser tab are automatically synchronized with other tabs or browsers that have the app open.

## Getting Started

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (typically http://localhost:5173)
5. Open the same URL in another browser tab to see the real-time collaboration

## Testing Collaboration

1. Open the application in two or more browser tabs
2. Edit the document with rich text formatting in one tab
3. Watch how changes, including formatting, are automatically reflected in the other tabs
4. Notice the collaborators list updates to show all connected users
5. Check the update history to see a log of all changes

## Testing Offline Mode

1. Open the application in two tabs
2. Click "Pause Sync" in one of the tabs
3. Make some changes in the offline tab
4. Notice that other tabs don't receive these changes
5. Click "Resume Sync" to reconnect and sync your changes
6. See how your changes are now propagated to other tabs

## Delta Visualization

The application shows a history of document changes below the editor:
- Shows only the actual changes (deltas) rather than full document content
- Displays the operation type (insert, delete, edit) for each change
- Shows position and length information for each change
- Each update shows a timestamp and the user who made the change
- Local updates are highlighted in blue, remote updates in red
- Tracks both the size of the change and the total document size
- Color-codes different operation types for easy identification

## How It's Built

- `src/lib/yjsStore.ts` - Contains the Yjs document setup and shared text syncing
- `src/lib/QuillEditor.svelte` - Quill rich text editor with Yjs binding
- `src/lib/Collaborators.svelte` - Shows all active users collaborating on the document
- `src/lib/UpdatesList.svelte` - Displays the history of document changes
- `src/routes/+page.svelte` - The main editor interface

## Notes

This example uses a public demo server (wss://demos.yjs.dev) for WebSocket communication. For production use, you should set up your own server.

## License

MIT
