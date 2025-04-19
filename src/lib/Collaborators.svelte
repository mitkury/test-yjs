<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { awareness, status } from './yjsStore';
  import { browser } from '$app/environment';
  
  type User = {
    id: number;
    name: string;
    color: string;
    status: 'online' | 'offline';
  };
  
  let collaborators: User[] = [];
  
  // Generate a random color for user
  function getRandomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', 
      '#118AB2', '#EF476F', '#073B4C', '#84A59D'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Create a local client state (only in browser)
  let clientId = 0;
  let clientColor = '';
  let clientName = '';
  
  if (browser && awareness) {
    clientId = awareness.clientID;
    clientColor = getRandomColor();
    clientName = `User ${clientId}`;
  }
  
  function updateCollaborators() {
    if (!browser || !awareness) return;
    
    const states = Array.from(awareness.getStates().entries());
    collaborators = states.map((entry) => {
      const [id, state] = entry as [number, any];
      const user = state.user || {};
      return {
        id,
        name: user.name || `User ${id}`,
        color: user.color || '#ccc',
        status: user.status || 'online'
      };
    });
  }
  
  // Update local user's online/offline status when sync state changes
  $: if (browser && awareness && clientId) {
    awareness.setLocalStateField('user', {
      name: clientName,
      color: clientColor,
      status: $status.syncing ? 'online' : 'offline'
    });
  }
  
  onMount(() => {
    // Only run client-side code in the browser
    if (!browser || !awareness) return;
    
    // Set our own user data
    awareness.setLocalStateField('user', {
      name: clientName,
      color: clientColor,
      status: $status.syncing ? 'online' : 'offline'
    });
    
    // Listen for changes in awareness
    awareness.on('change', updateCollaborators);
    updateCollaborators();
  });
  
  onDestroy(() => {
    if (browser && awareness) {
      awareness.off('change', updateCollaborators);
    }
  });
</script>

<div class="collaborators">
  <h3>Collaborators</h3>
  
  {#if collaborators.length === 0}
    <p class="no-collaborators">No one else is here yet.</p>
  {:else}
    <ul>
      {#each collaborators as user}
        <li class="user" style="--user-color: {user.color}">
          <div class="avatar" style="background-color: {user.color}"></div>
          <div class="user-info">
            <span class="name">{user.name}</span>
            {#if user.id === clientId}
              <span class="you">(you)</span>
            {/if}
            {#if user.status === 'offline'}
              <span class="status-badge offline">offline</span>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .collaborators {
    margin-top: 2rem;
    padding: 1rem;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
  }
  
  .no-collaborators {
    color: #666;
    font-style: italic;
    text-align: center;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .user {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .user:last-child {
    border-bottom: none;
  }
  
  .avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 10px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .you {
    font-size: 0.8rem;
    color: #666;
    font-style: italic;
  }
  
  .status-badge {
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: bold;
    text-transform: uppercase;
  }
  
  .status-badge.offline {
    background-color: #f8d7da;
    color: #721c24;
  }
</style> 