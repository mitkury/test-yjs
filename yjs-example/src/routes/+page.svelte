<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { 
    status, 
    awareness, 
    cleanup, 
    pauseSync, 
    resumeSync 
  } from '$lib/yjsStore';
  import Collaborators from '$lib/Collaborators.svelte';
  import UpdatesList from '$lib/UpdatesList.svelte';
  import QuillEditor from '$lib/QuillEditor.svelte';
  
  let users = 1;
  let pendingChanges = false;
  
  // Track number of connected users
  onMount(() => {
    awareness.on('change', () => {
      users = Array.from(awareness.getStates().keys()).length;
    });
  });
  
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
    <h1>Yjs Collaborative Rich Text Editor</h1>
    <div class="status">
      {#if $status.connected}
        <span class="connected">Connected</span>
      {:else}
        <span class="disconnected">Disconnected</span>
      {/if}
      <span class="users">{users} user{users !== 1 ? 's' : ''} online</span>
      
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
      
      <QuillEditor />
      
      <UpdatesList />
    </div>
    
    <div class="collaboration-info">
      <div class="instructions">
        <h2>Instructions</h2>
        <ol>
          <li>Open this page in multiple browser tabs</li>
          <li>Edit the document with the rich text editor</li>
          <li>Watch how changes sync between tabs in real-time!</li>
          <li>Try pausing sync in one tab, making changes, then resuming sync</li>
          <li>Observe the update history below the editor</li>
        </ol>
      </div>
      
      <Collaborators />
    </div>
  </main>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    margin: 0;
    font-size: 2rem;
  }
  
  .status {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .connected {
    color: green;
    font-weight: bold;
  }
  
  .disconnected {
    color: red;
    font-weight: bold;
  }
  
  .offline-banner {
    background-color: #FFF3CD;
    color: #856404;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  
  .offline-indicator {
    font-size: 1.2rem;
  }
  
  .sync-toggle {
    background-color: #fff;
    border: 1px solid #ccc;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  
  .sync-toggle:hover {
    background-color: #f5f5f5;
  }
  
  .editor-container {
    margin-bottom: 2rem;
  }
  
  .collaboration-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .instructions {
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 4px;
  }
  
  h2 {
    margin-top: 0;
    font-size: 1.5rem;
  }
  
  ol {
    padding-left: 1.5rem;
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    .collaboration-info {
      grid-template-columns: 1fr;
    }
    
    .status {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
</style>
