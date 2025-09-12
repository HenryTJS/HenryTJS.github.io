document.addEventListener('DOMContentLoaded', function() {
    fetch('json/article.json')
        .then(response => response.json())
        .then(data => {
            renderArticles(data);
            document.body.style.visibility = 'visible';
        })
        .catch(error => {
            console.error('加载文章数据失败:', error);
            document.body.style.visibility = 'visible';
        });
    function renderArticles(data) {
        const container = document.getElementById('articles-container');
        data.categories.forEach(category => {
            const categoryTitle = document.createElement('h2');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = category.title;
            container.appendChild(categoryTitle);
            const cardGrid = document.createElement('div');
            cardGrid.className = 'card-grid';
            category.articles.forEach(article => {
                const card = document.createElement('div');
                card.className = 'content-card';
                card.innerHTML = `
                    <h2 class="card-title">${article.title}</h2>
                    <p class="article-meta">发布时间：${article.date}</p>
                    <p>${article.summary}</p>
                    <a href="template/index.html?id=${article.link.replace('.html', '')}" class="read-more">阅读全文</a>
                `;
                cardGrid.appendChild(card);
            });
            container.appendChild(cardGrid);
        });
    }
});