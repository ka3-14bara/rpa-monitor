import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

type WebSocketErrorEvent = {
  projectNumber: string;
  source: string;
  message: string;
  createdAt: string;
};

export function useWebSocket(onMessage?: (event: WebSocketErrorEvent) => void) {
  const stompClientRef = useRef<Client | null>(null);
  const { addNotification } = useNotifications();
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    const token = getAccessToken();
    if (!token) return;

    // STOMP клиент поверх SockJS (совместимо с вашим WebSocketConfig)
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`, // Spring пока игнорирует, но пригодится при усилении безопасности
      },
      debug: (str) => console.debug('[STOMP]', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    stompClient.onConnect = () => {
      setConnected(true);
      addNotification('Real-time подключен', 'success');

      // Подписка на топик, куда бэкенд шлёт ошибки
      stompClient.subscribe('/topic/errors', (message: IMessage) => {
        try {
          const data: WebSocketErrorEvent = JSON.parse(message.body);
          addNotification(`Новая ошибка: ${data.message}`, 'error');
          onMessage?.(data);
        } catch (e) {
          console.error('WebSocket parse error', e);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message']);
      addNotification('Ошибка STOMP', 'error');
    };

    stompClient.onWebSocketClose = () => {
      setConnected(false);
      addNotification('Соединение потеряно, переподключение...', 'warning');
    };

    stompClientRef.current = stompClient;
    stompClient.activate();
  }, [onMessage, addNotification]);

  useEffect(() => {
    connect();
    return () => {
      stompClientRef.current?.deactivate();
    };
  }, [connect]);

  return connected;
}