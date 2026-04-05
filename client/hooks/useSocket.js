"use client";

import { useEffect, useMemo, useState } from "react";
import { getSocket } from "../lib/socket";

export function useSocket() {
  const socket = useMemo(() => getSocket(), []);
  const [status, setStatus] = useState(socket.connected ? "connected" : "connecting");

  useEffect(() => {
    function handleConnect() {
      setStatus("connected");
    }

    function handleDisconnect() {
      setStatus("disconnected");
    }

    function handleReconnectAttempt() {
      setStatus("connecting");
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
    };
  }, [socket]);

  return { socket, status };
}

