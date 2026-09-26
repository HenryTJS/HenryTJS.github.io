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
        name: '素数',
        category: '基础性质',
        description: '大于 1 且只有 1 和自身两个正约数的整数。',
        test: isPrime
    },
    {
        id: 'composite',
        name: '合数',
        category: '基础性质',
        description: '大于 1 且除了 1 和自身以外还有其他约数的整数。',
        test: number => number > 1n && !isPrime(number)
    },
    {
        id: 'semiprime',
        name: '半素数',
        category: '基础性质',
        description: '可以表示为两个素数的乘积的整数。',
        test: isSemiprime
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
        id: 'perfect-power',
        name: 'n 次方数',
        category: '数学结构',
        description: '可以表示为某个整数的 n 次幂（n ≥ 2）；1 是任意次方数。',
        params: [{ id: 'exponent', label: '次方 n', min: 2, default: 2 }],
        label: params => `n 次方数（n = ${params.exponent}）`,
        test: number => number === 1n || perfectPowerExponents(number).length > 0,
        testWithParams: (number, params) => isPerfectPower(number, params.exponent),
        generateInRange: (minimum, maximum, params) => {
            const exponent = BigInt(params.exponent);
            const results = [];

            // 1 = 1ⁿ，任何次方都符合
            if (minimum <= 1n) results.push(1n);

            // 2ⁿ 已经超过上限时，范围内只有 1 符合；提前结束可避免构造巨大幂
            if (exponent >= BigInt(maximum.toString(2).length)) return results;

            for (let base = 2n; base ** exponent <= maximum; base++) {
                const value = base ** exponent;
                if (value >= minimum) results.push(value);
            }
            return results;
        },
        detail: number => {
            if (number === 1n) return '任意次方数 · 1 = 1ⁿ（n 为任意 ≥ 2 的整数）';

            const exponents = perfectPowerExponents(number);
            if (!exponents.length) return '';

            const forms = exponents
                .map(degree => `${integerRoot(number, degree)}<sup>${degree}</sup>`)
                .join('、');
            return `可表示为 ${forms}（分别是 ${exponents.join('、')} 次方）`;
        }
    },
    {
        id: 'polygonal',
        name: 'n 边形数',
        category: '数学结构',
        description: '可以写成第 k 个 n 边形数的整数（n ≥ 3）；1 是任意边形数。',
        params: [{ id: 'sides', label: '边数 n', min: 3, default: 3 }],
        label: params => `n 边形数（n = ${params.sides}）`,
        // 任何 m ≥ 3 都是 m 边形数（第 2 项就是 m），所以只需排除 2
        test: number => number === 1n || number > 2n,
        testWithParams: (number, params) => isPolygonal(number, params.sides),
        generateInRange: (minimum, maximum, params) => {
            const sides = BigInt(params.sides);
            const results = [];

            for (let term = 1n; ; term++) {
                const value = polygonalNumber(sides, term);
                if (value > maximum) break;
                if (value >= minimum) results.push(value);
            }
            return results;
        },
        detail: number => {
            if (number === 1n) return '任意边形数 · 1 = 第 1 个 n 边形数（n 为任意 ≥ 3 的整数）';

            const sides = polygonalSides(number);
            if (!sides.length) return '';

            const forms = sides
                .map(([side, term]) => `${side} 边形数（第 ${term} 项）`)
                .join('、');
            return `可表示为 ${forms}`;
        }
    },
    {
        id: 'perfect',
        name: '完全数',
        category: '约数结构',
        description: '真约数之和等于自身的数。',
        test: number => isPerfectNumber(number)
    },
    {
        id: 'abundant',
        name: '盈数',
        category: '约数结构',
        description: '真约数之和大于自身的数。',
        test: number => isAbundantNumber(number)
    },
    {
        id: 'deficient',
        name: '亏数',
        category: '约数结构',
        description: '真约数之和小于自身的数。',
        test: number => isDeficientNumber(number)
    },
    {
        id: 'semiperfect',
        name: '半完全数',
        category: '约数结构',
        description: '真约数的子集之和等于自身的数。',
        test: number => isSemiperfect(number)
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
        id: 'automorphic',
        name: '自守数',
        category: '数字结构',
        description: '平方的末尾恰好是自身的数，例如 5、6、25、76。',
        test: isAutomorphic,
        generateInRange: (minimum, maximum) =>
            automorphicNumbersUpTo(maximum).filter(value => value >= minimum),
        detail: number => `${number}² = ${number * number}（末尾正好是 ${number}）`
    },
    {
        id: 'fibonacci',
        name: '斐波那契数',
        category: '数列',
        description: '出现在斐波那契数列 0, 1, 1, 2, 3... 中的数。',
        test: number => isFibonacci(number)
    },
    {
        id: 'factorial',
        name: '阶乘数',
        category: '数列',
        description: '可以写成某个正整数阶乘的数，即 1!、2!、3!……',
        test: number => factorialIndexOf(number) > 0n,
        generateInRange: (minimum, maximum) => {
            const results = [];

            for (let index = 1n, value = 1n; value <= maximum; index++, value *= index) {
                if (value >= minimum) results.push(value);
            }
            return results;
        },
        detail: number => `${number} = ${factorialIndexOf(number)}!`
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

function isSemiprime(number) {
    if (number < 4n) return false;
    if (number % 2n === 0n) {
        return isPrime(number / 2n);
    }

    for (let divisor = 3n; divisor * divisor <= number; divisor += 2n) {
        if (number % divisor === 0n) {
            return isPrime(number / divisor);
        }
    }
    return false;
}

function integerRoot(number, degree) {
    if (number < 2n) return number < 0n ? 0n : number;

    const exponent = BigInt(degree);
    const bits = BigInt(number.toString(2).length);
    let low = 0n;
    // 2^ceil(bits / exponent) 一定是根的上界，避免大指数下的巨量中间结果
    let high = 1n << ((bits + exponent - 1n) / exponent);

    while (high - low > 1n) {
        const middle = (low + high) / 2n;
        if (middle ** exponent <= number) {
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

/* 返回 number 可以写成的所有次方（n ≥ 2），例如 64 → [2, 3, 6]。 */
function perfectPowerExponents(number) {
    if (number < 4n) return [];

    const exponents = [];
    const limit = number.toString(2).length;

    for (let degree = 2; degree <= limit; degree++) {
        if (isPerfectPower(number, degree)) exponents.push(degree);
    }
    return exponents;
}

/* 第 term 个 sides 边形数：P(n, k) = ((n-2)k² - (n-4)k) / 2 */
function polygonalNumber(sides, term) {
    const a = sides - 2n;
    const b = sides - 4n;
    return (a * term * term - b * term) / 2n;
}

/* number 是第 k 个 sides 边形数等价于 (s-4)² + 8(s-2)·number 是完全平方数 */
function isPolygonal(number, sides) {
    const a = BigInt(sides) - 2n;
    const b = BigInt(sides) - 4n;
    const discriminant = b * b + 8n * a * number;
    const root = integerRoot(discriminant, 2);

    if (root * root !== discriminant) return false;

    const numerator = root + b;
    const denominator = 2n * a;
    return numerator > 0n && numerator % denominator === 0n && numerator / denominator >= 1n;
}

/* 列出 number 能写成的所有边形，返回 [边数, 项数]，按边数升序。 */
function polygonalSides(number) {
    if (number < 3n) return [];

    const twice = 2n * number;
    const found = new Map();

    // 由 2·number = k·(s(k-1) - 2k + 4) 可知项数 k 必为 2·number 的约数
    const consider = term => {
        const ratio = twice / term;
        const numerator = ratio + 2n * term - 4n;
        const denominator = term - 1n;

        if (numerator % denominator !== 0n) return;

        const sides = numerator / denominator;
        if (sides < 3n || found.has(sides)) return;

        found.set(sides, term);
    };

    for (let divisor = 2n; divisor * divisor <= twice; divisor++) {
        if (twice % divisor !== 0n) continue;

        consider(divisor);

        const pair = twice / divisor;
        if (pair !== divisor) consider(pair);
    }
    return [...found.entries()].sort((left, right) => (left[0] < right[0] ? -1 : 1));
}

function aliquotSum(number) {
    if (number < 1n) return 0n;
    if (number === 1n) return 0n;

    let sum = 1n;

    for (let divisor = 2n; divisor * divisor <= number; divisor++) {
        if (number % divisor === 0n) {
            sum += divisor;

            const pair = number / divisor;
            if (pair !== divisor) {
                sum += pair;
            }
        }
    }
    return sum;
}

function isPerfectNumber(number) {
    if (number < 2n) return false;
    return aliquotSum(number) === number;
}

function isAbundantNumber(number) {
    if (number < 2n) return false;
    return aliquotSum(number) > number;
}

function isDeficientNumber(number) {
    if (number < 1n) return false;
    return aliquotSum(number) < number;
}

function properDivisors(n) {
    const res = [];
    for (let d = 1n; d * d <= n; d++) {
        if (n % d === 0n) {
            if (d < n) res.push(d);
            const q = n / d;
            if (q !== d && q < n) res.push(q);
        }
    }
    return res;
}

function isSemiperfect(n) {
  if (n < 2n) return false;

  const divisors = properDivisors(n);
  let total = 0n;
  for (const d of divisors) total += d;

  if (total < n) return false;
  if (total === n) return true;

  const target = n <= total - n ? n : total - n;

  divisors.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));

  const suffixSum = new Array(divisors.length + 1).fill(0n);
  for (let i = divisors.length - 1; i >= 0; i--) {
    suffixSum[i] = suffixSum[i + 1] + divisors[i];
  }

  function canSum(index, current) {
    if (current === target) return true;
    if (current > target) return false;
    if (index >= divisors.length) return false;
    if (current + suffixSum[index] < target) return false;

    if (canSum(index + 1, current + divisors[index])) return true;
    return canSum(index + 1, current);
  }

  return canSum(0, 0n);
}

function isAutomorphic(number) {
    if (number < 1n) return false;

    const modulus = 10n ** BigInt(number.toString().length);
    return number * number % modulus === number;
}

/* 自守数位数逐位增长，用逐位提升生成，不用遍历整个区间。 */
function automorphicNumbersUpTo(limit) {
    const results = new Set();
    if (limit >= 1n) results.add(1n);

    for (const seed of [5n, 6n]) {
        let value = seed;
        let power = 10n;

        while (value <= limit) {
            results.add(value);

            // 提升一位：找出唯一的数字 d 使 (value + d·10ⁿ)² 与自身同余
            const nextPower = power * 10n;
            let lifted = 0n;

            for (let digit = 0n; digit <= 9n; digit++) {
                const candidate = value + digit * power;
                if (candidate * candidate % nextPower === candidate) {
                    lifted = candidate;
                    break;
                }
            }
            if (lifted === 0n) break;

            value = lifted;
            power = nextPower;
        }
    }
    return [...results].sort((left, right) => (left < right ? -1 : 1));
}

function isFibonacci(number) {
    return isPerfectPower(5n * number * number + 4n, 2) ||
        isPerfectPower(5n * number * number - 4n, 2);
}

/* number 是阶乘数时返回它是几的阶乘，否则返回 0。 */
function factorialIndexOf(number) {
    if (number < 1n) return 0n;

    let value = 1n;
    let index = 1n;

    while (value < number) {
        index++;
        value *= index;
    }
    return value === number ? index : 0n;
}
