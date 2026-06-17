/* ============================================
   阅读笔记 - 文章详情页 JavaScript
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

    // ---------- 获取文章 ID ----------
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!articleId) {
        document.getElementById('article-content').innerHTML = '<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">未找到文章参数</p>';
        return;
    }

    // ---------- 加载文章数据 ----------
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
                document.title = articleMeta.title + ' - seal的个人主页';
                document.getElementById('header-title').textContent = articleMeta.title;
                document.getElementById('article-date').textContent = articleMeta.date;
                document.getElementById('article-category').textContent = categoryName;
                document.getElementById('article-category').href = '../';

                // 加载 Markdown 内容
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
                        document.getElementById('article-content').innerHTML = `
                            <div style="text-align: center; padding: 3rem 0; color: var(--color-text-muted);">
                                <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem; display: block; color: var(--color-accent);"></i>
                                <p>加载文章失败: ${error.message}</p>
                            </div>
                        `;
                    });
            } else {
                document.getElementById('article-content').innerHTML = `
                    <div style="text-align: center; padding: 3rem 0; color: var(--color-text-muted);">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        <p>未找到对应文章</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('加载元数据失败:', error);
            document.getElementById('article-content').innerHTML = `
                <div style="text-align: center; padding: 3rem 0; color: var(--color-text-muted);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; display: block; color: #e74c3c;"></i>
                    <p>加载文章信息失败</p>
                </div>
            `;
        });
});
