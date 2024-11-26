import { logger } from './logger';

/**
 * WebRTC错误类
 * 用于封装和处理WebRTC相关的错误情况
 * 
 * @class WebRTCError
 * @extends Error
 */
export class WebRTCError extends Error {
  /**
   * 创建WebRTC错误实例
   * @param {string} message - 错误的详细描述信息
   * @param {string} code - 错误的唯一标识代码
   */
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'WebRTCError';
  }
}

/**
 * 错误处理工具对象
 * 提供统一的错误处理和日志记录方法
 */
export const ErrorHandler = {
  /**
   * 统一处理各类错误
   * 将错误信息规范化并记录到日志系统
   * 
   * @param {unknown} error - 需要处理的错误对象，支持任意类型
   */
  handle(error: unknown) {
    if (error instanceof Error) {
      // 对标准Error对象进行结构化日志记录
      logger.error('ErrorHandler', error.message, {
        name: error.name,
        stack: error.stack
      });
    } else {
      // 对非标准错误对象进行字符串转换后记录
      logger.error('ErrorHandler', String(error));
    }
  }
}; 