document.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数中的文章ID
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id'); // 例如: article1
    
    if (!articleId) {
        document.getElementById('article-content').innerHTML = '<p>未找到文章参数</p>';
        return;
    }

    // 1. 加载文章元数据
    fetch('../article.json')
        .then(response => response.json())
        .then(data => {
            // 查找对应文章的元数据
            let articleMeta = null;
            let categoryName = '';
            
            // 遍历分类查找文章
            for (const category of data.categories) {
                const found = category.articles.find(article => {
                    // 从link中提取文章ID (如从article1.html提取article1)
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
                // 更新页面元数据
                document.title = articleMeta.title;
                document.getElementById('header-title').textContent = articleMeta.title;
                document.getElementById('article-date').textContent = articleMeta.date;
                document.getElementById('article-category').textContent = categoryName;
                document.getElementById('article-category').href = `../index.html`;
                
                // 2. 加载并渲染Markdown内容
                fetch(`../articles/${articleId}.md`)
                    .then(response => {
                        if (!response.ok) throw new Error('文章不存在');
                        return response.text();
                    })
                    .then(markdown => {
                        // 将Markdown转换为HTML并渲染
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