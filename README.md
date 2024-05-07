Tabii ki! Svelte.js ile aynı işlevselliği sağlayacak bir markdown editörünü aşağıdaki şekilde oluşturabilirsiniz.

### Dosya yapısı
- `App.svelte`
- `styles.css`
- `scripts.js` (Showdown kütüphanesi dahil)
- `main.js`

### `App.svelte`
```svelte
<script>
  import { onMount } from 'svelte';
  import { Tweet, YouTube } from 'sveltekit-embed';

  let title = '';
  let image = '';
  let alt = '';
  let writer = '';
  let summary = '';
  let tags = '';
  let markdownContent = '';
  let previewContent = '';

  function applyMarkdown(action) {
    const start = document.getElementById("markdown-editor").selectionStart;
    const end = document.getElementById("markdown-editor").selectionEnd;
    const selectedText = markdownContent.substring(start, end);
    let markdownText = '';

    switch (action) {
      case 'bold':
        markdownText = `**${selectedText}**`;
        break;
      case 'italic':
        markdownText = `*${selectedText}*`;
        break;
      case 'underline':
        markdownText = `<u>${selectedText}</u>`;
        break;
    }

    markdownContent = markdownContent.substring(0, start) + markdownText + markdownContent.substring(end);
    updatePreview();
  }

  function insertYouTube() {
    const videoId = prompt("Enter YouTube video ID");
    if (videoId) {
      const start = document.getElementById("markdown-editor").selectionStart;
      const youtubeMarkdown = `<YouTube youTubeId="${videoId}" />`;
      markdownContent = markdownContent.substring(0, start) + youtubeMarkdown + markdownContent.substring(start);
      updatePreview();
    }
  }

  function insertTweet() {
    const tweetLink = prompt("Enter Tweet link (e.g., Pilestedt/status/178645465925675844)");
    if (tweetLink) {
      const start = document.getElementById("markdown-editor").selectionStart;
      const tweetMarkdown = `<Tweet tweetLink="${tweetLink}" />`;
      markdownContent = markdownContent.substring(0, start) + tweetMarkdown + markdownContent.substring(start);
      updatePreview();
    }
  }

  function insertImage() {
    const imageUrl = prompt("Enter image URL");
    if (imageUrl) {
      const start = document.getElementById("markdown-editor").selectionStart;
      const imageMarkdown = `![Alt text](${imageUrl})`;
      markdownContent = markdownContent.substring(0, start) + imageMarkdown + markdownContent.substring(start);
      updatePreview();
    }
  }

  function updatePreview() {
    const converter = new showdown.Converter();
    previewContent = converter.makeHtml(markdownContent);
  }

  function downloadMarkdown() {
    const tagsArray = tags.split(',').map(tag => tag.trim());
    const today = new Date().toISOString().split('T')[0];

    let metadata = `---
title: "${title}"
image: '${image}'
alt: '${alt}'
created: ${today}
updated: ${today}
writer: ${writer}'
summary: "${summary}"
tags:\n`;

    tagsArray.forEach(tag => {
      metadata += `  - '${tag}'\n`;
    });
    metadata += `---\n\n`;

    let scriptImports = `<script>\n`;
    let imports = [];

    if (markdownContent.includes('<YouTube')) imports.push('YouTube');