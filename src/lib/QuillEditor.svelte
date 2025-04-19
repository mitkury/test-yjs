<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ytext, awareness } from './yjsStore';
  import { browser } from '$app/environment';
  
  // DOM reference for the editor container
  let editorContainer: HTMLElement;
  
  // References for cleanup
  let quill: any;
  let binding: any;
  
  onMount(async () => {
    // Only initialize Quill in the browser, not during SSR
    if (!browser || !editorContainer) return;
    
    // Dynamically import Quill and y-quill to avoid SSR issues
    const [{ default: Quill }, { QuillBinding }] = await Promise.all([
      import('quill'),
      import('y-quill')
    ]);
    
    // Create a Quill editor instance
    quill = new Quill(editorContainer, {
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      },
      theme: 'snow'
    });
    
    // Bind Quill to Yjs document
    binding = new QuillBinding(ytext, quill, awareness);
    
    // Load the document's default content if empty
    if (ytext.toString() === '') {
      const delta = [
        { insert: 'Welcome to the Collaborative Rich Text Editor!\n', attributes: { header: 1 } },
        { insert: 'This is a simple example of using ' },
        { insert: 'Yjs', attributes: { bold: true } },
        { insert: ' with ' },
        { insert: 'Quill', attributes: { bold: true } },
        { insert: ' in SvelteKit.\n\n' },
        { insert: 'Try editing this document from multiple browser tabs!\n' }
      ];
      quill.updateContents(delta);
    }
  });
  
  // Clean up on component destruction
  onDestroy(() => {
    if (binding) {
      binding.destroy();
    }
  });
</script>

<svelte:head>
  <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
</svelte:head>

<div class="quill-container">
  <div bind:this={editorContainer} class="editor"></div>
</div>

<style>
  .quill-container {
    margin-bottom: 1.5rem;
    border-radius: 4px;
    overflow: hidden;
    background-color: white;
  }
  
  .editor {
    min-height: 200px;
    font-family: inherit;
  }
  
  :global(.ql-toolbar) {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    background-color: #f8f9fa;
  }
  
  :global(.ql-container) {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    background-color: white;
  }
</style> 