function applyMarkdown(action) {
    const editor = document.getElementById("markdown-editor");
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);

    let markdownText = '';

    switch (action) {
        case 'bold':
            markdownText = `**${selectedText}**`;
            break;
        case 'italic':
            markdownText = `*${selectedText}*`;
            break;
        case 'buyukBaslik':
            markdownText = `# ${selectedText}`;
            break;
        case 'ortaBaslik':
            markdownText = `## ${selectedText}`;
            break;
        case 'kucukBaslik':
            markdownText = `### ${selectedText}`;
            break;
        default:
            break;
    }

    editor.value = editor.value.substring(0, start) + markdownText + editor.value.substring(end);
    updatePreview();
}

function insertImage() {
    const imageUrl = prompt("Enter image URL");
    if (imageUrl) {
        const editor = document.getElementById("markdown-editor");
        const start = editor.selectionStart;
        const imageMarkdown = `![Alt text](${imageUrl})`;

        editor.value = editor.value.substring(0, start) + imageMarkdown + editor.value.substring(start);
        updatePreview();
    }
}

function insertYouTube() {
    const videoId = prompt("Enter YouTube video ID");
    if (videoId) {
        const editor = document.getElementById("markdown-editor");
        const start = editor.selectionStart;
        const youtubeMarkdown = `<YouTube youTubeId="${videoId}" />`;

        editor.value = editor.value.substring(0, start) + youtubeMarkdown + editor.value.substring(start);
        updatePreview();
    }
}

function insertTweet() {
    const tweetLink = prompt("Enter Tweet link (e.g., Pilestedt/status/178645465925675844)");
    if (tweetLink) {
        const editor = document.getElementById("markdown-editor");
        const start = editor.selectionStart;
        const tweetMarkdown = `<Tweet tweetLink="${tweetLink}" />`;

        editor.value = editor.value.substring(0, start) + tweetMarkdown + editor.value.substring(start);
        updatePreview();
    }
}

function updatePreview() {
    const editor = document.getElementById("markdown-editor");
    const preview = document.getElementById("markdown-preview");

    const converter = new showdown.Converter();
    const html = converter.makeHtml(editor.value);
    preview.innerHTML = html;
}

function createSafeUrl(title) {
    const turkishChars = {
        'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c',
        'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C'
    };
    const safeTitle = title.split('').map(char => turkishChars[char] || char).join('')
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
    return safeTitle;
}

function uploadMarkdown() {
    const title = document.getElementById("title").value || 'Untitled';
    const image = document.getElementById("image").value || '';
    const alt = document.getElementById("alt").value || '';
    const writer = document.getElementById("writer").value || 'Konuk';
    const summary = document.getElementById("summary").value || '';
    const accessToken = document.getElementById("accessToken").value;
    const contentType = document.getElementById("contentType").value;
    const tagsInput = document.getElementById("tags").value || '';
    const tags = tagsInput.split(',').map(tag => tag.trim());
    tags.push(contentType);
    const today = new Date().toISOString();
    let metadata = `---
title: "${title}"
image: '${image}'
alt: '${alt}'
created: ${today}
updated: ${today}
writer: ${writer}
summary: "${summary}"
tags:\n`;
    tags.forEach(tag => {
        metadata += `  - '${tag}'\n`;
    });
    metadata += `---\n\n`;

    let scriptImports = `<script>\n`;
    let imports = [];
    const editorContent = document.getElementById("markdown-editor").value;

    if (editorContent.includes('<YouTube')) imports.push('YouTube');
    if (editorContent.includes('<Tweet')) imports.push('Tweet');

    if (imports.length > 0) {
        scriptImports += `  import { ${imports.join(', ')} } from 'sveltekit-embed'\n`;
    }
    scriptImports += `</script>\n\n`;

    const markdownContent = editorContent;
    const completeContent = metadata + scriptImports + markdownContent;
    const base64Content = btoa(unescape(encodeURIComponent(completeContent)));
    const repoName = 'EdgeTypE/goygoypages';
    const pathPrefix = `urara/${contentType}`;
    const safeTitle = createSafeUrl(title);
    const filePath = `${pathPrefix}/${safeTitle}/+page.svelte.md`;
    const url = `https://api.github.com/repos/${repoName}/contents/${filePath}`;
    const message = `Add new post: ${filePath}`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            content: base64Content
        })
    })
    .then(response => response.json())
    .then(data => {
        const messageElement = document.getElementById('message');
        if (data.content) {
            messageElement.textContent = "Dosya başarıyla yüklendi!";
        } else {
            messageElement.textContent = "Hata: " + (data.message || "Bilinmeyen hata");
        }
    })
    .catch(error => {
        document.getElementById('message').textContent = "Hata: " + error;
    });
}
