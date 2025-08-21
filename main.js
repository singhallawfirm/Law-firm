/**
 * main.js
 * This script handles theme toggling, search, media tabs, all content modals,
 * loading media from localStorage, and pagination.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- THEME TOGGLE FUNCTIONALITY ---
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        const themeIcon = themeToggleButton.querySelector('i');
        const body = document.body;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
            themeIcon.className = 'fa-solid fa-moon';
        }
        themeToggleButton.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
            themeIcon.className = body.classList.contains('dark-theme') ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        });
    }

    // --- MODAL LOGIC (ARTICLE, NEWS & VIDEO) ---
    const mainContent = document.getElementById('main-content');
    const articleModal = document.getElementById('article-modal');
    const articleModalBody = document.getElementById('article-modal-body');
    const closeArticleBtn = document.getElementById('close-article-btn');
    const newsModal = document.getElementById('news-modal');
    const newsModalBody = document.getElementById('news-modal-body');
    const closeNewsBtn = document.getElementById('close-news-btn');
    const videoModal = document.getElementById('video-modal');
    const videoModalBody = document.getElementById('video-modal-body');
    const closeVideoBtn = document.getElementById('close-video-btn');
    const prevArticleButton = document.getElementById('prev-article');
    const nextArticleButton = document.getElementById('next-article');
    
    let currentArticleId = null;
    let articleKeys = [];

    const openModal = (modal) => {
        modal.classList.add('active');
        mainContent.style.filter = 'blur(5px)';
        document.body.style.overflow = 'hidden';
    };

    const closeModal = (modal) => {
        modal.classList.remove('active');
        mainContent.style.filter = 'none';
        if (modal === videoModal) videoModalBody.innerHTML = '';
        if (modal === articleModal) {
            prevArticleButton.style.display = 'none';
            nextArticleButton.style.display = 'none';
        }
        document.body.style.overflow = '';
    };

    // Article Modal Logic
    const loadArticle = (articleId, articles) => {
        const articleData = articles[articleId];
        if (articleModalBody && articleData) {
            articleModalBody.innerHTML = `
                <h1>${articleData.title}</h1>
                <p class="article-meta">${articleData.meta}</p>
                <img src="${articleData.mainImageUrl}" alt="${articleData.title}" onerror="this.onerror=null;this.src='https://placehold.co/800x400/cccccc/ffffff?text=Image+Error';">
                ${articleData.content}
            `;
            currentArticleId = articleId;
        }
    };
    
    const openArticleModal = (item, articles) => {
        articleKeys = Object.keys(articles);
        loadArticle(item.id, articles);
        openModal(articleModal);
        prevArticleButton.style.display = 'block';
        nextArticleButton.style.display = 'block';
    };

    const navigateArticles = (direction, articles) => {
        const currentIndex = articleKeys.indexOf(currentArticleId);
        let nextIndex = (direction === 'next') 
            ? (currentIndex + 1) % articleKeys.length 
            : (currentIndex - 1 + articleKeys.length) % articleKeys.length;
        loadArticle(articleKeys[nextIndex], articles);
    };

    // News Modal Logic
    const openNewsModal = (item) => {
        newsModalBody.innerHTML = `
            <h1>${item.title}</h1>
            <p class="news-meta">${item.meta}</p>
            <img src="${item.mainImageUrl}" alt="${item.title}" onerror="this.onerror=null;this.src='https://placehold.co/800x400/cccccc/ffffff?text=Image+Error';">
            ${item.content}
        `;
        openModal(newsModal);
    };
    
    // Video Modal Logic
    const openVideoModal = (item) => {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = item.videoUrl.match(youtubeRegex);
        const videoId = match ? match[1] : null;

        if (videoId) {
            videoModalBody.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&origin=${window.location.origin}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            videoModalBody.innerHTML = `<div class="video-error"><p>Could not play video.</p><p>The provided YouTube link is invalid.</p></div>`;
        }
        openModal(videoModal);
    };

    // Event Listeners for closing modals
    if (closeArticleBtn) closeArticleBtn.addEventListener('click', () => closeModal(articleModal));
    if (articleModal) articleModal.addEventListener('click', (e) => e.target === articleModal && closeModal(articleModal));
    if (closeNewsBtn) closeNewsBtn.addEventListener('click', () => closeModal(newsModal));
    if (newsModal) newsModal.addEventListener('click', (e) => e.target === newsModal && closeModal(newsModal));
    if (closeVideoBtn) closeVideoBtn.addEventListener('click', () => closeModal(videoModal));
    if (videoModal) videoModal.addEventListener('click', (e) => e.target === videoModal && closeModal(videoModal));

    // --- MEDIA DATA AND PAGINATION ---
    const mediaData = JSON.parse(localStorage.getItem('mediaContent')) || [];
    const articlesData = mediaData.reduce((acc, item) => {
        if (item.type === 'article') acc[item.id] = item;
        return acc;
    }, {});
    const ITEMS_PER_PAGE = 24;

    if (prevArticleButton) prevArticleButton.addEventListener('click', () => navigateArticles('prev', articlesData));
    if (nextArticleButton) nextArticleButton.addEventListener('click', () => navigateArticles('next', articlesData));

    function setupPagination(items, gridContainerId) {
        const gridContainer = document.getElementById(gridContainerId);
        const paginationContainer = document.getElementById(gridContainerId.replace('-grid', '-pagination'));
        if (!gridContainer) return;

        displayItems(1);

        function displayItems(page) {
            gridContainer.innerHTML = '';
            const paginatedItems = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

            if (paginatedItems.length === 0) {
                gridContainer.innerHTML = `<p class="no-content-message">No content posted yet.</p>`;
            } else {
                paginatedItems.forEach(item => {
                    let buttonText = 'View';
                    if (item.type === 'article') buttonText = 'Read More';
                    if (item.type === 'video') buttonText = 'Watch Now';

                    const cardHTML = `
                        <div class="media-card clickable" data-id="${item.id}" data-type="${item.type}">
                            <div class="media-card-thumbnail">
                                <img src="${item.thumbnailUrl}" alt="${item.title} Thumbnail" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=Error';">
                                ${item.type === 'video' ? '<div class="video-overlay"><i class="fa-solid fa-play"></i></div>' : ''}
                            </div>
                            <div class="media-card-content">
                                <h3>${item.title}</h3>
                                <p>${item.description}</p>
                                <div class="media-card-footer">
                                    <span class="date">${new Date(item.date).toLocaleDateString()}</span>
                                    <a href="#" class="read-more-btn">${buttonText} &rarr;</a>
                                </div>
                            </div>
                        </div>`;
                    gridContainer.innerHTML += cardHTML;
                });
            }
            renderPaginationControls(page, Math.ceil(items.length / ITEMS_PER_PAGE));
        }

        function renderPaginationControls(currentPage, totalPages) {
            if (!paginationContainer) return;
            paginationContainer.innerHTML = '';
            if (totalPages <= 1) return;
            let paginationHTML = '<div class="pagination-nav">';
            paginationHTML += `<a href="#" class="first-last ${currentPage === 1 ? 'disabled' : ''}" data-page="1">First</a>`;
            paginationHTML += `<a href="#" class="arrow ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i></a>`;
            let startPage = Math.max(1, currentPage - 2), endPage = Math.min(totalPages, currentPage + 2);
            if (startPage > 1) paginationHTML += `<a href="#" data-page="1">1</a><span class="ellipsis">...</span>`;
            for (let i = startPage; i <= endPage; i++) paginationHTML += `<a href="#" class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
            if (endPage < totalPages) paginationHTML += `<span class="ellipsis">...</span><a href="#" data-page="${totalPages}">${totalPages}</a>`;
            paginationHTML += `<a href="#" class="arrow ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}"><i class="fas fa-chevron-right"></i></a>`;
            paginationHTML += `<a href="#" class="first-last ${currentPage === totalPages ? 'disabled' : ''}" data-page="${totalPages}">Last</a>`;
            paginationHTML += '</div>';
            paginationContainer.innerHTML = paginationHTML;
        }

        if (paginationContainer) paginationContainer.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.closest('a');
            if (target && !target.classList.contains('disabled')) displayItems(parseInt(target.dataset.page));
        });

        gridContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.media-card.clickable');
            if (!card) return;
            e.preventDefault();

            const item = mediaData.find(i => i.id === card.dataset.id);
            if (!item) return;

            if (item.type === 'article') {
                openArticleModal(item, articlesData);
            } else if (item.type === 'news') {
                openNewsModal(item);
            } else if (item.type === 'video') {
                openVideoModal(item);
            }
        });
    }

    // --- MEDIA PAGE TAB FUNCTIONALITY ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabLinks.length > 0) {
        const setupTab = (tabId) => {
            let filterType;
            if (tabId === 'articles') filterType = 'article';
            else if (tabId === 'news') filterType = 'news';
            else if (tabId === 'videos') filterType = 'video';
            const items = mediaData.filter(item => item.type === filterType);
            setupPagination(items, `${tabId}-grid`);
        };

        const activeTab = document.querySelector('.tab-link.active');
        setupTab(activeTab ? activeTab.dataset.tab : 'articles');

        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const tabId = link.dataset.tab;
                tabLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                tabContents.forEach(c => c.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
                setupTab(tabId);
            });
        });
    }
});
