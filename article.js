document.addEventListener('DOMContentLoaded', () => {

    // --- LOAD ALL MEDIA DATA FROM LOCALSTORAGE ---
    const allMediaContent = JSON.parse(localStorage.getItem('mediaContent')) || [];
    
    // Create a map of articles for quick lookups
    const articles = allMediaContent.reduce((acc, item) => {
        if (item.type === 'article') {
            acc[item.id] = {
                title: item.title,
                meta: item.meta,
                image: item.mainImageUrl, // Use mainImageUrl here
                imageAlt: item.title,
                content: item.content
            };
        }
        return acc;
    }, {});

    const articleBody = document.querySelector('.article-body');
    const articleModal = document.getElementById('article-modal');
    const closeArticleButton = document.getElementById('close-article-btn');
    const prevArticleButton = document.getElementById('prev-article');
    const nextArticleButton = document.getElementById('next-article');
    const articleKeys = Object.keys(articles);

    // --- FUNCTION TO LOAD ARTICLE CONTENT ---
    const loadArticle = (articleId) => {
        const articleData = articles[articleId];

        if (articleBody && articleData) {
            articleBody.innerHTML = `
                <h1>${articleData.title}</h1>
                <p class="article-meta">${articleData.meta}</p>
                <img src="${articleData.image}" alt="${articleData.imageAlt}" onerror="this.onerror=null;this.src='https://placehold.co/800x400/cccccc/ffffff?text=Image+Error';">
                ${articleData.content}
            `;
        } else if (articleBody) {
            articleBody.innerHTML = `
                <h1>Article Not Found</h1>
                <p>The article you are looking for does not exist or has been removed.</p>
            `;
        }
    };

    // --- INITIAL ARTICLE LOAD ---
    const urlParams = new URLSearchParams(window.location.search);
    let currentArticleId = urlParams.get('id');

    if (!currentArticleId || !articles[currentArticleId]) {
        currentArticleId = articleKeys.length > 0 ? articleKeys[0] : null;
    }
    
    if (currentArticleId) {
        loadArticle(currentArticleId);
    } else {
        if (articleBody) {
            articleBody.innerHTML = `
                <h1>No Articles Available</h1>
                <p>There are currently no articles to display. Please post one from the admin panel.</p>
            `;
        }
        if(prevArticleButton) prevArticleButton.style.display = 'none';
        if(nextArticleButton) nextArticleButton.style.display = 'none';
    }

    // --- ARTICLE MODAL FUNCTIONALITY ---
    const closeArticle = () => {
        if (articleModal) {
            window.location.href = 'media.html';
        }
    };

    if (closeArticleButton) {
        closeArticleButton.addEventListener('click', closeArticle);
    }
    
    if (articleModal) {
        articleModal.addEventListener('click', (e) => {
            if (e.target === articleModal) {
                closeArticle();
            }
        });
    }

    // --- ARTICLE NAVIGATION ---
    const navigateArticles = (direction) => {
        if (articleKeys.length === 0) return;
        const currentIndex = articleKeys.indexOf(currentArticleId);
        let nextIndex;

        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % articleKeys.length;
        } else {
            nextIndex = (currentIndex - 1 + articleKeys.length) % articleKeys.length;
        }

        const nextArticleId = articleKeys[nextIndex];
        window.location.href = `article.html?id=${nextArticleId}`;
    };

    if (prevArticleButton) {
        prevArticleButton.addEventListener('click', () => navigateArticles('prev'));
    }

    if (nextArticleButton) {
        nextArticleButton.addEventListener('click', () => navigateArticles('next'));
    }
});
