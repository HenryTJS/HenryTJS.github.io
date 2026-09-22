const MAX_RANGE_SIZE = 1000000;
const numberTypeMap = new Map(numberTypes.map(type => [type.id, type]));

const elements = {
    propertyTab: document.querySelector('#propertyTab'),
    rangeTab: document.querySelector('#rangeTab'),
    propertyPanel: document.querySelector('#propertyPanel'),
    rangePanel: document.querySelector('#rangePanel'),
    propertyForm: document.querySelector('#propertyForm'),
    rangeForm: document.querySelector('#rangeForm'),
    numberInput: document.querySelector('#numberInput'),
    minInput: document.querySelector('#minInput'),
    maxInput: document.querySelector('#maxInput'),
    typeSelect: document.querySelector('#typeSelect'),
    propertyError: document.querySelector('#propertyError'),
    rangeError: document.querySelector('#rangeError'),
    propertyResult: document.querySelector('#propertyResult'),
    rangeResult: document.querySelector('#rangeResult')
};

initialize();

function initialize() {
    renderTypeOptions();
    elements.propertyTab.addEventListener('click', () => switchMode('property'));
    elements.rangeTab.addEventListener('click', () => switchMode('range'));
    elements.propertyForm.addEventListener('submit', handlePropertyQuery);
    elements.rangeForm.addEventListener('submit', handleRangeQuery);
}

function switchMode(mode) {
    const isPropertyMode = mode === 'property';
    elements.propertyTab.classList.toggle('active', isPropertyMode);
    elements.rangeTab.classList.toggle('active', !isPropertyMode);
    elements.propertyTab.setAttribute('aria-selected', String(isPropertyMode));
    elements.rangeTab.setAttribute('aria-selected', String(!isPropertyMode));
    elements.propertyPanel.hidden = !isPropertyMode;
    elements.rangePanel.hidden = isPropertyMode;
    elements.propertyPanel.classList.toggle('active', isPropertyMode);
    elements.rangePanel.classList.toggle('active', !isPropertyMode);
}

function renderTypeOptions() {
    const groups = groupTypesByCategory();
    elements.typeSelect.innerHTML = [...groups.entries()].map(([category, types]) => `
        <optgroup label="${category}">
            ${types.map(type => `<option value="${type.id}">${type.name}</option>`).join('')}
        </optgroup>
    `).join('');
}

function groupTypesByCategory() {
    return numberTypes.reduce((groups, type) => {
        if (!groups.has(type.category)) groups.set(type.category, []);
        groups.get(type.category).push(type);
        return groups;
    }, new Map());
}

function handlePropertyQuery(event) {
    event.preventDefault();
    clearMessage(elements.propertyError);
    const rawValue = elements.numberInput.value.trim();

    if (!/^\d+$/.test(rawValue) || BigInt(rawValue) < 1n) {
        showMessage(elements.propertyError, '请输入一个大于 0 的正整数。');
        return;
    }

    const number = BigInt(rawValue);
    const matches = numberTypes.filter(type => type.test(number));
    const digits = rawValue.length;

    elements.propertyResult.innerHTML = `
        <div class="result-summary">
            <div><span class="summary-label">分析对象</span><strong class="large-number">${rawValue}</strong></div>
            <div class="summary-stat"><span class="summary-label">数字位数</span><strong>${digits}</strong></div>
            <div class="summary-stat"><span class="summary-label">命中类型</span><strong>${matches.length}</strong></div>
        </div>
        <div class="match-list">
            ${numberTypes.map(type => `
                <div class="match-row ${type.test(number) ? 'is-match' : ''}">
                    <span class="match-mark">${type.test(number) ? '✓' : '—'}</span>
                    <span class="match-name">${type.name}</span>
                    <span class="match-description">${type.description}</span>
                    <span class="match-status">${type.test(number) ? '是' : '否'}</span>
                </div>
            `).join('')}
        </div>
    `;
    elements.propertyResult.classList.remove('hidden');
}

function handleRangeQuery(event) {
    event.preventDefault();
    clearMessage(elements.rangeError);

    const minimum = Number(elements.minInput.value);
    const maximum = Number(elements.maxInput.value);
    const type = numberTypeMap.get(elements.typeSelect.value);

    if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) || minimum < 1 || maximum < minimum) {
        showMessage(elements.rangeError, '请输入有效的正整数范围，且结束值不能小于起始值。');
        return;
    }
    if (maximum - minimum + 1 > MAX_RANGE_SIZE) {
        showMessage(elements.rangeError, '范围过大，请将区间控制在 100 万个整数以内。');
        return;
    }

    const matches = [];
    for (let value = minimum; value <= maximum; value++) {
        if (type.test(BigInt(value))) matches.push(value);
    }

    elements.rangeResult.innerHTML = `
        <div class="result-summary">
            <div><span class="summary-label">查询类型</span><strong class="large-number">${type.name}</strong></div>
            <div class="summary-stat"><span class="summary-label">查询范围</span><strong>${minimum} - ${maximum}</strong></div>
            <div class="summary-stat"><span class="summary-label">找到</span><strong>${matches.length}</strong></div>
        </div>
        <div class="range-toolbar">
            <span>${type.description}</span>
            <button class="copy-button" type="button" data-copy="${matches.join(', ')}">复制结果</button>
        </div>
        <div class="number-grid ${matches.length === 0 ? 'empty' : ''}">
            ${matches.length ? matches.map(value => `<span>${value}</span>`).join('') : '<p>这个范围内没有找到符合条件的数。</p>'}
        </div>
    `;
    elements.rangeResult.classList.remove('hidden');
    elements.rangeResult.querySelector('.copy-button')?.addEventListener('click', copyRangeResult);
}

async function copyRangeResult(event) {
    const button = event.currentTarget;
    await navigator.clipboard.writeText(button.dataset.copy);
    button.textContent = '已复制';
    window.setTimeout(() => { button.textContent = '复制结果'; }, 1600);
}

function showMessage(element, message) {
    element.textContent = message;
}

function clearMessage(element) {
    element.textContent = '';
}
