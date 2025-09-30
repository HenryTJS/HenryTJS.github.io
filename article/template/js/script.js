document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    if (!articleId) {
        document.getElementById('article-content').innerHTML = '<p>未找到文章参数</p>';
        return;
    }
    fetch('../json/article.json')
        .then(response => response.json())
        .then(data => {
            let articleMeta = null;
            let categoryName = '';
            for (const category of data.categories) {
                const found = category.articles.find(article => {
                    const id = article.link.replace('.html', '');
                    return id === articleId;
                });
                if (found) {
                    articleMeta = found;
                    categoryName = category.title;
                    break;
                }
            }
            if (articleMeta) {
                document.title = articleMeta.title;
                document.getElementById('header-title').textContent = articleMeta.title;
                document.getElementById('article-date').textContent = articleMeta.date;
                document.getElementById('article-category').textContent = categoryName;
                document.getElementById('article-category').href = `../`;
                fetch(`md/${articleId}.md`)
                    .then(response => {
                        if (!response.ok) throw new Error('文章不存在');
                        return response.text();
                    })
                    .then(markdown => {
                        const html = marked.parse(markdown);
                        document.getElementById('article-content').innerHTML = html;
                    })
                    .catch(error => {
                        document.getElementById('article-content').innerHTML = `<p>加载文章失败: ${error.message}</p>`;
                    });
            } else {
                document.getElementById('article-content').innerHTML = '<p>未找到对应文章</p>';
            }
        })
        .catch(error => {
            console.error('加载元数据失败:', error);
            document.getElementById('article-content').innerHTML = '<p>加载文章信息失败</p>';
        });
});