import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Create stores that work in both SSR and browser
export const status = writable({
  connected: false,
  syncing: true // Track if syncing is enabled
});

export type TextUpdate = {
  id: string;
  text: string;         // Full document text (for reference)
  changes: string;      // Just the changes in this update
  timestamp: number;
  origin: string;       // clientID of the origin
  type: 'local' | 'remote';
  fullSize: number;     // Size of entire document in bytes
  changeSize: number;   // Size of just the changes in bytes
  operation: 'insert' | 'delete' | 'mixed' | 'initial'; // Type of operation performed
  position: number;     // Position in the document where change occurred
  length: number;       // Length of the change
};

export const updates = writable<TextUpdate[]>([]);

// Only initialize Yjs on the client, not during SSR
let ydoc: Y.Doc;
let ytext: Y.Text;
let wsProvider: WebsocketProvider;
let awareness: any;

if (browser) {
  // Create a new Yjs document
  ydoc = new Y.Doc();

  // Rich text shared between clients - used for Quill
  ytext = ydoc.getText('quill');

  // Create a websocket provider (using a public demo server for simplicity)
  wsProvider = new WebsocketProvider(
    'wss://demos.yjs.dev', 
    'svelte-yjs-quill-demo', 
    ydoc
  );

  // Update connection status when connection changes
  wsProvider.on('status', (event: { status: string }) => {
    status.update(s => ({ ...s, connected: event.status === 'connected' }));
  });

  // Get awareness info about other users
  awareness = wsProvider.awareness;

  // Function to calculate string size in bytes
  function getStringSizeInBytes(str: string): number {
    return new TextEncoder().encode(str).length;
  }

  // Function to extract changes from Yjs event
  function extractChanges(event: Y.YTextEvent): { 
    changes: string,
    operation: 'insert' | 'delete' | 'mixed' | 'initial',
    position: number,
    length: number 
  } {
    if (!event.changes.delta || event.changes.delta.length === 0) {
      return { 
        changes: '', 
        operation: 'initial',
        position: 0,
        length: 0
      };
    }

    let changes = '';
    let operation: 'insert' | 'delete' | 'mixed' = 'mixed';
    let position = event.changes.delta[0].retain || 0;
    let length = 0;
    
    // Check if it's only inserts or only deletes
    const onlyInserts = event.changes.delta.every(d => d.insert !== undefined && d.delete === undefined);
    const onlyDeletes = event.changes.delta.every(d => d.delete !== undefined && d.insert === undefined);
    
    if (onlyInserts) operation = 'insert';
    if (onlyDeletes) operation = 'delete';
    
    // Extract the actual changes
    for (const delta of event.changes.delta) {
      if (delta.insert) {
        changes += JSON.stringify(delta.insert);
        if (typeof delta.insert === 'string') {
          length += delta.insert.length;
        } else {
          length += 1; // For embeds
        }
      } else if (delta.delete) {
        changes += `[deleted ${delta.delete} characters]`;
        length += delta.delete;
      } else if (delta.retain && 'attributes' in delta) {
        changes += `[formatted ${delta.retain} characters: ${JSON.stringify(delta.attributes)}]`;
        length += delta.retain;
      }
    }
    
    return { changes, operation, position, length };
  }

  // Observe changes to the shared text
  ytext.observe(event => {
    // Try to convert document to plain text (this is an approximation for Quill)
    let newText = '';
    try {
      newText = ytext.toString();
    } catch (e) {
      newText = 'Rich text document';
    }
    
    const extractedChanges = extractChanges(event);
    const fullSize = getStringSizeInBytes(newText);
    const changeSize = getStringSizeInBytes(extractedChanges.changes);
    
    // Add to update history
    const update: TextUpdate = {
      id: generateId(),
      text: newText,
      changes: extractedChanges.changes,
      timestamp: Date.now(),
      origin: event.transaction.origin?.toString() || 'unknown',
      type: event.transaction.origin === wsProvider.awareness.clientID ? 'local' : 'remote',
      fullSize: fullSize,
      changeSize: changeSize,
      operation: extractedChanges.operation,
      position: extractedChanges.position,
      length: extractedChanges.length
    };
    
    updates.update(list => {
      // Keep only the last 20 updates
      const newList = [update, ...list];
      return newList.slice(0, 20);
    });
  });
}

// Generate a unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
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

// Check if syncing is enabled
export function isSyncing() {
  let syncStatus = false;
  status.subscribe(s => {
    syncStatus = s.syncing;
  })();
  return syncStatus;
}

// Clean up resources when needed
export function cleanup() {
  if (browser && wsProvider && ydoc) {
    wsProvider.disconnect();
    ydoc.destroy();
  }
}

// Export Yjs objects for use in components
export { ytext, awareness }; 