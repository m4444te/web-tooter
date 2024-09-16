document.getElementById('statusForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const statusMessage = document.getElementById('statusMessage').value.trim();
    const contentWarning = document.getElementById('contentWarning').value.trim();
    const imageUpload = document.getElementById('imageUpload').files;

    if (!statusMessage) {
        alert('Please enter a status message.');
        return;
    }

    const formData = new FormData();
    formData.append('statusMessage', statusMessage);
    formData.append('contentWarning', contentWarning);

    for (let i = 0; i < imageUpload.length; i++) {
        formData.append('images', imageUpload[i]);
    }

    try {
        const response = await fetch('/post-status', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert('Status posted successfully!');
            document.getElementById('statusForm').reset();
        } else {
            alert('Error posting status: ' + result.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});
