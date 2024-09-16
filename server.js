import dotenv from 'dotenv';
import fetch from 'node-fetch';
import express from 'express';
import multer from 'multer';  // For handling file uploads

dotenv.config();

const app = express();
const upload = multer(); // To handle multipart form data (for file uploads)
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));  // Serves the static files like HTML and CSS
app.use(express.json());

// Post to the Fediverse
app.post('/post-status', upload.array('images', 4), async (req, res) => {
    const { statusMessage, contentWarning } = req.body;
    const accessToken = process.env.FEDIVERSE_ACCESS_TOKEN;
    const instanceUrl = process.env.FEDIVERSE_INSTANCE_URL;
    const images = req.files;

    try {
        let mediaIds = [];

        // Upload images to Fediverse first, if any are provided
        if (images && images.length > 0) {
            for (const image of images) {
                const formData = new FormData();
                formData.append('file', image.buffer, image.originalname);

                const mediaResponse = await fetch(`${instanceUrl}/api/v2/media`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: formData
                });

                if (!mediaResponse.ok) {
                    throw new Error('Image upload failed.');
                }

                const mediaData = await mediaResponse.json();
                mediaIds.push(mediaData.id); // Store the media IDs
            }
        }

        // Post the status with optional media and content warning
        const postStatusResponse = await fetch(`${instanceUrl}/api/v1/statuses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: statusMessage,
                media_ids: mediaIds,
                spoiler_text: contentWarning || ""  // Include content warning if provided
            })
        });

        if (postStatusResponse.ok) {
            res.status(200).json({ message: 'Status posted successfully!' });
        } else {
            const errorData = await postStatusResponse.json();
            res.status(400).json({ error: errorData.error });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
