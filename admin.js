document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('post-content');
    const toolbar = document.querySelector('.editor-toolbar');
    const form = document.getElementById('post-form');
    const imageUploadInput = document.getElementById('image-upload-input');
    const insertImageBtn = document.getElementById('insert-image-btn');
    const postTypeSelect = document.getElementById('post-type');
    const videoFields = document.getElementById('video-fields');
    const contentFields = document.getElementById('content-fields');
    const thumbnailLabel = document.getElementById('thumbnail-label');
    const publishBtn = document.getElementById('publish-btn');

    // --- DYNAMIC FORM LOGIC ---
    postTypeSelect.addEventListener('change', () => {
        if (postTypeSelect.value === 'video') {
            videoFields.style.display = 'block';
            contentFields.style.display = 'none';
            thumbnailLabel.textContent = 'Thumbnail Image (Optional)';
        } else {
            videoFields.style.display = 'none';
            contentFields.style.display = 'block';
            thumbnailLabel.textContent = 'Thumbnail Image';
        }
    });

    // --- IMAGE UPLOADER UI LOGIC ---
    function setupImageUploader(groupName) {
        const urlRadio = document.querySelector(`input[name="${groupName}-source"][value="url"]`);
        const uploadRadio = document.querySelector(`input[name="${groupName}-source"][value="upload"]`);
        const urlInput = document.getElementById(`post-${groupName}-url`);
        const uploadInput = document.getElementById(`post-${groupName}-upload`);
        const preview = document.getElementById(`${groupName}-preview`);

        urlRadio.addEventListener('change', () => {
            urlInput.style.display = 'block';
            uploadInput.style.display = 'none';
        });

        uploadRadio.addEventListener('change', () => {
            urlInput.style.display = 'none';
            uploadInput.style.display = 'block';
        });

        const handleImage = (file) => {
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        };
        
        urlInput.addEventListener('input', () => {
             if(urlInput.value) {
                preview.src = urlInput.value;
                preview.style.display = 'block';
             } else {
                preview.style.display = 'none';
             }
        });
        uploadInput.addEventListener('change', () => handleImage(uploadInput.files[0]));
    }

    setupImageUploader('thumbnail');
    setupImageUploader('main-image');

    // --- TOOLBAR FUNCTIONALITY ---
    toolbar.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target || target.id === 'insert-image-btn' || target.tagName === 'SELECT') return;
        const command = target.dataset.command;
        let value = null;
        if (command === 'createLink') {
            value = prompt('Enter the URL:');
            if (!value || value === 'null') return;
        }
        document.execCommand(command, false, value);
        editor.focus();
    });
    
    insertImageBtn.addEventListener('click', () => imageUploadInput.click());

    imageUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.execCommand('insertImage', false, event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // --- FORM SUBMISSION ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        publishBtn.textContent = 'Publishing...';
        publishBtn.disabled = true;

        try {
            const getImageData = async (groupName) => {
                const source = document.querySelector(`input[name="${groupName}-source"]:checked`).value;
                const urlInput = document.getElementById(`post-${groupName}-url`);
                const uploadInput = document.getElementById(`post-${groupName}-upload`);
                
                if (source === 'url') return urlInput.value;

                const file = uploadInput.files[0];
                if (!file) return null;

                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            };

            const type = postTypeSelect.value;
            const title = document.getElementById('post-title').value;
            let postData = { id: `${type}-${Date.now()}`, type, title, date: new Date().toISOString() };

            if (type === 'video') {
                const videoUrl = document.getElementById('post-video-url').value;
                if (!videoUrl) throw new Error('YouTube video URL is required.');

                let thumbnailUrl = await getImageData('thumbnail');
                if (!thumbnailUrl) {
                    const videoId = (videoUrl.match(/[?&]v=([^&]+)/) || [])[1];
                    if (videoId) thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    else throw new Error('Invalid YouTube URL for thumbnail generation.');
                }
                postData = { ...postData, videoUrl: videoUrl, thumbnailUrl: thumbnailUrl, description: `A video titled "${title}".` };
            } else {
                const thumbnailUrl = await getImageData('thumbnail');
                if (!thumbnailUrl) throw new Error('A thumbnail image is required.');
                
                const mainImageUrl = await getImageData('main-image');
                postData = {
                    ...postData,
                    thumbnailUrl: thumbnailUrl,
                    mainImageUrl: mainImageUrl || thumbnailUrl,
                    meta: document.getElementById('post-author').value,
                    content: editor.innerHTML,
                    description: editor.innerText.substring(0, 120) + '...',
                };
            }

            const existingContent = JSON.parse(localStorage.getItem('mediaContent')) || [];
            existingContent.unshift(postData);
            localStorage.setItem('mediaContent', JSON.stringify(existingContent));

            alert(`Content for "${title}" has been published!`);
            form.reset();
            editor.innerHTML = '';
            document.querySelectorAll('.image-preview').forEach(p => p.style.display = 'none');
            postTypeSelect.dispatchEvent(new Event('change'));

        } catch (error) {
            console.error('Publishing Error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            publishBtn.textContent = 'Publish Content';
            publishBtn.disabled = false;
        }
    });
});
