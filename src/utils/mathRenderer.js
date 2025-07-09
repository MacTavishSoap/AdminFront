/**
 * 数学公式渲染工具
 * 用于在Web端显示LaTeX格式的数学公式
 * 使用自定义渲染方案，与小程序保持一致
 */

// LaTeX 符号到 Unicode 的映射表
const latexToUnicode = {
  // 希腊字母
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
  '\\epsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ',
  '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\mu': 'μ',
  '\\nu': 'ν', '\\xi': 'ξ', '\\omicron': 'ο', '\\pi': 'π',
  '\\rho': 'ρ', '\\sigma': 'σ', '\\tau': 'τ', '\\upsilon': 'υ',
  '\\phi': 'φ', '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
  
  // 大写希腊字母
  '\\Alpha': 'Α', '\\Beta': 'Β', '\\Gamma': 'Γ', '\\Delta': 'Δ',
  '\\Epsilon': 'Ε', '\\Zeta': 'Ζ', '\\Eta': 'Η', '\\Theta': 'Θ',
  '\\Iota': 'Ι', '\\Kappa': 'Κ', '\\Lambda': 'Λ', '\\Mu': 'Μ',
  '\\Nu': 'Ν', '\\Xi': 'Ξ', '\\Omicron': 'Ο', '\\Pi': 'Π',
  '\\Rho': 'Ρ', '\\Sigma': 'Σ', '\\Tau': 'Τ', '\\Upsilon': 'Υ',
  '\\Phi': 'Φ', '\\Chi': 'Χ', '\\Psi': 'Ψ', '\\Omega': 'Ω',
  
  // 数学运算符
  '\\pm': '±', '\\mp': '∓', '\\times': '×', '\\div': '÷',
  '\\cdot': '·', '\\ast': '∗', '\\star': '⋆', '\\circ': '∘',
  '\\bullet': '•', '\\cap': '∩', '\\cup': '∪', '\\uplus': '⊎',
  '\\sqcap': '⊓', '\\sqcup': '⊔', '\\vee': '∨', '\\wedge': '∧',
  '\\setminus': '∖', '\\wr': '≀', '\\diamond': '⋄', '\\bigtriangleup': '△',
  '\\bigtriangledown': '▽', '\\triangleleft': '◁', '\\triangleright': '▷',
  '\\lhd': '⊲', '\\rhd': '⊳', '\\unlhd': '⊴', '\\unrhd': '⊵',
  '\\oplus': '⊕', '\\ominus': '⊖', '\\otimes': '⊗', '\\oslash': '⊘',
  '\\odot': '⊙', '\\bigcirc': '◯', '\\dagger': '†', '\\ddagger': '‡',
  '\\amalg': '⨿',
  
  // 关系符号
  '\\leq': '≤', '\\le': '≤', '\\prec': '≺', '\\preceq': '⪯',
  '\\ll': '≪', '\\subset': '⊂', '\\subseteq': '⊆', '\\sqsubset': '⊏',
  '\\sqsubseteq': '⊑', '\\in': '∈', '\\vdash': '⊢',
  '\\geq': '≥', '\\ge': '≥', '\\succ': '≻', '\\succeq': '⪰',
  '\\gg': '≫', '\\supset': '⊃', '\\supseteq': '⊇', '\\sqsupset': '⊐',
  '\\sqsupseteq': '⊒', '\\ni': '∋', '\\dashv': '⊣',
  '\\equiv': '≡', '\\sim': '∼', '\\simeq': '≃', '\\asymp': '≍',
  '\\approx': '≈', '\\cong': '≅', '\\neq': '≠', '\\ne': '≠',
  '\\doteq': '≐', '\\notin': '∉',
  
  // 箭头
  '\\leftarrow': '←', '\\gets': '←', '\\rightarrow': '→', '\\to': '→',
  '\\leftrightarrow': '↔', '\\uparrow': '↑', '\\downarrow': '↓',
  '\\updownarrow': '↕', '\\Leftarrow': '⇐', '\\Rightarrow': '⇒',
  '\\Leftrightarrow': '⇔', '\\Uparrow': '⇑', '\\Downarrow': '⇓',
  '\\Updownarrow': '⇕', '\\mapsto': '↦', '\\longmapsto': '⟼',
  '\\hookleftarrow': '↩', '\\hookrightarrow': '↪', '\\leftharpoonup': '↼',
  '\\leftharpoondown': '↽', '\\rightharpoonup': '⇀', '\\rightharpoondown': '⇁',
  '\\rightleftharpoons': '⇌', '\\iff': '⟺',
  
  // 其他符号
  '\\forall': '∀', '\\exists': '∃', '\\nexists': '∄',
  '\\emptyset': '∅', '\\varnothing': '∅', '\\infty': '∞',
  '\\aleph': 'ℵ', '\\beth': 'ℶ', '\\gimel': 'ℷ',
  '\\complement': '∁', '\\partial': '∂', '\\wp': '℘',
  '\\Re': 'ℜ', '\\Im': 'ℑ', '\\mho': '℧',
  '\\prime': '′', '\\backprime': '‵', '\\emptyset': '∅',
  '\\nabla': '∇', '\\surd': '√', '\\top': '⊤',
  '\\bot': '⊥', '\\angle': '∠', '\\triangle': '△',
  '\\backslash': '\\', '\\vert': '|', '\\Vert': '‖',
  '\\lceil': '⌈', '\\rceil': '⌉', '\\lfloor': '⌊', '\\rfloor': '⌋',
  '\\langle': '⟨', '\\rangle': '⟩',
  
  // 其他常用符号
  '\\sum': '∑', '\\prod': '∏', '\\int': '∫',
  '\\lim': 'lim', '\\max': 'max', '\\min': 'min',
  
  // 基础集合和括号符号
  '\\{': '{', '\\}': '}',
  '\\subset': '⊂', '\\supset': '⊃',
  '\\subseteq': '⊆', '\\supseteq': '⊇',
  '\\bigcup': '⋃', '\\bigcap': '⋂',
  
  // 常用数学函数
  '\\sin': 'sin', '\\cos': 'cos', '\\tan': 'tan',
  '\\log': 'log', '\\ln': 'ln', '\\exp': 'exp'
};

