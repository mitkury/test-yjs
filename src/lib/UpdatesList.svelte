<script lang="ts">
  import { updates, type TextUpdate } from './yjsStore';
  import { awareness } from './yjsStore';
  import { browser } from '$app/environment';
  
  // Define a function to format timestamps
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  
  // Function to get user name from awareness
  function getUserName(clientId: string): string {
    if (!browser || !awareness || !clientId || clientId === 'unknown') return 'Unknown user';
    
    // Try to find the user in awareness
    const states = awareness.getStates();
    const userId = parseInt(clientId);
    
    if (states.has(userId)) {
      const user = states.get(userId)?.user;
      if (user && user.name) {
        return user.name;
      }
    }
    
    return `User ${clientId}`;
  }
  
  // Format size in a human-readable way (bytes, KB, etc.)
  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  
  // Format operation type with appropriate styling
  function formatOperation(op: string): { text: string, className: string } {
    switch(op) {
      case 'insert':
        return { text: 'Insert', className: 'insert' };
      case 'delete':
        return { text: 'Delete', className: 'delete' };
      case 'mixed':
        return { text: 'Edit', className: 'mixed' };
      case 'initial':
        return { text: 'Initial', className: 'initial' };
      default:
        return { text: op, className: 'unknown' };
    }
  }
  
  // Format position information
  function formatPosition(position: number, length: number): string {
    if (position === 0 && length === 0) return '';
    return `pos ${position}, len ${length}`;
  }
</script>

<div class="updates-list">
  <h3>Document Changes</h3>
  
  {#if $updates.length === 0}
    <div class="no-updates">No updates yet</div>
  {:else}
    <ul>
      {#each $updates as update}
        {@const op = formatOperation(update.operation)}
        <li class="update {update.type}">
          <div class="update-header">
            <span class="time">{formatTime(update.timestamp)}</span>
            <span class="user">
              {getUserName(update.origin)}
              <span class="update-type {update.type}">
                ({update.type})
              </span>
            </span>
          </div>
          
          <div class="operation-info">
            <span class="operation {op.className}">{op.text}</span>
            <span class="position">{formatPosition(update.position, update.length)}</span>
          </div>
          
          <div class="update-content">
            {update.changes || 'No content changes'}
          </div>
          
          <div class="update-footer">
            <span class="size">Change: {formatSize(update.changeSize)}</span>
            <span class="full-size">Document: {formatSize(update.fullSize)}</span>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .updates-list {
    margin-top: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
    max-height: 300px;
    overflow-y: auto;
  }
  
  h3 {
    margin: 0;
    padding: 0.75rem;
    background-color: #f2f2f2;
    border-bottom: 1px solid #ddd;
    font-size: 1rem;
  }
  
  .no-updates {
    padding: 1rem;
    text-align: center;
    color: #666;
    font-style: italic;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .update {
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
  }
  
  .update:last-child {
    border-bottom: none;
  }
  
  .update.local {
    background-color: #f0f8ff;
  }
  
  .update.remote {
    background-color: #fdf7f7;
  }
  
  .update-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
  }
  
  .time {
    color: #666;
  }
  
  .user {
    font-weight: bold;
  }
  
  .update-type {
    font-weight: normal;
    font-size: 0.75rem;
    padding: 1px 5px;
    border-radius: 10px;
    margin-left: 5px;
  }
  
  .update-type.local {
    background-color: #e2f2ff;
    color: #0066cc;
  }
  
  .update-type.remote {
    background-color: #ffe2e2;
    color: #cc0000;
  }
  
  .operation-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
  }
  
  .operation {
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 3px;
  }
  
  .operation.insert {
    background-color: #d4edda;
    color: #155724;
  }
  
  .operation.delete {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .operation.mixed {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .operation.initial {
    background-color: #d1ecf1;
    color: #0c5460;
  }
  
  .position {
    color: #666;
    font-family: monospace;
  }
  
  .update-content {
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-word;
    background-color: white;
    padding: 0.5rem;
    border-radius: 3px;
    border: 1px solid #eee;
    max-height: 100px;
    overflow-y: auto;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }
  
  .update-footer {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #666;
  }
</style> 