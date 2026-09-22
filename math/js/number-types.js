/* Add a new object here to register another number type. */
const numberTypes = [
    {
        id: 'even',
        name: '偶数',
        category: '基础性质',
        description: '可以被 2 整除的整数。',
        test: number => number % 2n === 0n
    },
    {
        id: 'odd',
        name: '奇数',
        category: '基础性质',
        description: '不能被 2 整除的整数。',
        test: number => number % 2n !== 0n
    },
    {
        id: 'prime',
        name: '质数',
        category: '基础性质',
        description: '大于 1 且只有 1 和自身两个正因数的整数。',
        test: isPrime
    },
    {
        id: 'composite',
        name: '合数',
        category: '基础性质',
        description: '大于 1 且除了 1 和自身以外还有其他因数的整数。',
        test: number => number > 1n && !isPrime(number)
    },
    {
        id: 'palindrome',
        name: '回文数',
        category: '数字结构',
        description: '从左向右和从右向左读都相同的数。',
        test: number => {
            const text = number.toString();
            return text === [...text].reverse().join('');
        }
    },
    {
        id: 'square',
        name: '完全平方数',
        category: '数学结构',
        description: '可以表示为某个整数平方的数。',
        test: number => isPerfectPower(number, 2)
    },
    {
        id: 'cube',
        name: '完全立方数',
        category: '数学结构',
        description: '可以表示为某个整数立方的数。',
        test: number => isPerfectPower(number, 3)
    },
    {
        id: 'triangular',
        name: '三角数',
        category: '数学结构',
        description: '可以表示为前 n 个正整数之和的数。',
        test: number => isTriangular(number)
    },
    {
        id: 'perfect',
        name: '完全数',
        category: '因数结构',
        description: '真因数之和等于自身的数，例如 6 和 28。',
        test: number => isPerfectNumber(number)
    },
    {
        id: 'armstrong',
        name: '水仙花数',
        category: '数字结构',
        description: '各位数字的 n 次幂之和等于自身的 n 位数。',
        test: number => {
            const digits = number.toString().split('').map(Number);
            const power = BigInt(digits.length);
            return digits.reduce((sum, digit) => sum + BigInt(digit) ** power, 0n) === number;
        }
    },
    {
        id: 'fibonacci',
        name: '斐波那契数',
        category: '数列',
        description: '出现在斐波那契数列 0, 1, 1, 2, 3... 中的数。',
        test: number => isFibonacci(number)
    }
];

function isPrime(number) {
    if (number < 2n) return false;
    if (number === 2n) return true;
    if (number % 2n === 0n) return false;

    for (let divisor = 3n; divisor * divisor <= number; divisor += 2n) {
        if (number % divisor === 0n) return false;
    }
    return true;
}

function integerRoot(number, degree) {
    let low = 0n;
    let high = number + 1n;

    while (high - low > 1n) {
        const middle = (low + high) / 2n;
        if (middle ** BigInt(degree) <= number) {
            low = middle;
        } else {
            high = middle;
        }
    }
    return low;
}

function isPerfectPower(number, degree) {
    if (number < 0n) return false;
    const root = integerRoot(number, degree);
    return root ** BigInt(degree) === number;
}

function isTriangular(number) {
    return isPerfectPower(8n * number + 1n, 2);
}

function isPerfectNumber(number) {
    if (number < 2n) return false;
    let sum = 1n;

    for (let divisor = 2n; divisor * divisor <= number; divisor++) {
        if (number % divisor === 0n) {
            sum += divisor;
            const pair = number / divisor;
            if (pair !== divisor) sum += pair;
        }
    }
    return sum === number;
}

function isFibonacci(number) {
    return isPerfectPower(5n * number * number + 4n, 2) ||
        isPerfectPower(5n * number * number - 4n, 2);
}
