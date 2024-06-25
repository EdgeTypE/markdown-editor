document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const fileInput = document.getElementById('content').files[0];
    const accessToken = document.getElementById('accessToken').value;

    const repoName = 'EdgeTypE/goygoypages';
    const pathPrefix = 'urara/haberler';
    const filePath = `${pathPrefix}/${title}/${fileInput.name}`;

    const reader = new FileReader();
    reader.onload = function(event) {
        const content = btoa(event.target.result);
        uploadFileToGitHub(repoName, filePath, content, accessToken);
    };
    reader.readAsBinaryString(fileInput);
});

function uploadFileToGitHub(repoName, filePath, content, accessToken) {
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
            content: content
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
