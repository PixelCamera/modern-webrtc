/**
 * 日志级别的类型定义
 * 支持debug、info、warn、error四个级别
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 日志参数的类型定义
 * 支持基础类型、Error对象和普通对象
 */
type LogArg = string | number | boolean | null | undefined | Error | Record<string, unknown>;

/**
 * 日志样式配置接口
 * 为每个日志级别定义对应的CSS样式
 */
interface LogStyles {
  readonly debug: string;
  readonly info: string;
  readonly warn: string;
  readonly error: string;
}

/**
 * 日志管理器类
 * 采用单例模式实现的日志系统
 */
class Logger {
  /** 单例实例 */
  private static instance: Logger | null = null;

  /** 日志输出的颜色样式配置 */
  private readonly styles: Readonly<LogStyles> = Object.freeze({
    debug: 'color: #808080', // 灰色
    info: 'color: #0066cc',  // 蓝色
    warn: 'color: #ff9900',  // 橙色
    error: 'color: #cc0000'  // 红色
  });

  /** 私有构造函数，防止外部直接实例化 */
  private constructor() {}

  /**
   * 获取Logger单例实例
   * @returns {Logger} Logger实例
   */
  public static getInstance(): Logger {
    if (Logger.instance === null) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 格式化日志消息
   * @param {LogLevel} level - 日志级别
   * @param {string} context - 日志上下文
   * @param {string} message - 日志消息
   * @returns {string} 格式化后的日志字符串
   * @throws {Error} 当context或message为空时抛出错误
   */
  private formatMessage(level: LogLevel, context: string, message: string): string {
    if (!context || !message) {
      throw new Error('Context and message must not be empty');
    }
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
  }

  /**
   * 输出调试级别日志
   * @param {string} context - 日志上下文
   * @param {string} message - 日志消息
   * @param {...LogArg} args - 额外参数
   * @throws {Error} 当context或message为空时抛出错误
   */
  public debug(context: string, message: string, ...args: LogArg[]): void {
    console.log(
      `%c${this.formatMessage('debug', context, message)}`,
      this.styles.debug,
      ...args
    );
  }

  /**
   * 输出信息级别日志
   * @param {string} context - 日志上下文
   * @param {string} message - 日志消息
   * @param {...LogArg} args - 额外参数
   * @throws {Error} 当context或message为空时抛出错误
   */
  public info(context: string, message: string, ...args: LogArg[]): void {
    console.log(
      `%c${this.formatMessage('info', context, message)}`,
      this.styles.info,
      ...args
    );
  }

  /**
   * 输出警告级别日志
   * @param {string} context - 日志上下文
   * @param {string} message - 日志消息
   * @param {...LogArg} args - 额外参数
   * @throws {Error} 当context或message为空时抛出错误
   */
  public warn(context: string, message: string, ...args: LogArg[]): void {
    console.warn(
      `%c${this.formatMessage('warn', context, message)}`,
      this.styles.warn,
      ...args
    );
  }

  /**
   * 输出错误级别日志
   * @param {string} context - 日志上下文
   * @param {string} message - 日志消息
   * @param {...LogArg} args - 额外参数
   * @throws {Error} 当context或message为空时抛出错误
   */
  public error(context: string, message: string, ...args: LogArg[]): void {
    console.error(
      `%c${this.formatMessage('error', context, message)}`,
      this.styles.error,
      ...args
    );
  }
}

/** 导出Logger单例实例 */
export const logger = Logger.getInstance();

// 防止导出的实例被修改
Object.freeze(logger);