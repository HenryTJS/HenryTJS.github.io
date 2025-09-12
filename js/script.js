document.addEventListener('DOMContentLoaded', function() {
    const scrollDown = document.getElementById('scrollDown');
    scrollDown.addEventListener('click', function() {
        const heroSection = document.getElementById('hero');
        window.scrollTo({
            top: heroSection.offsetHeight,
            behavior: 'smooth'
        });
    });
});
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
// 加载 JSON 数据
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

// 渲染个人信息
function renderProfile(profile) {
    const profileSection = document.getElementById('profile');
    profileSection.innerHTML = `
        <div class="profile">
            <img src="${profile.avatar}" alt="我的头像" class="profile-img">
            <div class="profile-text">
                <h1>${profile.name}</h1>
                <p>${profile.major}</p>
                <p>📍 坐标：${profile.location}</p>
            </div>
        </div>
        <p style="margin-top: 1rem;">${profile.intro}</p>
    `;
}

// 渲染联系方式
function renderContact(contact) {
    const contactSection = document.getElementById('contact');
    contactSection.innerHTML = `
        <h2>联系方式</h2>
        ${contact.map(item => `
            <div class="contact-item">
                <i class="${item.icon}"></i>
                <a href="${item.link}" style="color: inherit; text-decoration: none;">${item.text}</a>
            </div>
        `).join('')}
    `;
}

// 渲染成就
function renderAchievements(achievements) {
    const achievementsSection = document.getElementById('achievements');
    achievementsSection.innerHTML = achievements.map(item => `
        <p><strong>${item.icon} ${item.title}</strong>
            <ul style="margin-left: 1.5rem; list-style-type: circle;">
                ${item.details.map(detail => `<li>${detail}</li>`).join('')}
            </ul>
        </p>
    `).join('');
}

// 渲染履历
function renderExperience(experience) {
    const experienceSection = document.getElementById('experience');
    experienceSection.innerHTML = experience.map(item => `
        <p><strong>${item.title}</strong></p>
        <ul style="margin-left: 1.5rem; list-style-type: circle;">
            ${item.items.map(exp => `<li>${exp}</li>`).join('')}
        </ul>
    `).join('');
}

// 渲染应用
function renderApps(apps) {
    const appsSection = document.getElementById('apps');
    appsSection.innerHTML = `
        <h2>我的应用</h2>
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