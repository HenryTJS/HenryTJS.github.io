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
});

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
        renderAchievements(data.achievements);
        renderExperience(data.experience);
        renderApps(data.apps);
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
            <p class="profile-intro">${profile.intro}</p>
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

function renderApps(apps) {
    const appsSection = document.getElementById('apps');
    appsSection.innerHTML = `
        <h2><i class="fas fa-th-large" style="margin-right: 6px; color: var(--color-accent);"></i>我的应用</h2>
        <div class="app-grid">
            ${apps.map(app => `
                <a href="${app.link}" class="app-item">
                    <div class="app-icon"><i class="${app.icon}"></i></div>
                    <div class="app-name">${app.name}</div>
                </a>
            `).join('')}
        </div>
    `;
}
