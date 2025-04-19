import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import diff from 'fast-diff';

// Initialize Yjs document and text type
let ydoc: Y.Doc;
let ytext: Y.Text;
let wsProvider: WebsocketProvider;

// Create stores that work in both SSR and browser
export const textContent = writable('');
export const status = writable({
  connected: false,
  syncing: true
});

export type DiffType = {
  id: string;
  timestamp: number;
  type: 'local' | 'remote';
  oldText: string;
  newText: string;
  operations: Array<[number, string]>; // [operation, text]
  position: number;
  length: number;
};

export const diffs = writable<DiffType[]>([]);

// Awareness store to track information about other users
export const awareness = writable<any>(undefined);

// Initialize only in browser
if (browser) {
  ydoc = new Y.Doc();
  ytext = ydoc.getText('plain-text');
  
  wsProvider = new WebsocketProvider(
    'wss://demos.yjs.dev',
    'svelte-yjs-plain-text',
    ydoc
  );
  
  // Set the awareness object
  awareness.set(wsProvider.awareness);
  
  // Update connection status
  wsProvider.on('status', (event: { status: string }) => {
    status.update(s => ({ ...s, connected: event.status === 'connected' }));
  });
  
  // Listen for changes from other clients
  ytext.observe(event => {
    const newText = ytext.toString();
    
    // Only update if the content has actually changed
    if (get(textContent) !== newText) {
      const oldText = get(textContent);
      const operations = diff(oldText, newText);
      
      // Record the diff
      const wasLocalChange = event.transaction.origin === wsProvider.awareness.clientID;
      
      diffs.update(list => {
        const diffInfo: DiffType = {
          id: generateId(),
          timestamp: Date.now(),
          type: wasLocalChange ? 'local' : 'remote',
          oldText,
          newText,
          operations,
          position: findChangePosition(operations),
          length: calculateChangeLength(operations)
        };
        
        return [diffInfo, ...list].slice(0, 20); // Keep only the last 20 diffs
      });
      
      // Update the content
      textContent.set(newText);
    }
  });
}

// Helper function to generate a unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Find the position where the first change occurs
function findChangePosition(operations: Array<[number, string]>): number {
  let position = 0;
  
  for (const [op, text] of operations) {
    if (op === 0) { // Unchanged
      position += text.length;
    } else {
      return position;
    }
  }
  
  return 0;
}

// Calculate the total length of text that was changed
function calculateChangeLength(operations: Array<[number, string]>): number {
  let length = 0;
  
  for (const [op, text] of operations) {
    if (op !== 0) { // Changed (inserted or deleted)
      length += text.length;
    }
  }
  
  return length;
}

// Function to efficiently update text using diffing
export function updateText(newText: string) {
  if (!browser || !ytext) return;
  
  const currentText = get(textContent);
  
  // No change, nothing to do
  if (currentText === newText) return;
  
  // Apply the diff to the Yjs document
  const changes = diff(currentText, newText);
  let position = 0;
  
  // Start a transaction for batching multiple changes
  ydoc.transact(() => {
    for (const [operation, text] of changes) {
      if (operation === 1) { // Insertion
        ytext.insert(position, text);
        position += text.length;
      } else if (operation === -1) { // Deletion
        ytext.delete(position, text.length);
      } else { // Unchanged text
        position += text.length;
      }
    }
  });
}

// Function to pause synchronization
export function pauseSync() {
  if (browser && wsProvider) {
    wsProvider.disconnect();
    status.update(s => ({ ...s, syncing: false }));
  }
}

// Function to resume synchronization
export function resumeSync() {
  if (browser && wsProvider) {
    wsProvider.connect();
    status.update(s => ({ ...s, syncing: true }));
  }
}

// Clean up resources when needed
export function cleanup() {
  if (browser && wsProvider && ydoc) {
    wsProvider.disconnect();
    ydoc.destroy();
  }
} 