/**
 * 检测文本中是否包含LaTeX数学公式
 * @param {string} text - 要检测的文本
 * @returns {boolean} 是否包含数学公式
 */
export function hasMathFormula(text) {
  if (!text || typeof text !== 'string') return false;
  
  // 检测各种LaTeX标记格式
  const patterns = [
    /\$[^$]+\$/g,           // $...$
    /\$\$[^$]+\$\$/g,       // $$...$$
    /\\\([^)]+\\\)/g,      // \(...\)
    /\\\[[^\]]+\\\]/g,     // \[...\]
    /\\[a-zA-Z]+/g          // LaTeX命令如\alpha, \beta等
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

// 转换LaTeX符号
function convertLatexSymbols(text) {
  let result = text;
  for (const [latex, unicode] of Object.entries(latexToUnicode)) {
    const regex = new RegExp(latex.replace(/\\/g, '\\\\'), 'g');
    result = result.replace(regex, unicode);
  }
  return result;
}

// 简单LaTeX转换函数
export function convertSimpleLatex(text) {
  if (!text) return text;
  
  let result = text;
  
  // 处理上标 ^{...} 或 ^x
  result = result.replace(/\^\{([^}]+)\}/g, (match, content) => {
    const superscripts = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
      'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ'
    };
    return content.split('').map(char => superscripts[char] || char).join('');
  });
  
  result = result.replace(/\^([0-9a-zA-Z])/g, (match, char) => {
    const superscripts = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ'
    };
    return superscripts[char] || char;
  });
  
  // 处理下标 _{...} 或 _x
  result = result.replace(/_\{([^}]+)\}/g, (match, content) => {
    const subscripts = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
      '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
      '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
      'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
      'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
      'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
      'v': 'ᵥ', 'x': 'ₓ'
    };
    return content.split('').map(char => subscripts[char] || char).join('');
  });
  
  result = result.replace(/_([0-9a-zA-Z])/g, (match, char) => {
    const subscripts = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
      '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
      'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
      'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
      'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
      'v': 'ᵥ', 'x': 'ₓ'
    };
    return subscripts[char] || char;
  });
  
  // 处理分数 \frac{a}{b}
  result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (match, numerator, denominator) => {
    const num = convertLatexSymbols(numerator);
    const den = convertLatexSymbols(denominator);
    return `(${num})/(${den})`;
  });
  
  // 处理平方根 \sqrt{x}
  result = result.replace(/\\sqrt\{([^}]+)\}/g, (match, content) => {
    return `√(${convertLatexSymbols(content)})`;
  });
  
  // 处理简单的极限表达式 \lim
  result = result.replace(/\\lim\s+/g, 'lim ');
  
  // 处理简单的集合表示法 \{...\}
  result = result.replace(/\\\{([^}]*)\\\}/g, (match, content) => {
    return `{${convertLatexSymbols(content)}}`;
  });
    
    // 转换其他 LaTeX 符号
  result = convertLatexSymbols(result);
  
  return result;
}

