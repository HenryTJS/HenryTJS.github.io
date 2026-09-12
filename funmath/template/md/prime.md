## 一、素数是什么

对于一个正整数, 如果它的因数只有$1$和本身, 那这个数就是素数. 如果这个正整数的因数不只有这两个数, 那这个数就是合数. 合数的因数至少有$1$个是素数, 这种因数我们叫它素因数.

如果是$1$呢? 乍一看, 它的因数只有本身, 也只有$1$, 好像符合素数的定义. 但这里, 我们认为$1$不是素数, 那显然更不是合数. 为什么这么说? 后面的性质会给出答案.

或许你并不记得什么是因数了, 因数就是能被这个数整除的数. 比如$21$能被$3$整除, 那$3$就是$21$的因数. 一般我们认为的因数都是正数.

## 二、素数有什么性质

### 2.1 素数的无穷性

这里我们提到素数有无穷多个, 可是正整数本身就有无穷多个, 就算素数有有限个我们也数不完. 所以, 为了证明这个性质, 我们采用反证法.

假如素数有有限多个, 暂且认为是$n$个吧, 把这些数分别命名为$a_1, a_2, a_3, \cdots, a_n$. 如果把它们乘到一起再加$1$, 会得到一个数$a_1\cdot a_2\cdot a_3\cdots a_n$, 这个数是什么数呢? 是素数吗? 可是这个数比我们这有限个素数都大, 肯定不是. 那是合数吗? 合数至少有一个素因数, 那这个素因数就一定是在$a_1, a_2, a_3, \cdots, a_n$中, 可是根据定义这个数应该不会被其中任何一个数整除. 

于是我们推出了矛盾, 所以素数有无穷多个.

### 2.2 算术基本定理

每个大于 $1$ 的整数都能写成素数的乘积，且在不计顺序的意义下**写法唯一**：

$$
n = p_1^{e_1} p_2^{e_2} \cdots p_k^{e_k}, \quad p_1 < p_2 < \cdots < p_k
$$

这条定理是「数论是整数的语言」的根本原因，也是后面所有约数类概念（完全数、亲和数、欧拉函数）的基础。

### 3.3 素数定理

记 $\pi(x)$ 为不超过 $x$ 的素数个数，则

$$
\lim_{x \to \infty} \frac{\pi(x)}{x / \ln x} = 1
$$

也就是说，$x$ 附近的素数密度大约是 $1 / \ln x$。这正是第二节表格中「间隔越来越稀疏」的定量版本。

## 四、代码实现

### 4.1 朴素解法：试除判定

```python
def is_prime(n: int) -> bool:
    """试除法判定素数，O(sqrt(n))。"""
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    d = 3
    while d * d <= n:          # 循环到 floor(sqrt(n)) 即可
        if n % d == 0:
            return False
        d += 2                 # 跳过偶数，步长取 2
    return True


if __name__ == "__main__":
    print([i for i in range(2, 50) if is_prime(i)])
    # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
```

注意 `while d * d <= n` 这种写法避免了浮点开方带来的精度问题，是实践中推荐的形式。

### 4.2 批量筛选：埃拉托色尼筛法

如果要求出 $10^7$ 以内**所有**素数，逐个试除就太慢了。筛法的思路反过来：**不是去判定每个数，而是用每个素数去划掉它的倍数**。

```python
def sieve(n: int) -> list[int]:
    """返回 [0, n) 内所有素数，O(n log log n)。"""
    is_comp = bytearray(n)          # 0 表示「暂定为素数」
    primes = []
    for i in range(2, n):
        if not is_comp[i]:
            primes.append(i)
            for j in range(i * i, n, i):   # 从 i*i 开始划，之前的一定已被更小的素数划掉
                is_comp[j] = 1
    return primes


if __name__ == "__main__":
    ps = sieve(10_000_000)
    print(len(ps), ps[-1])          # 664579 9999991
```

两个关键优化：

- **内层从 `i * i` 开始**，因为 $i \times k\ (k < i)$ 一定含有比 $i$ 更小的素因数，早就被划掉了。
- **用 `bytearray` 而不是 `list[bool]`**，内存占用降到 1/28 左右，10⁸ 规模也能塞进内存。

### 4.3 线性筛（欧拉筛）

埃氏筛会有重复标记：比如 $6 = 2 \times 3$ 会被 2 和 3 各划一次。线性筛保证**每个合数只被它的最小素因数划掉一次**，复杂度严格 $O(n)$。

```python
def linear_sieve(n: int) -> list[int]:
    """线性筛，O(n)。"""
    primes = []
    is_comp = bytearray(n)
    for i in range(2, n):
        if not is_comp[i]:
            primes.append(i)
        for p in primes:
            v = i * p
            if v >= n:
                break
            is_comp[v] = 1
            if i % p == 0:      # p 是 i 的最小素因数，此时必须 break
                break
    return primes
```

那个 `if i % p == 0: break` 是整段代码的灵魂：它保证了每个合数只被"最小素因数"访问一次。线性筛更重要的价值在于，它可以顺便递推出各种**积性函数**（欧拉 $\varphi$、约数个数 $d(n)$、约数和 $\sigma(n)$ 等）。

### 4.4 大数判定：Miller–Rabin

对 $10^{18}$ 级别的数，筛法存不下、试除太慢，此时用概率性的 Miller–Rabin：

```python
import random


def is_prime_mr(n: int, rounds: int = 12) -> bool:
    """Miller-Rabin 概率素性判定，错误概率 < 4^-rounds。"""
    if n < 2:
        return False
    for p in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        if n % p == 0:
            return n == p

    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1

    def witness(a: int) -> bool:        # 返回 True 表示 a 证明 n 是合数
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            return False
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                return False
        return True

    # 前 12 个素数为底时，64 位范围内无假阳性
    return not any(witness(a) for a in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37))
```
