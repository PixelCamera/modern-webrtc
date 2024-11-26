import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 Tailwind CSS 类名
 * @param inputs - 类名数组
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 将错误对象格式化为标准格式
 * @param error - 任意错误对象
 * @returns 标准化的错误对象
 */
export function formatError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }
  return {
    message: String(error)
  };
}

/**
 * 检查值是否为空
 * @param value - 需要检查的值
 * @returns 如果值为空则返回 true，否则返回 false
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 安全地解析 JSON 字符串
 * @param json - 要解析的 JSON 字符串
 * @param fallback - 解析失败时的默认值
 * @returns 解析结果或默认值
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * 创建延迟执行的 Promise
 * @param ms - 延迟时间（毫秒）
 * @returns Promise，在指定时间后解决
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 创建防抖函数
 * @param fn - 需要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖处理后的函数
 */
export function debounce<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  wait: number
): (...args: Args) => void {
  let timeout: NodeJS.Timeout;
  return function (...args: Args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}
