/* ============================================
   趣味数学 - 文档详情页 JavaScript
   功能：左侧目录树 / 右侧大纲 / 阅读进度 / 代码复制 /
        提示块 / KaTeX / 上下篇切换
   ============================================ */

(function () {
    'use strict';

    const $ = id => document.getElementById(id);
    const CALLOUT_ICONS = {
        note: 'fa-info-circle',
        tip: 'fa-lightbulb',
        warn: 'fa-exclamation-triangle',
        important: 'fa-star'
    };

    let ARTICLE_LIST = [];   // 扁平化后的全部篇目
    let CURRENT = null;      // 当前篇目元数据

    document.addEventListener('DOMContentLoaded', init);

    /* ================= 初始化 ================= */
    function init() {
        bindChrome();
        const id = new URLSearchParams(location.search).get('id');

        if (!id) {
            showError('缺少参数', '地址中未指定篇目 id，请从目录页进入。');
            return;
        }

        fetch('../json/data.json')
            .then(res => res.json())
            .then(data => {
                ARTICLE_LIST = flatten(data);
                renderTree(data, id);

                const idx = ARTICLE_LIST.findIndex(a => a.id === id);
                if (idx === -1) {
                    showError('未找到该篇目', `目录中没有 id 为「${id}」的文章。`);
                    return;
                }
                CURRENT = ARTICLE_LIST[idx];
                renderHeader(CURRENT);
                renderPager(idx);
                loadArticle(CURRENT);
            })
            .catch(err => {
                console.error('加载目录失败:', err);
                showError('目录加载失败', '请通过本地服务器（http://）访问本页面。');
            });
    }

    /* ================= 通用页面行为 ================= */
    function bindChrome() {
        const navBar = $('mainNavBar');
        const progress = $('readingProgress');

        window.addEventListener('scroll', () => {
            navBar.classList.toggle('scrolled', window.scrollY > 20);
            const h = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (h > 0 ? Math.min(window.scrollY / h, 1) * 100 : 0) + '%';
        }, { passive: true });

        // 移动端目录抽屉
        const sidebar = $('docSidebar');
        const mask = $('sidebarMask');
        $('sidebarToggle').addEventListener('click', () => {
            sidebar.classList.add('open');
            mask.classList.add('show');
        });
        mask.addEventListener('click', () => {
            sidebar.classList.remove('open');
            mask.classList.remove('show');
        });
    }

    /* ================= 数据扁平化 ================= */
    function flatten(data) {
        const section = data.sections && data.sections[0];
        const group = section && section.groups && section.groups[0];
        const article = group && group.article;
        if (!section || !group || !article) return [];

        return [Object.assign({}, article, {
            title: group.title,
            summary: group.desc || article.summary,
            sectionId: section.id,
            sectionTitle: section.title,
            groupId: group.id,
            groupTitle: group.title
        })];
    }

    /* ================= 左侧目录树 ================= */
    function renderTree(data, activeId) {
        const tree = $('sidebarTree');
        const fragment = document.createDocumentFragment();
        const section = data.sections && data.sections[0];
        const group = section && section.groups && section.groups[0];

        if (!section || !group) return;

        const sectionEl = document.createElement('div');
        sectionEl.className = 'tree-section';

        const head = document.createElement('div');
        head.className = 'tree-section-head';
        head.innerHTML = `<i class="fas ${section.icon || 'fa-calculator'}"></i> ${section.title}`;
        sectionEl.appendChild(head);

        const article = group.article;
        if (!article) return;
        const item = document.createElement('a');
        item.className = 'tree-item active';
        item.href = 'index.html?id=' + encodeURIComponent(article.id);
        item.dataset.keyword = (group.title + ' ' + (article.tags || []).join(' ')).toLowerCase();
        item.innerHTML = `<span class="t-title">${group.title}</span>`;
        sectionEl.appendChild(item);
        fragment.appendChild(sectionEl);

        tree.innerHTML = '';
        tree.appendChild(fragment);

        // 高亮项滚动到可视区
        const active = tree.querySelector('.tree-item.active');
        if (active) {
            const rect = active.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                active.scrollIntoView({ block: 'center' });
            }
        }

        // 目录搜索
        $('sidebarSearch').addEventListener('input', e => {
            const kw = e.target.value.trim().toLowerCase();
            const item = tree.querySelector('.tree-item');
            const hit = !kw || item.dataset.keyword.includes(kw);
            item.style.display = hit ? '' : 'none';
            tree.querySelector('.tree-section').style.display = hit ? '' : 'none';
            let empty = tree.querySelector('.tree-empty');
            if (!hit) {
                if (!empty) {
                    empty = document.createElement('div');
                    empty.className = 'tree-empty';
                    empty.textContent = '没有匹配的篇目';
                    tree.appendChild(empty);
                }
            } else if (empty) {
                empty.remove();
            }
        });
    }

    /* ================= 头部信息 ================= */
    function renderHeader(article) {
        document.title = article.title + ' - 趣味数学 - seal的个人主页';
        $('doc-h1').textContent = article.title;

        const level = article.level || '入门';
        const tags = (article.tags || [])
            .map(t => `<span class="meta-tag">${t}</span>`).join('');

        $('doc-meta').innerHTML = `
            <span class="level-badge level-${level}">${level}</span>
            ${article.date ? `<span class="meta-item"><i class="far fa-calendar-alt"></i>${article.date}</span>` : ''}
            <span class="meta-item"><i class="fas fa-clock"></i>约 ${estimateMinutes(article)} 分钟</span>
            ${tags}
        `;

    }

    function estimateMinutes(article) {
        const extra = article.summary ? article.summary.length / 120 : 0;
        return Math.max(3, Math.round(4 + extra));
    }

    /* ================= 加载正文 ================= */
    function loadArticle(article) {
        if (article.status !== 'ready') {
            renderPlanned(article);
            return;
        }

        fetch(`md/${article.id}.md`)
            .then(res => {
                if (!res.ok) throw new Error('Markdown 文件不存在');
                return res.text();
            })
            .then(md => {
                const contentEl = $('doc-content');
                const guarded = protectMath(md);
                contentEl.innerHTML = guarded.restore(marked.parse(guarded.text));

                enhanceCodeBlocks(contentEl);
                enhanceCallouts(contentEl);
                renderMath(contentEl);
                buildOutline(contentEl);
                $('docFooterNote').textContent =
                    '本文由 seal 整理撰写，示例代码均可直接运行，欢迎交流讨论。';
            })
            .catch(err => {
                console.error(err);
                renderPlanned(article, err.message);
            });
    }

    /* 未完成的篇目 */
    function renderPlanned(article, reason) {
        $('doc-content').innerHTML = `
            <div class="placeholder">
                <div class="ph-icon"><i class="fas fa-hourglass-half"></i></div>
                <h2>这一篇还在写作中</h2>
                <p>${reason ? '（' + reason + '）' : ''}目录框架已经搭好，内容会陆续补上。</p>
                <div class="ph-plan">
                    <div class="ph-plan-title"><i class="fas fa-list-check"></i> 计划包含的内容</div>
                    <ol>
                        <li><strong>是什么</strong>：给出精确定义，并配 2–3 个最小例子。</li>
                        <li><strong>为什么有趣</strong>：历史上谁研究过、有什么著名结论或猜想。</li>
                        <li><strong>性质与规律</strong>：常用定理、递推关系、复杂度。</li>
                        <li><strong>代码实现</strong>：Python 从朴素解法到优化解法，附复杂度对比。</li>
                        <li><strong>延伸阅读</strong>：进一步的挑战题与参考资料。</li>
                    </ol>
                </div>
            </div>
        `;
        $('docFooterNote').textContent = '本篇尚在计划中，欢迎催更。';
    }

    function showError(title, message) {
        $('doc-h1').textContent = title;
        $('doc-meta').innerHTML = '';
        $('doc-content').innerHTML =
            `<div class="placeholder"><div class="ph-icon"><i class="fas fa-exclamation-circle"></i></div>
             <h2>${title}</h2><p>${message}</p></div>`;
    }

    /* ============================================
       数学公式保护
       marked 会把 $a_i \cdot b_i$ 里的下划线误判为斜体，
       因此先取出公式片段做占位，解析完 Markdown 再还原。
       ============================================ */
    function protectMath(markdown) {
        const store = [];
        const token = i => `@@MATH${i}@@`;
        const inFence = { flag: false };

        const text = markdown.split('\n').map(line => {
            if (/^\s*```/.test(line)) { inFence.flag = !inFence.flag; return line; }
            if (inFence.flag) return line;

            // 行间公式 $$...$$ （可跨行，这里只处理单行内闭合的情况）
            let out = line.replace(/\$\$([\s\S]+?)\$\$/g, m => {
                store.push(m);
                return token(store.length - 1);
            });
            // 行内公式 $...$
            out = out.replace(/\$([^\s$][^\n$]*?)\$/g, m => {
                store.push(m);
                return token(store.length - 1);
            });
            return out;
        }).join('\n');

        return {
            text,
            restore: html => html.replace(/@@MATH(\d+)@@/g, (_, i) => store[Number(i)])
        };
    }

    /* ================= 代码块：语言标签 + 复制按钮 ================= */    function enhanceCodeBlocks(container) {
        container.querySelectorAll('pre').forEach(pre => {
            if (pre.querySelector('.copy-btn')) return;
            const code = pre.querySelector('code');
            if (!code) return;

            const cls = code.className || '';
            const m = cls.match(/language-([\w+-]+)/);
            const lang = m ? m[1] : 'text';

            if (m) {
                const label = document.createElement('span');
                label.className = 'code-lang';
                label.textContent = lang;
                pre.appendChild(label);
            }

            const btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.type = 'button';
            btn.title = '复制代码';
            btn.innerHTML = '<i class="fas fa-copy"></i>';
            btn.addEventListener('click', () => {
                const text = code.innerText;
                const done = () => {
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-copy"></i>';
                        btn.classList.remove('copied');
                    }, 1600);
                };
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(text).then(done).catch(fallback);
                } else {
                    fallback();
                }
                function fallback() {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
                    ta.remove();
                }
            });
            pre.appendChild(btn);
        });
    }

    /* ================= 提示块 ================= */
    /* 用法（Markdown 中）：
       > [!TIP] 小标题
       > 正文内容
    */
    function enhanceCallouts(container) {
        container.querySelectorAll('blockquote').forEach(bq => {
            const first = bq.firstElementChild;
            if (!first) return;
            const html = first.innerHTML;
            const m = html.match(/^\s*\[!(NOTE|TIP|WARN|WARNING|IMPORTANT)\]\s*([\s\S]*?)(?:<br\s*\/?>|$)/i);
            if (!m) return;

            const type = m[1].toLowerCase() === 'warning' ? 'warn' : m[1].toLowerCase();
            const title = m[2].trim();
            const rest = html.slice(m[0].length).trim();

            bq.className = 'callout ' + type;
            bq.innerHTML =
                `<div class="callout-title"><i class="fas ${CALLOUT_ICONS[type] || 'fa-info-circle'}"></i>${title}</div>` +
                (rest ? `<p>${rest}</p>` : '');
        });
    }

    /* ================= KaTeX ================= */
    function renderMath(container) {
        const run = () => {
            if (typeof renderMathInElement !== 'function') return;
            renderMathInElement(container, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        };
        if (typeof renderMathInElement === 'function') {
            run();
        } else {
            window.addEventListener('load', run, { once: true });
        }
    }

    /* ================= 右侧大纲 + 滚动高亮 ================= */
    function buildOutline(container) {
        const list = $('outlineList');
        const heads = Array.from(container.querySelectorAll('h2, h3'));

        list.innerHTML = '';
        if (!heads.length) {
            list.innerHTML = '<span class="outline-item">（暂无小节）</span>';
            return;
        }

        heads.forEach((h, i) => {
            h.id = 'sec-' + (i + 1);
            const a = document.createElement('a');
            a.className = 'outline-item level-' + h.tagName[1];
            a.href = '#' + h.id;
            a.textContent = h.textContent.replace(/^#\s*/, '');
            list.appendChild(a);
        });

        const items = Array.from(list.querySelectorAll('.outline-item'));
        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                items.forEach(it => it.classList.toggle('active', it.getAttribute('href') === '#' + id));
            });
        }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });

        heads.forEach(h => spy.observe(h));
    }

    /* ================= 上一篇 / 下一篇 ================= */
    function renderPager(idx) {
        const pager = $('docPager');
        const prev = idx > 0 ? ARTICLE_LIST[idx - 1] : null;
        const next = idx < ARTICLE_LIST.length - 1 ? ARTICLE_LIST[idx + 1] : null;

        pager.innerHTML = `
            ${prev ? `<a class="pager-card prev" href="index.html?id=${encodeURIComponent(prev.id)}">
                <span class="pager-label"><i class="fas fa-arrow-left"></i> 上一篇 · ${prev.groupTitle}</span>
                <span class="pager-title">${prev.title}</span>
            </a>` : '<span class="pager-card empty"></span>'}
            ${next ? `<a class="pager-card next" href="index.html?id=${encodeURIComponent(next.id)}">
                <span class="pager-label">下一篇 · ${next.groupTitle} <i class="fas fa-arrow-right"></i></span>
                <span class="pager-title">${next.title}</span>
            </a>` : '<span class="pager-card empty"></span>'}
        `;
    }
})();
