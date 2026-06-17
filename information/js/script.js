/* ============================================
   友情链接 - JavaScript
   ============================================ */

let state = {
    resources: [],
    keyword: '',
    category: 'links'
};

const els = {
    container: null,
    search: null,
    filters: null
};

document.addEventListener('DOMContentLoaded', async () => {
    // 导航栏滚动效果
    const navBar = document.getElementById('mainNavBar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 20) {
            navBar.classList.add('scrolled');
        } else {
            navBar.classList.remove('scrolled');
        }
    }, { passive: true });

    cacheDom();
    bindEvents();
    await loadData();
    render();
});

function cacheDom() {
    els.container = document.getElementById('resourceContainer');
    els.search = document.getElementById('searchInput');
    els.filters = document.querySelector('.filters');
}

function bindEvents() {
    if (els.search) {
        els.search.addEventListener('input', debounce((e) => {
            state.keyword = e.target.value.trim().toLowerCase();
            render();
        }, 200));
    }

    if (els.filters) {
        els.filters.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;

            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.category = btn.dataset.category;
            render();
        });
    }
}

async function loadData() {
    try {
        const res = await fetch('json/data.json', { cache: 'no-store' });
        state.resources = (await res.json()).resources || [];
    } catch (err) {
        console.error('加载数据失败', err);
        state.resources = [];
    }
}

function filteredResources() {
    const { resources, keyword, category } = state;
    return resources.filter(r => {
        const inCategory = r.category === category;
        const inKeyword = !keyword ? true : (
            (r.title || '').toLowerCase().includes(keyword) ||
            (r.description || '').toLowerCase().includes(keyword) ||
            (r.tags || []).some(t => String(t).toLowerCase().includes(keyword))
        );
        return inCategory && inKeyword;
    });
}

function render() {
    const list = filteredResources();
    els.container.className = 'card-grid';
    els.container.innerHTML = '';

    if (!list.length) {
        els.container.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><div>未找到结果</div></div>';
        return;
    }

    const frag = document.createDocumentFragment();
    list.forEach(item => frag.appendChild(renderCard(item)));
    els.container.appendChild(frag);
}

function renderCard(item) {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-body">
            <div class="card-head">
                <div class="card-icon">${iconClass(item)}</div>
                <div class="head-text">
                    <h3 class="card-title">${escapeHtml(item.title || '')}</h3>
                    <p class="card-desc">${escapeHtml(item.description || '')}</p>
                </div>
            </div>
            <div class="tag-row">${(item.tags||[]).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
            <div class="action-row">${(item.links||[]).map(renderLink).join('')}</div>
        </div>
    `;
    return card;
}

function renderLink(link) {
    const type = link.type || 'primary';
    const icon = type === 'download' ? '<i class="fas fa-download"></i>' : '<i class="fas fa-external-link-alt"></i>';
    const cls = type === 'secondary' ? 'btn ghost' : (type === 'danger' ? 'btn danger' : 'btn primary');
    const target = (link.url || '').startsWith('http') ? ' target="_blank" rel="noopener"' : '';
    return `<a class="${cls}" href="${encodeURI(link.url || '#')}"${target}>${icon}${escapeHtml(link.text || '打开')}</a>`;
}

function iconClass(item) {
    const map = {
        websites: '<i class="fas fa-globe"></i>',
        apps: '<i class="fas fa-download"></i>',
        links: '<i class="fas fa-link"></i>',
        docs: '<i class="fas fa-file-alt"></i>',
        learn: '<i class="fas fa-graduation-cap"></i>'
    };
    return map[item.category] || '<i class="fas fa-info-circle"></i>';
}

function debounce(fn, wait) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"]+/g, s => ({ '&': '&', '<': '<', '>': '>', '"': '"' }[s]));
}
