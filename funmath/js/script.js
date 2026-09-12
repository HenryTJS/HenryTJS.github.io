/* ============================================
   趣味数学 - 目录页 JavaScript
   从 json/data.json 渲染分区 / 分类 / 卡片，
   并提供关键词搜索与状态筛选。
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    const navBar = document.getElementById('mainNavBar');
    window.addEventListener('scroll', function () {
        navBar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    let DATA = null;
    const state = { keyword: '', filter: 'all' };

    fetch('json/data.json')
        .then(res => res.json())
        .then(data => {
            DATA = data;
            renderHeader(data);
            render(data);
            document.body.classList.add('visible');
        })
        .catch(err => {
            console.error('加载趣味数学数据失败:', err);
            document.getElementById('math-container').innerHTML =
                '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>数据加载失败，请通过本地服务器访问（file:// 协议会被浏览器拦截）</p></div>';
            document.body.classList.add('visible');
        });

    /* ---------- 头部信息 ---------- */
    function renderHeader(data) {
        const site = data.site || {};
        if (site.title) document.getElementById('page-title').innerHTML =
            '<i class="fas fa-calculator"></i>' + site.title;
        if (site.subtitle) document.getElementById('page-subtitle').textContent = site.subtitle;
        document.title = (site.title || '趣味数学') + ' - seal的个人主页';
        if (site.intro) {
            const intro = document.createElement('p');
            intro.className = 'page-intro';
            intro.textContent = site.intro;
            intro.style.cssText = 'max-width:760px;margin:1.2rem auto 0;color:var(--color-text-secondary);font-size:0.9rem;';
            document.querySelector('.page-header p').after(intro);
        }

        const stats = document.getElementById('header-stats');
        if (stats) {
            const counts = countArticles(data);
            stats.innerHTML = `
                <div class="stat"><span class="stat-value">${counts.sections}</span><span class="stat-label">大板块</span></div>
                <div class="stat"><span class="stat-value">${counts.groups}</span><span class="stat-label">分类</span></div>
                <div class="stat"><span class="stat-value">${counts.ready}</span><span class="stat-label">已更新</span></div>
                <div class="stat"><span class="stat-value">${counts.planned}</span><span class="stat-label">计划中</span></div>
            `;
        }
    }

    function countArticles(data) {
        let groups = 0, ready = 0, planned = 0;
        data.sections.forEach(s => s.groups.forEach(g => {
            groups++;
            g.articles.forEach(a => (a.status === 'ready' ? ready++ : planned++));
        }));
        return { sections: data.sections.length, groups, ready, planned };
    }

    /* ---------- 渲染列表 ---------- */
    function render(data) {
        const container = document.getElementById('math-container');
        container.innerHTML = '';
        let shown = 0;

        data.sections.forEach(section => {
            const sectionEl = document.createElement('section');
            sectionEl.className = 'math-section';

            sectionEl.innerHTML = `
                <div class="section-head">
                    <div class="section-icon"><i class="fas ${section.icon || 'fa-calculator'}"></i></div>
                    <div>
                        <h2>${section.title}</h2>
                        <p>${section.desc || ''}</p>
                    </div>
                </div>
            `;

            section.groups.forEach(group => {
                const articles = group.articles.filter(visible);
                if (!articles.length) return;
                shown += articles.length;

                const groupEl = document.createElement('div');
                groupEl.className = 'group';
                groupEl.innerHTML = `
                    <h3 class="group-title">${group.title}
                        <span class="group-count">${articles.length} 篇</span>
                    </h3>
                    ${group.desc ? `<p class="group-desc">${group.desc}</p>` : ''}
                `;

                const grid = document.createElement('div');
                grid.className = 'card-grid';
                articles.forEach((article, i) => {
                    const card = buildCard(article);
                    card.style.animationDelay = (Math.min(i, 6) * 0.05) + 's';
                    grid.appendChild(card);
                });

                groupEl.appendChild(grid);
                sectionEl.appendChild(groupEl);
            });

            if (sectionEl.querySelector('.card-grid')) container.appendChild(sectionEl);
        });

        document.getElementById('empty-state').hidden = shown > 0;
    }

    /* ---------- 单张卡片 ---------- */
    function buildCard(article) {
        const ready = article.status === 'ready';
        const card = document.createElement('div');
        card.className = 'content-card reveal' + (ready ? '' : ' is-planned');

        const tags = (article.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
        const href = `template/index.html?id=${article.id}`;

        card.innerHTML = `
            <div>
                <div class="card-top">
                    <h4 class="card-title">${article.title}</h4>
                    <span class="badge ${ready ? 'badge-ready' : 'badge-planned'}">${ready ? '已更新' : '计划中'}</span>
                </div>
                <p class="card-summary">${article.summary || ''}</p>
            </div>
            <div class="card-footer">
                <div class="card-tags">${tags}</div>
                ${ready
                    ? `<a class="read-more" href="${href}">阅读 <i class="fas fa-arrow-right"></i></a>`
                    : `<span class="read-more is-disabled">待更新</span>`}
            </div>
        `;

        if (ready) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', e => {
                if (e.target.closest('a')) return;
                window.location.href = href;
            });
        }
        return card;
    }

    /* ---------- 过滤 ---------- */
    function visible(article) {
        if (state.filter !== 'all' && article.status !== state.filter) return false;
        if (!state.keyword) return true;
        const kw = state.keyword.toLowerCase();
        const haystack = [article.title, article.summary, (article.tags || []).join(' '), article.level]
            .join(' ').toLowerCase();
        return haystack.includes(kw);
    }

    function refresh() {
        if (!DATA) return;
        render(DATA);
    }

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', e => {
        state.keyword = e.target.value.trim();
        refresh();
    });

    document.getElementById('filter-tabs').addEventListener('click', e => {
        const btn = e.target.closest('.filter-tab');
        if (!btn) return;
        document.querySelectorAll('.filter-tab').forEach(b => b.classList.toggle('active', b === btn));
        state.filter = btn.dataset.filter;
        refresh();
    });
});