/**
 * 格式化包含LaTeX数学公式的文本
 * @param {string} text - 原始文本
 * @returns {string} 格式化后的HTML文本
 */
export function formatMathText(text) {
  if (!text || typeof text !== 'string') return text;
  
  let result = text;
  
  // 处理块级数学公式 $$...$$
  result = result.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
    const converted = convertSimpleLatex(formula.trim());
    return `<div class="math-block">${converted}</div>`;
  });
  
  // 处理行内数学公式 $...$
  result = result.replace(/\$([^$]+)\$/g, (match, formula) => {
    const converted = convertSimpleLatex(formula.trim());
    return `<span class="math-inline">${converted}</span>`;
  });
  
  // 处理 \[...\] 格式（块级）
  result = result.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
    const converted = convertSimpleLatex(formula.trim());
    return `<div class="math-block">${converted}</div>`;
  });
  
  // 处理 \(...\) 格式（行内）
  result = result.replace(/\\\(([^)]+)\\\)/g, (match, formula) => {
    const converted = convertSimpleLatex(formula.trim());
    return `<span class="math-inline">${converted}</span>`;
  });
  
  return result;
}

/**
 * 获取数学公式相关的CSS样式
 * @returns {string} CSS样式字符串
 */
export function getMathStyles() {
  return `
    /* 数学公式样式 */
    .math-inline {
      font-family: 'Times New Roman', serif;
      font-style: italic;
      color: #2c3e50;
      padding: 0 2px;
    }
    
    .math-block {
      font-family: 'Times New Roman', serif;
      font-style: italic;
      color: #2c3e50;
      text-align: center;
      margin: 10px 0;
      padding: 8px;
      background-color: #f8f9fa;
      border-radius: 4px;
      border-left: 3px solid #007bff;
    }
    
    .math-fraction {
      display: inline-block;
      vertical-align: middle;
      text-align: center;
      margin: 0 2px;
    }
    
    .math-numerator {
      display: block;
      border-bottom: 1px solid #333;
      padding-bottom: 2px;
      font-size: 0.9em;
    }
    
    .math-denominator {
      display: block;
      padding-top: 2px;
      font-size: 0.9em;
    }
    
    .math-sqrt {
      position: relative;
      display: inline-block;
      margin: 0 2px;
    }
    
    .math-sqrt-content {
      border-top: 1px solid #333;
      padding-top: 2px;
      margin-left: 2px;
    }
    
    sup {
      font-size: 0.75em;
      vertical-align: super;
    }
    
    sub {
      font-size: 0.75em;
      vertical-align: sub;
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
      .math-inline {
        font-size: 0.9em;
      }
      
      .math-block {
        margin: 8px 0;
        padding: 6px;
      }
    }
    
    /* 确保数学公式在表格中正确显示 */
    .el-table .math-inline {
      white-space: nowrap;
    }
    
    .el-table .math-block {
      margin: 5px 0;
    }
  `;
}

export default {
  formatMathText,
  getMathStyles,
  hasMathFormula,
  convertSimpleLatex
};

// 兼容性导出
export { hasMathFormula as hasLatexFormula };