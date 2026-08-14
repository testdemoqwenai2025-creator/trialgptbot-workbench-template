"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useWebSocket — a typed, auto-reconnecting WebSocket hook with
 * heartbeat support. Designed for the platform's `wss://api.trialgptbot.ai/v1/*`
 * streams.
 *
 * Features:
 *   • Auto-reconnect with exponential backoff (1s → 2s → 4s → 8s, capped at 30s)
 *   • Optional heartbeat ping (defaults to every 25s)
 *   • Typed incoming message stream
 *   • `send()` helper for outbound messages
 *   • `readyState` mirror for connection-status UIs
 *   • Auto-cleanup on unmount
 *
 * @example
 *   const { send, lastMessage, readyState } = useWebSocket({
 *     url: `wss://api.trialgptbot.ai/v1/review/stream?token=${JWT}`,
 *     onMessage: (msg) => console.log("event", msg),
 *   });
 */

export type WebSocketReadyState =
  | "connecting"
  | "open"
  | "closing"
  | "closed"
  | "backoff";

export interface UseWebSocketOptions<T = unknown> {
  /** Full WebSocket URL, including any ?token= query param. */
  url: string | null;
  /** Called for every incoming message. The hook does NOT parse JSON automatically. */
  onMessage?: (data: string) => void;
  /** Called when the socket transitions to OPEN. Useful for sending an auth handshake. */
  onOpen?: (ws: WebSocket) => void;
  /** Called when the socket transitions to CLOSED. */
  onClose?: (ev: CloseEvent) => void;
  /** Called when the socket errors. Browser doesn't expose much detail; treat as disconnect. */
  onError?: (ev: Event) => void;
  /** Heartbeat ping interval in ms. Set to 0 to disable. Default 25000. */
  heartbeatMs?: number;
  /** Heartbeat payload. Default "ping". */
  heartbeatPayload?: string;
  /** Sub-protocol(s) to negotiate. */
  protocols?: string | string[];
  /** Whether to attempt auto-reconnect. Default true. */
  autoReconnect?: boolean;
  /** Max backoff delay in ms. Default 30000. */
  maxBackoffMs?: number;
  /** Whether to (attempt to) parse incoming messages as JSON before calling onMessage. */
  parseJson?: boolean;
}

export interface UseWebSocketResult {
  readyState: WebSocketReadyState;
  /** The most recent message received (raw string). */
  lastMessage: string | null;
  /** The most recent message parsed as JSON (if parseJson is true). */
  lastJson: unknown | null;
  /** Send a string payload. No-op if socket is not OPEN. */
  send: (data: string) => void;
  /** Manually close the socket and stop reconnecting. */
  disconnect: () => void;
  /** Manually trigger a reconnect (cancels any backoff). */
  reconnect: () => void;
  /** Number of reconnect attempts since the last OPEN state. */
  reconnectAttempts: number;
}

export function useWebSocket<T = unknown>(
  options: UseWebSocketOptions<T>,
): UseWebSocketResult {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    heartbeatMs = 25000,
    heartbeatPayload = "ping",
    protocols,
    autoReconnect = true,
    maxBackoffMs = 30000,
    parseJson = false,
  } = options;

  const [readyState, setReadyState] = useState<WebSocketReadyState>("closed");
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [lastJson, setLastJson] = useState<unknown | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backoffRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualCloseRef = useRef(false);
  const attemptsRef = useRef(0);

  // Keep latest callbacks in refs so the socket doesn't need to be re-created
  // when the parent re-renders with new closures.
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onMessageRef.current = onMessage;
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
  });

  const clearHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!url) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    manualCloseRef.current = false;
    setReadyState("connecting");

    let ws: WebSocket;
    try {
      ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url);
    } catch (err) {
      console.error("[useWebSocket] failed to construct:", err);
      setReadyState("closed");
      return;
    }
    wsRef.current = ws;

    ws.onopen = (ev) => {
      attemptsRef.current = 0;
      setReconnectAttempts(0);
      setReadyState("open");
      if (heartbeatMs > 0) {
        clearHeartbeat();
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(heartbeatPayload);
            } catch {
              /* swallow — socket may have closed between checks */
            }
          }
        }, heartbeatMs);
      }
      onOpenRef.current?.(ws);
    };

    ws.onmessage = (ev) => {
      setLastMessage(ev.data);
      if (parseJson) {
        try {
          setLastJson(JSON.parse(ev.data));
        } catch {
          setLastJson(null);
        }
      }
      onMessageRef.current?.(ev.data);
    };

    ws.onerror = (ev) => {
      onErrorRef.current?.(ev);
    };

    ws.onclose = (ev) => {
      clearHeartbeat();
      onCloseRef.current?.(ev);
      wsRef.current = null;

      if (manualCloseRef.current || !autoReconnect) {
        setReadyState("closed");
        return;
      }

      // Exponential backoff with jitter
      attemptsRef.current += 1;
      setReconnectAttempts(attemptsRef.current);
      const base = Math.min(
        maxBackoffMs,
        1000 * Math.pow(2, attemptsRef.current - 1),
      );
      const delay = base + Math.floor(Math.random() * 500);
      setReadyState("backoff");
      backoffRef.current = setTimeout(() => connect(), delay);
    };
  }, [
    url,
    protocols,
    heartbeatMs,
    heartbeatPayload,
    autoReconnect,
    maxBackoffMs,
    parseJson,
    clearHeartbeat,
  ]);

  const send = useCallback((data: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  const disconnect = useCallback(() => {
    manualCloseRef.current = true;
    if (backoffRef.current) {
      clearTimeout(backoffRef.current);
      backoffRef.current = null;
    }
    clearHeartbeat();
    if (wsRef.current) {
      setReadyState("closing");
      try {
        wsRef.current.close(1000, "client disconnect");
      } catch {
        /* swallow */
      }
      wsRef.current = null;
    }
    setReadyState("closed");
  }, [clearHeartbeat]);

  const reconnect = useCallback(() => {
    if (backoffRef.current) {
      clearTimeout(backoffRef.current);
      backoffRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        /* swallow */
      }
      wsRef.current = null;
    }
    attemptsRef.current = 0;
    setReconnectAttempts(0);
    connect();
  }, [connect]);

  // (Re)connect when URL changes; disconnect on unmount.
  useEffect(() => {
    if (url) connect();
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return {
    readyState,
    lastMessage,
    lastJson,
    send,
    disconnect,
    reconnect,
    reconnectAttempts,
  };
}
