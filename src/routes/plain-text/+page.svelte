<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { 
    textContent, 
    status, 
    awareness, 
    diffs,
    updateText,
    pauseSync, 
    resumeSync,
    cleanup 
  } from '$lib/plainTextStore';
  
  let users = 0;
  let pendingChanges = false;
  let localText = '';
  
  // Track number of connected users
  onMount(() => {
    // Initialize local text from the store
    textContent.subscribe(value => {
      localText = value;
    });
    
    // Update users when awareness changes
    if (awareness) {
      awareness.subscribe(value => {
        if (value) {
          users = Object.keys(value.states || {}).length;
        }
      });
    }
  });
  
  // Sync text changes to the shared document
  function handleInput(event: Event) {
    const newText = (event.target as HTMLTextAreaElement).value;
    localText = newText;
    updateText(newText);
  }
  
  // Toggle sync state
  function toggleSync() {
    if ($status.syncing) {
      pauseSync();
      pendingChanges = true;
    } else {
      resumeSync();
      pendingChanges = false;
    }
  }
  
  // Clean up when component is destroyed
  onDestroy(() => {
    cleanup();
  });
</script>

<div class="container">
  <header>
    <h1>Yjs Collaborative Plain Text Editor</h1>
    <div class="status-bar">
      <div class="connection-status">
        {#if $status.connected}
          <span class="connected">Connected</span>
        {:else}
          <span class="disconnected">Disconnected</span>
        {/if}
        <span class="users">{users} user{users !== 1 ? 's' : ''} online</span>
      </div>
      
      <div class="sync-controls">
        <button class="sync-toggle" on:click={toggleSync}>
          {#if $status.syncing}
            Pause Sync
          {:else}
            Resume Sync {pendingChanges ? '(Changes Pending)' : ''}
          {/if}
        </button>
      </div>
    </div>
  </header>

  <main>
    <div class="editor-container">
      {#if !$status.syncing}
        <div class="offline-banner">
          <span class="offline-indicator">⚠️</span>
          <span>You are currently in offline mode. Changes won't be synced until you resume synchronization.</span>
        </div>
      {/if}
      
      <textarea 
        bind:value={localText} 
        on:input={handleInput}
        placeholder="Start typing here..."
        rows="10"
      ></textarea>
    </div>
    
    <div class="updates-container">
      <h2>Recent Updates</h2>
      <div class="updates-list">
        {#if $diffs.length === 0}
          <p class="no-updates">No updates yet. Start typing to see changes!</p>
        {:else}
          {#each $diffs as diff}
            <div class="update-item {diff.type}">
              <div class="update-header">
                <span class="update-type">{diff.type === 'local' ? 'You' : 'Someone else'}</span>
                <span class="update-time">{new Date(diff.timestamp).toLocaleTimeString()}</span>
              </div>
              <div class="update-content">
                <p class="operation">
                  {#if diff.operations.some(op => op[0] === 1)}
                    {#if diff.operations.some(op => op[0] === -1)}
                      Modified
                    {:else}
                      Added
                    {/if}
                  {:else if diff.operations.some(op => op[0] === -1)}
                    Deleted
                  {:else}
                    No change
                  {/if}
                  {diff.length} character{diff.length !== 1 ? 's' : ''} at position {diff.position}
                </p>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
    
    <div class="instructions">
      <h2>Instructions</h2>
      <ol>
        <li>Open this page in multiple browser tabs</li>
        <li>Type in the text area</li>
        <li>Watch how changes sync between tabs in real-time!</li>
        <li>Try pausing sync in one tab, making changes, then resuming sync</li>
        <li>Observe the update history below the editor</li>
      </ol>
    </div>
  </main>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  header {
    margin-bottom: 2rem;
  }
  
  h1 {
    margin: 0 0 1rem 0;
    font-size: 2rem;
  }
  
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
  }
  
  .connection-status {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .connected {
    color: #2e7d32;
    font-weight: bold;
  }
  
  .disconnected {
    color: #c62828;
    font-weight: bold;
  }
  
  .sync-toggle {
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  
  .sync-toggle:hover {
    background-color: #e0e0e0;
  }
  
  .offline-banner {
    background-color: #fff3cd;
    color: #856404;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  
  .editor-container {
    margin-bottom: 2rem;
  }
  
  textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    font-size: 1rem;
    line-height: 1.5;
    resize: vertical;
  }
  
  .updates-container {
    margin-bottom: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
    margin: 0 0 1rem 0;
  }
  
  .updates-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem;
  }
  
  .no-updates {
    color: #666;
    font-style: italic;
    text-align: center;
    padding: 1rem;
  }
  
  .update-item {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .update-item.local {
    background-color: #e3f2fd;
    border-left: 3px solid #2196f3;
  }
  
  .update-item.remote {
    background-color: #f1f8e9;
    border-left: 3px solid #8bc34a;
  }
  
  .update-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    font-weight: bold;
  }
  
  .update-time {
    color: #666;
    font-size: 0.8rem;
  }
  
  .instructions {
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 4px;
  }
  
  ol {
    padding-left: 1.5rem;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    .status-bar {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    
    .connection-status {
      margin-bottom: 0.5rem;
    }
  }
</style> 