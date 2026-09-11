import type { VariableValue } from '../types/story';

type Vars = Record<string, VariableValue>;

type Token =
  | { type: 'num'; value: number }
  | { type: 'str'; value: string }
  | { type: 'ident'; value: string }
  | { type: 'op'; value: '&&' | '||' | '==' | '!=' | '>=' | '<=' | '>' | '<' | '(' | ')' };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ' || ch === '\t') {
      i++;
      continue;
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      let value = '';
      while (j < expr.length && expr[j] !== quote) {
        value += expr[j];
        j++;
      }
      tokens.push({ type: 'str', value });
      i = j + 1;
      continue;
    }
    const two = expr.slice(i, i + 2);
    if (two === '&&' || two === '||' || two === '==' || two === '!=' || two === '>=' || two === '<=') {
      tokens.push({ type: 'op', value: two });
      i += 2;
      continue;
    }
    if (ch === '>' || ch === '<') {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }
    if (/[0-9-]/.test(ch) && /[0-9]/.test(expr[i + 1] ?? '')) {
      let j = i + 1;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      tokens.push({ type: 'num', value: Number(expr.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      tokens.push({ type: 'num', value: Number(expr.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < expr.length && /[A-Za-z0-9_]/.test(expr[j])) j++;
      tokens.push({ type: 'ident', value: expr.slice(i, j) });
      i = j;
      continue;
    }
    throw new Error(`Carácter inesperado en condición "${expr}": "${ch}"`);
  }
  return tokens;
}

class Parser {
  private pos = 0;
  constructor(private tokens: Token[], private vars: Vars) {}

  private peek() {
    return this.tokens[this.pos];
  }

  private next() {
    return this.tokens[this.pos++];
  }

  parseOr(): boolean {
    let left = this.parseAnd();
    while (this.peek()?.type === 'op' && this.peek()?.value === '||') {
      this.next();
      const right = this.parseAnd();
      left = left || right;
    }
    return left;
  }

  private parseAnd(): boolean {
    let left = this.parseComparison();
    while (this.peek()?.type === 'op' && this.peek()?.value === '&&') {
      this.next();
      const right = this.parseComparison();
      left = left && right;
    }
    return left;
  }

  private parseComparison(): boolean {
    const left = this.parsePrimaryValue();
    const opToken = this.peek();
    if (opToken?.type === 'op' && ['==', '!=', '>=', '<=', '>', '<'].includes(opToken.value)) {
      this.next();
      const right = this.parsePrimaryValue();
      switch (opToken.value) {
        case '==':
          return left === right;
        case '!=':
          return left !== right;
        case '>=':
          return Number(left) >= Number(right);
        case '<=':
          return Number(left) <= Number(right);
        case '>':
          return Number(left) > Number(right);
        case '<':
          return Number(left) < Number(right);
      }
    }
    return Boolean(left);
  }

  private parsePrimaryValue(): VariableValue {
    const token = this.peek();
    if (token?.type === 'op' && token.value === '(') {
      this.next();
      const value = this.parseOr();
      const close = this.next();
      if (close?.value !== ')') throw new Error('Falta paréntesis de cierre en condición');
      return value;
    }
    if (token?.type === 'num') {
      this.next();
      return token.value;
    }
    if (token?.type === 'str') {
      this.next();
      return token.value;
    }
    if (token?.type === 'ident') {
      this.next();
      if (token.value === 'true') return true;
      if (token.value === 'false') return false;
      return this.vars[token.value] ?? false;
    }
    throw new Error('Expresión de condición mal formada');
  }
}

export function evaluateCondition(expr: string, vars: Vars): boolean {
  const trimmed = expr.trim();
  if (trimmed === 'default') return true;
  const tokens = tokenize(trimmed);
  const parser = new Parser(tokens, vars);
  return parser.parseOr();
}
