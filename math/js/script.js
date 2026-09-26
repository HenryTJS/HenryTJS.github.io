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
    typeParams: document.querySelector('#typeParams'),
    propertyError: document.querySelector('#propertyError'),
    rangeError: document.querySelector('#rangeError'),
    propertyResult: document.querySelector('#propertyResult'),
    rangeResult: document.querySelector('#rangeResult')
};

initialize();

function initialize() {
    renderTypeOptions();
    renderTypeParams();
    elements.propertyTab.addEventListener('click', () => switchMode('property'));
    elements.rangeTab.addEventListener('click', () => switchMode('range'));
    elements.typeSelect.addEventListener('change', renderTypeParams);
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

/* 只有带 params 的类型（如 n 次方数）才会多出一个参数输入框。 */
function renderTypeParams() {
    const type = numberTypeMap.get(elements.typeSelect.value);
    const params = type?.params ?? [];

    elements.typeParams.innerHTML = params.map(param => `
        <label class="field">
            <span>${param.label}</span>
            <input type="number" data-param="${param.id}" min="${param.min}"
                value="${param.default ?? param.min}" inputmode="numeric">
        </label>
    `).join('');
    elements.typeParams.hidden = params.length === 0;
}

function collectTypeParams(type) {
    const values = {};

    for (const param of type?.params ?? []) {
        const input = elements.typeParams.querySelector(`[data-param="${param.id}"]`);
        const value = Number(input?.value);

        if (!Number.isSafeInteger(value) || value < param.min) {
            return { values, error: `${param.label} 需要是不小于 ${param.min} 的整数。` };
        }
        values[param.id] = value;
    }
    return { values };
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
    const results = numberTypes.map(type => ({ type, matched: type.test(number) }));
    const hitCount = results.filter(result => result.matched).length;
    const digits = rawValue.length;

    elements.propertyResult.innerHTML = `
        <div class="result-summary">
            <div><span class="summary-label">分析对象</span><strong class="large-number">${rawValue}</strong></div>
            <div class="summary-stat"><span class="summary-label">数字位数</span><strong>${digits}</strong></div>
            <div class="summary-stat"><span class="summary-label">命中类型</span><strong>${hitCount}</strong></div>
        </div>
        <div class="match-list">
            ${results.map(({ type, matched }) => {
                const note = matched && type.detail ? type.detail(number) : '';
                return `
                    <div class="match-row ${matched ? 'is-match' : ''}">
                        <span class="match-mark">${matched ? '✓' : '—'}</span>
                        <span class="match-name">${type.name}</span>
                        <span class="match-description">${type.description}</span>
                        <span class="match-status">${matched ? '是' : '否'}</span>
                        ${note ? `<span class="match-note">${note}</span>` : ''}
                    </div>
                `;
            }).join('')}
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

    const params = collectTypeParams(type);
    if (params.error) {
        showMessage(elements.rangeError, params.error);
        return;
    }

    const matches = type.generateInRange
        ? type.generateInRange(BigInt(minimum), BigInt(maximum), params.values)
        : testEachNumber(type, params.values, minimum, maximum);

    const typeLabel = type.label ? type.label(params.values) : type.name;

    elements.rangeResult.innerHTML = `
        <div class="result-summary">
            <div><span class="summary-label">查询类型</span><strong class="large-number">${typeLabel}</strong></div>
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

/* 没有快速生成路径的类型就逐个判断，单次最多 100 万个数。 */
function testEachNumber(type, params, minimum, maximum) {
    const matches = [];

    for (let value = minimum; value <= maximum; value++) {
        const number = BigInt(value);
        const matched = type.testWithParams ? type.testWithParams(number, params) : type.test(number);
        if (matched) matches.push(number);
    }
    return matches;
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
