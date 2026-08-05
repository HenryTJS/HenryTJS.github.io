/* ============================================
   seal的个人主页 - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // ---------- 滚动监听：导航栏阴影 ----------
    const navBar = document.getElementById('mainNavBar');
    let lastScrollY = 0;

    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        if (scrollY > 20) {
            navBar.classList.add('scrolled');
        } else {
            navBar.classList.remove('scrolled');
        }
        lastScrollY = scrollY;
    }, { passive: true });

    // ---------- 滚动渐入动画 (Intersection Observer) ----------
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // ---------- 向下滚动按钮 ----------
    const scrollDown = document.getElementById('scrollDown');
    if (scrollDown) {
        scrollDown.addEventListener('click', function() {
            const heroSection = document.getElementById('hero');
            window.scrollTo({
                top: heroSection.offsetHeight,
                behavior: 'smooth'
            });
        });
    }

    // ---------- Hero 粒子背景 ----------
    createHeroParticles();

    // ---------- Hero 打字机效果 ----------
    initTypewriter();
});

// ---------- Hero 粒子背景 ----------
function createHeroParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    // 几何装饰圆
    for (let i = 0; i < 3; i++) {
        const geo = document.createElement('div');
        geo.className = 'hero-geo';
        container.appendChild(geo);
    }

    // 粒子
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'hero-particle';
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        container.appendChild(particle);
    }
}

// ---------- Hero 打字机效果 ----------
function initTypewriter() {
    const textElement = document.getElementById('typewriterText');
    if (!textElement) return;

    const phrases = [
        '行远自迩，登高自卑',
        'When there is a will, there is a way',
        '路漫漫其修远兮，吾将上下而求索',
        '知行合一，止于至善'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isPaused) {
            isPaused = false;
            isDeleting = true;
            setTimeout(type, 50);
            return;
        }

        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(type, 500);
                return;
            }
            setTimeout(type, 30);
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === currentPhrase.length) {
                isPaused = true;
                setTimeout(type, 2500);
                return;
            }
            setTimeout(type, 80);
        }
    }

    // 延迟启动打字机
    setTimeout(type, 1500);
}

// ---------- Tab 切换 ----------
function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    const tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// ---------- 加载 JSON 数据 ----------
fetch('json/data.json')
    .then(response => response.json())
    .then(data => {
        renderProfile(data.profile);
        renderContact(data.contact);
        renderInterests(data.interests);
        renderHeroStats(data);
        renderAchievements(data.achievements);
        renderExperience(data.experience);
        renderSkills(data.skills);

        // 加载外部数据
        loadRecentArticles();
        loadRecentTrips();
    })
    .catch(error => console.error('Error loading JSON:', error));

// ---------- 渲染函数 ----------
function renderProfile(profile) {
    const profileSection = document.getElementById('profile');
    profileSection.innerHTML = `
        <div class="profile">
            <img src="${profile.avatar}" alt="我的头像" class="profile-img">
            <div class="profile-text">
                <h1>${profile.name}</h1>
                <p>${profile.major}</p>
                <p>📍 ${profile.location}</p>
            </div>
            ${profile.motto ? `
            <div class="profile-motto">
                <span class="profile-motto-text">${profile.motto}</span>
                ${profile.motto_author ? `<span class="profile-motto-author">—— ${profile.motto_author}</span>` : ''}
            </div>
            ` : ''}
        </div>
    `;
}

function renderContact(contact) {
    const contactSection = document.getElementById('contact');
    contactSection.innerHTML = `
        <h2><i class="fas fa-address-card" style="margin-right: 6px; color: var(--color-accent);"></i>联系方式</h2>
        ${contact.map(item => `
            <div class="contact-item">
                <i class="${item.icon}"></i>
                <a href="${item.link}" target="_blank" rel="noopener">${item.text}</a>
            </div>
        `).join('')}
    `;
}

function renderInterests(interests) {
    const interestsSection = document.getElementById('interests');
    if (!interests || interests.length === 0) return;
    interestsSection.innerHTML = `
        <h2><i class="fas fa-heart" style="margin-right: 6px; color: var(--color-accent);"></i>兴趣爱好</h2>
        <div class="interests-grid">
            ${interests.map(item => `
                <div class="interest-item">
                    <i class="${item.icon}"></i>
                    <span>${item.name}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderHeroStats(data) {
    const statsSection = document.getElementById('heroStats');
    if (!statsSection) return;
    const achievementCount = data.achievements ? data.achievements.length : 0;

    statsSection.innerHTML = `
        <div class="hero-stats-grid">
            <div class="hero-stat-item">
                <span class="hero-stat-number" id="statArticles">...</span>
                <span class="hero-stat-label">阅读笔记</span>
            </div>
            <div class="hero-stat-item">
                <span class="hero-stat-number" id="statCities">...</span>
                <span class="hero-stat-label">到访城市</span>
            </div>
            <div class="hero-stat-item">
                <span class="hero-stat-number" id="statProvinces">...</span>
                <span class="hero-stat-label">到访省份</span>
            </div>
            <div class="hero-stat-item">
                <span class="hero-stat-number">${achievementCount}</span>
                <span class="hero-stat-label">个人成就</span>
            </div>
        </div>
    `;

    // 从足迹数据动态统计到访城市数与省份数
    fetch('trip/json/data.json')
        .then(response => response.json())
        .then(tripData => {
            const footprints = tripData.footprints || [];
            const citySet = new Set();
            const provinceSet = new Set();
            footprints.forEach(fp => {
                if (fp.city) citySet.add(fp.city);
                if (fp.province) provinceSet.add(fp.province);
            });
            const cityEl = document.getElementById('statCities');
            const provinceEl = document.getElementById('statProvinces');
            if (cityEl) cityEl.textContent = citySet.size;
            if (provinceEl) provinceEl.textContent = provinceSet.size;
        })
        .catch(() => {});

    // 从文章数据动态统计文章数
    countArticles();
}

function renderAchievements(achievements) {
    const achievementsSection = document.getElementById('achievements');
    achievementsSection.innerHTML = achievements.map(item => `
        <div class="achievement-item">
            <div class="achievement-title">
                <span>${item.icon}</span>
                <span>${item.title}</span>
            </div>
            ${item.details.length > 0 ? `
                <ul class="achievement-details">
                    ${item.details.map(detail => `<li>${detail}</li>`).join('')}
                </ul>
            ` : ''}
        </div>
    `).join('');
}

function renderExperience(experience) {
    const experienceSection = document.getElementById('experience');
    experienceSection.innerHTML = experience.map(item => `
        <div class="experience-block">
            <div class="experience-block-title">${item.title}</div>
            <ul>
                ${item.items.map(exp => `<li>${exp}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

function renderSkills(skills) {
    const skillsSection = document.getElementById('skills');
    if (!skills || skills.length === 0) return;
    skillsSection.innerHTML = `
        <h2><i class="fas fa-code" style="margin-right: 6px; color: var(--color-accent);"></i>技术栈</h2>
        <div class="skills-grid">
            ${skills.map(skill => `
                <div class="skill-item">
                    <div class="skill-header">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-percent">${skill.level}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-bar-fill" style="width: 0%; background: ${skill.color};" data-width="${skill.level}"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // 技能条动画（延迟触发）
    setTimeout(() => {
        document.querySelectorAll('.skill-bar-fill').forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
        });
    }, 300);
}

// ---------- 加载最新文章 ----------
function loadRecentArticles() {
    fetch('article/json/article.json')
        .then(response => response.json())
        .then(data => {
            // 收集所有文章并排序
            const allArticles = [];
            data.categories.forEach(category => {
                category.articles.forEach(article => {
                    allArticles.push({
                        ...article,
                        category: category.title
                    });
                });
            });

            // 按日期降序排列
            allArticles.sort((a, b) => b.date.localeCompare(a.date));

            // 取最新 3 篇
            const recentArticles = allArticles.slice(0, 3);

            const container = document.getElementById('recentArticles');
            container.innerHTML = `
                <h2><i class="fas fa-book-open" style="margin-right: 6px; color: var(--color-accent);"></i>最新文章</h2>
                ${recentArticles.map(article => `
                    <div class="recent-article-item">
                        <div class="recent-article-icon"><i class="fas fa-file-alt"></i></div>
                        <div class="recent-article-info">
                            <div class="recent-article-title">${article.title}</div>
                            <div class="recent-article-meta">
                                <span>${article.date}</span>
                                <span class="recent-article-category">${article.category}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
                <a href="/article" class="recent-articles-more">
                    <i class="fas fa-arrow-right"></i> 查看全部文章
                </a>
            `;
        })
        .catch(error => {
            console.error('Error loading articles:', error);
            // 如果加载失败，隐藏该板块
            const container = document.getElementById('recentArticles');
            if (container) container.style.display = 'none';
        });
}

// ---------- 加载最新足迹 ----------
function loadRecentTrips() {
    fetch('trip/json/data.json')
        .then(response => response.json())
        .then(data => {
            // 按日期降序排列
            const sortedTrips = [...data.footprints].sort((a, b) => b.visitDate.localeCompare(a.visitDate));

            // 取最新 5 个
            const recentTrips = sortedTrips.slice(0, 5);

            const container = document.getElementById('recentTrips');
            container.innerHTML = `
                <h2><i class="fas fa-map-marker-alt" style="margin-right: 6px; color: var(--color-accent);"></i>最新足迹</h2>
                ${recentTrips.map(trip => `
                    <div class="recent-trip-item">
                        <span class="recent-trip-dot" style="background: ${trip.color};"></span>
                        <span class="recent-trip-city">${trip.city}</span>
                        <span class="recent-trip-province">${trip.province}</span>
                        <span class="recent-trip-type">${trip.type}</span>
                        <span class="recent-trip-date">${trip.visitDate}</span>
                    </div>
                `).join('')}
                <a href="/trip" class="recent-articles-more">
                    <i class="fas fa-arrow-right"></i> 查看全部足迹
                </a>
            `;
        })
        .catch(error => {
            console.error('Error loading trips:', error);
            const container = document.getElementById('recentTrips');
            if (container) container.style.display = 'none';
        });
}

// ---------- 统计文章数量 ----------
function countArticles() {
    fetch('article/json/article.json')
        .then(response => response.json())
        .then(data => {
            let count = 0;
            (data.categories || []).forEach(category => {
                count += (category.articles || []).length;
            });
            const statEl = document.getElementById('statArticles');
            if (statEl) statEl.textContent = count;
        })
        .catch(() => {});
}
