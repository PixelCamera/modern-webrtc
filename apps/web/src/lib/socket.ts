/**
 * Socket.io 客户端配置和事件处理模块
 * 负责建立和维护与WebSocket服务器的连接，处理各类连接事件
 * @module socket
 */

import { io } from 'socket.io-client';
import { logger } from './logger';

/**
 * WebSocket服务器地址
 * 优先使用环境变量中的配置，默认连接本地开发服务器
 */
const SOCKET_URL = import.meta.env.VITE_WS_URL || 'https://192.168.2.36:3000';

/**
 * Socket.io客户端实例
 * 配置了自动重连、安全连接等关键参数
 */
export const socket = io(SOCKET_URL, {
  autoConnect: true,           // 自动建立连接
  reconnection: true,         // 启用自动重连机制
  reconnectionAttempts: 5,    // 最大重连尝试次数
  reconnectionDelay: 1000,    // 重连间隔时间(毫秒)
  timeout: 10000,             // 连接超时阈值
  transports: ['websocket', 'polling'],  // 支持的传输协议
  secure: true,               // 启用SSL/TLS安全连接
  rejectUnauthorized: false,  // 开发环境下允许自签名证书
});

// 事件监听器配置
socket.on('connect', () => {
  logger.info('Socket', '已连接到服务器');
});

socket.on('connect_error', (error) => {
  logger.error('Socket', '连接错误:', {
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : String(error)
  });
});

socket.on('disconnect', (reason) => {
  logger.warn('Socket', '连接已断开', { reason });
  // 如果是服务器主动断开连接，尝试重新连接
  if (reason === 'io server disconnect') {
    socket.connect();
  }
});

socket.on('reconnect', (attemptNumber) => {
  logger.info('Socket', '重连成功', { attemptNumber });
});

socket.on('reconnect_error', (error) => {
  logger.error('Socket', '重连失败:', {
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : String(error)
  });
});

socket.on('reconnect_failed', () => {
  logger.error('Socket', '重连失败，已达到最大重试次数');
});