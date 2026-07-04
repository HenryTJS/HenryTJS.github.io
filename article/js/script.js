/* ============================================
   阅读笔记 - 文章列表页 JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // ---------- 导航栏滚动效果 ----------
    const navBar = document.getElementById('mainNavBar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 20) {
            navBar.classList.add('scrolled');
        } else {
            navBar.classList.remove('scrolled');
        }
    }, { passive: true });

    // ---------- 加载文章数据 ----------
    fetch('json/article.json')
        .then(response => response.json())
        .then(data => {
            renderArticles(data);
            document.body.classList.add('visible');
        })
        .catch(error => {
            console.error('加载文章数据失败:', error);
            document.body.classList.add('visible');
        });

    function getThemeClass(categoryTitle) {
        const map = {
            '人文社科': 'theme-humanities',
            '理工农医': 'theme-science',
            '创意写作': 'theme-creative',
            '好书推荐': 'theme-books'
        };
        return map[categoryTitle] || '';
    }

    function renderArticles(data) {
        const container = document.getElementById('articles-container');
        const fragment = document.createDocumentFragment();

        data.categories.forEach(category => {
            const themeClass = getThemeClass(category.title);

            // 分类标题
            const categoryTitle = document.createElement('h2');
            categoryTitle.className = 'category-title';
            categoryTitle.innerHTML = `${category.title} <span class="cat-tag">${category.articles.length}篇</span>`;
            fragment.appendChild(categoryTitle);

            // 卡片网格
            const cardGrid = document.createElement('div');
            cardGrid.className = 'card-grid';

            category.articles.forEach(article => {
                const card = document.createElement('div');
                card.className = `content-card ${themeClass}`;
                card.innerHTML = `
                    <div class="card-top">
                        <h2 class="card-title">${article.title}</h2>
                        <p class="article-meta">
                            <i class="far fa-calendar-alt"></i>
                            ${article.date}
                        </p>
                        <p>${article.summary}</p>
                    </div>
                    <div class="card-footer">
                        <a href="template/index.html?id=${article.link.replace('.html', '')}" class="read-more">
                            阅读全文 <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                `;
                cardGrid.appendChild(card);
            });

            fragment.appendChild(cardGrid);
        });

        container.appendChild(fragment);
    }
});
