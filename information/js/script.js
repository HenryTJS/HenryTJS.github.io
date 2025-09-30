// 轻量状态
let state = {
  resources: [],
  keyword: '',
  category: 'links',
  view: 'grid'
};

const els = {
  container: null,
  empty: null,
  search: null,
  clear: null,
  filters: null,
  gridBtn: null,
  listBtn: null
};

document.addEventListener('DOMContentLoaded', async () => {
  cacheDom();
  bindEvents();
  await loadData();
  render();
});

function cacheDom() {
  els.container = document.getElementById('resourceContainer');
  els.empty = null;
  els.search = document.getElementById('searchInput');
  els.clear = document.getElementById('clearSearch');
  els.filters = document.querySelector('.filters');
  els.gridBtn = null;
  els.listBtn = null;
}

function bindEvents() {
  if (els.search) {
    els.search.addEventListener('input', debounce((e) => {
      state.keyword = e.target.value.trim().toLowerCase();
      render();
    }, 200));
  }
  if (els.clear) {
    els.clear.addEventListener('click', () => {
      state.keyword = '';
      els.search.value = '';
      render();
    });
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
  // 视图切换已移除，固定为网格
}

async function loadData() {
  try {
    const res = await fetch('json/data.json', { cache: 'no-store' });
    state.resources = (await res.json()).resources || [];
  } catch (err) {
    console.error('加载数据失败', err);
    state.resources = getFallbackResources();
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
    // 无结果时保持空白
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
        <div class="card-icon"><i class="${iconClass(item)}"></i></div>
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
  const icon = type === 'download' ? 'fa-solid fa-download' : 'fa-solid fa-arrow-up-right-from-square';
  const cls = type === 'secondary' ? 'btn ghost' : (type === 'danger' ? 'btn danger' : 'btn primary');
  const target = (link.url || '').startsWith('http') ? ' target="_blank" rel="noopener"' : '';
  return `<a class="${cls}" href="${encodeURI(link.url || '#')}"${target}><i class="${icon}"></i>${escapeHtml(link.text || '打开')}</a>`;
}

function iconClass(item) {
  if (item.icon) return item.icon;
  const map = { websites: 'fa-solid fa-globe', apps: 'fa-solid fa-mobile-screen', links: 'fa-solid fa-link', docs: 'fa-solid fa-file-lines', learn: 'fa-solid fa-graduation-cap' };
  return map[item.category] || 'fa-solid fa-circle-info';
}

// 视图切换函数删除，固定三列

function debounce(fn, wait) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"]+/g, s => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[s]));
}

function getFallbackResources() {
  return [
    { title: 'GitHub', description: '全球最大的代码托管平台', category: 'websites', tags:['开发','开源'], links:[{ text:'访问', url:'https://github.com', type:'primary' }] },
    { title: 'VS Code', description: '轻量强大的代码编辑器', category: 'apps', tags:['编辑器'], links:[{ text:'下载', url:'https://code.visualstudio.com', type:'primary' }] },
    { title: '校教务', description: '常用教务系统入口', category: 'links', tags:['学校','入口'], links:[{ text:'进入', url:'#', type:'secondary' }] }
  ];
}