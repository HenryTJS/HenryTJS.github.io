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