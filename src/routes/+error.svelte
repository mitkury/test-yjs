<script>
  import { page } from '$app/stores';
</script>

<div class="error-container">
  <h1>Something went wrong</h1>
  <p>We're sorry, but there was an error loading the page.</p>
  
  {#if $page.error?.message}
    <div class="error-details">
      <p><strong>Error:</strong> {$page.error.message}</p>
    </div>
  {/if}
  
  <div class="actions">
    <a href="/" class="button">Go back to homepage</a>
    <button class="button" on:click={() => window.location.reload()}>Refresh page</button>
  </div>
</div>

<style>
  .error-container {
    max-width: 800px;
    margin: 4rem auto;
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    text-align: center;
  }
  
  h1 {
    color: #d32f2f;
    margin-top: 0;
  }
  
  .error-details {
    margin: 2rem 0;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    text-align: left;
  }
  
  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .button {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: none;
  }
  
  .button:hover {
    background-color: #1565c0;
  }
</style> 