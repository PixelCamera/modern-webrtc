import { logger } from './logger';

export class WebRTCError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'WebRTCError';
  }
}

export const ErrorHandler = {
  handle(error: unknown) {
    if (error instanceof Error) {
      logger.error('ErrorHandler', error.message, {
        name: error.name,
        stack: error.stack
      });
    } else {
      logger.error('ErrorHandler', String(error));
    }
    // 统一错误处理逻辑
  }
}; 