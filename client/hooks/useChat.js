"use client";

import { useEffect, useRef, useState } from "react";

function upsertMessage(messages, nextMessage) {
  const index = messages.findIndex((message) => message.id === nextMessage.id);
  if (index === -1) {
    return [...messages, nextMessage];
  }

  const copy = [...messages];
  copy[index] = { ...copy[index], ...nextMessage };
  return copy;
}

function findMentionedUsers(users, content) {
  return users
    .map((user) => user.username)
    .filter((name) => new RegExp(`(^|\\s)@${name}(?=\\b)`, "i").test(content || ""));
}

export function useChat({
  socket,
  roomId,
  username,
  color,
  initialModel = "gpt-4o",
  initialPersona = "Default",
}) {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [currentModel, setCurrentModel] = useState(initialModel);
  const [currentPersona, setCurrentPersona] = useState(initialPersona);
  const [summaryState, setSummaryState] = useState({ isOpen: false, isStreaming: false, content: "" });
  const [connectionError, setConnectionError] = useState("");
  const [isRoomLoading, setIsRoomLoading] = useState(true);
  const [mentionPulseUsers, setMentionPulseUsers] = useState([]);
  const [aiAvailability, setAiAvailability] = useState({
    mode: "ready",
    message: "Aura AI is available when someone uses Ask AI.",
  });
  const streamingMessageRef = useRef(null);
  const usersRef = useRef(users);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    if (!socket || !roomId || !username) {
      return undefined;
    }

    const onConnectError = () => {
      setConnectionError("Unable to connect to AuraChat. Check the server and try again.");
      setIsRoomLoading(false);
    };

    const onRoomJoined = ({ users: nextUsers, history, currentPersona: persona, currentModel: model }) => {
      setUsers(nextUsers || []);
      setMessages(history || []);
      setCurrentPersona(persona || "Default");
      setCurrentModel(model || "gpt-4o");
      setConnectionError("");
      setIsRoomLoading(false);
    };

    const onUserJoined = ({ username: joinedUsername, color: joinedColor }) => {
      setUsers((prev) => {
        if (prev.some((user) => user.username === joinedUsername)) {
          return prev;
        }
        return [...prev, { username: joinedUsername, color: joinedColor }];
      });
    };

    const onUserLeft = ({ username: departedUsername }) => {
      setUsers((prev) => prev.filter((user) => user.username !== departedUsername));
      setTypingUsers((prev) => prev.filter((name) => name !== departedUsername));
    };

    const onNewMessage = (message) => {
      setMessages((prev) => upsertMessage(prev, message));
      const mentionedUsers = findMentionedUsers(usersRef.current, message.content);
      if (mentionedUsers.length > 0) {
        setMentionPulseUsers((prev) => Array.from(new Set([...prev, ...mentionedUsers])));
        window.setTimeout(() => {
          setMentionPulseUsers((prev) => prev.filter((name) => !mentionedUsers.includes(name)));
        }, 1500);
      }
    };

    const onAiStart = () => {
      setIsAiStreaming(true);
      setAiAvailability({
        mode: "ready",
        message: "Aura AI is preparing a reply for everyone in the room.",
      });
      const tempId = `ai-streaming-${Date.now()}`;
      streamingMessageRef.current = tempId;
      setMessages((prev) =>
        upsertMessage(prev, {
          id: tempId,
          username: "Aura AI",
          color: "#6ee7b7",
          content: "",
          timestamp: new Date().toISOString(),
          role: "assistant",
          reactions: {},
          isAiGenerated: true,
        }),
      );
    };

    const onAiToken = ({ token }) => {
      const tempId = streamingMessageRef.current;
      if (!tempId) {
        return;
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.id === tempId ? { ...message, content: `${message.content || ""}${token}` } : message,
        ),
      );
    };

    const onAiEnd = ({ fullContent, messageId }) => {
      setIsAiStreaming(false);
      const tempId = streamingMessageRef.current;
      streamingMessageRef.current = null;
      setMessages((prev) =>
        prev.map((message) =>
          message.id === tempId
            ? {
                ...message,
                id: messageId,
                content: fullContent,
                role: "assistant",
                reactions: {},
                isAiGenerated: true,
              }
            : message,
        ),
      );

      if (!/fallback response/i.test(fullContent || "")) {
        setAiAvailability({
          mode: "ready",
          message: "Aura AI is available when someone uses Ask AI.",
        });
      }
    };

    const onAiFallback = ({ reason }) => {
      setAiAvailability({
        mode: "fallback",
        message: `AI unavailable -> using fallback. ${reason || "OpenAI is temporarily unavailable."}`,
      });
    };

    const onReactionUpdated = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((message) => (message.id === messageId ? { ...message, reactions: reactions || {} } : message)),
      );
    };

    const onUserTyping = ({ username: typingUsername }) => {
      setTypingUsers((prev) => (prev.includes(typingUsername) ? prev : [...prev, typingUsername]));
    };

    const onUserStopTyping = ({ username: typingUsername }) => {
      setTypingUsers((prev) => prev.filter((name) => name !== typingUsername));
    };

    const onPersonaChanged = ({ persona }) => {
      setCurrentPersona(persona);
    };

    const onModelChanged = ({ model }) => {
      setCurrentModel(model);
    };

    const onSummaryStart = () => {
      setSummaryState({ isOpen: true, isStreaming: true, content: "" });
    };

    const onSummaryToken = ({ token }) => {
      setSummaryState((prev) => ({ ...prev, content: `${prev.content}${token}` }));
    };

    const onSummaryEnd = ({ content }) => {
      setSummaryState({ isOpen: true, isStreaming: false, content });
    };

    const onSummaryError = ({ error }) => {
      setSummaryState({ isOpen: true, isStreaming: false, content: error || "Unable to summarize this room." });
    };

    const onServerError = ({ message }) => {
      setConnectionError(message || "Something went wrong.");
      setIsAiStreaming(false);
      setIsRoomLoading(false);
      setSummaryState((prev) => ({ ...prev, isStreaming: false }));
    };

    socket.on("connect_error", onConnectError);
    socket.on("room-joined", onRoomJoined);
    socket.on("user-joined", onUserJoined);
    socket.on("user-left", onUserLeft);
    socket.on("new-message", onNewMessage);
    socket.on("ai-stream-start", onAiStart);
    socket.on("ai-stream-token", onAiToken);
    socket.on("ai-stream-end", onAiEnd);
    socket.on("ai-fallback", onAiFallback);
    socket.on("reaction-updated", onReactionUpdated);
    socket.on("user-typing", onUserTyping);
    socket.on("user-stop-typing", onUserStopTyping);
    socket.on("persona-changed", onPersonaChanged);
    socket.on("model-changed", onModelChanged);
    socket.on("summary-stream-start", onSummaryStart);
    socket.on("summary-stream-token", onSummaryToken);
    socket.on("summary-stream-end", onSummaryEnd);
    socket.on("summary-error", onSummaryError);
    socket.on("server-error", onServerError);

    socket.emit("join-room", { roomId, username, color });

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("connect_error", onConnectError);
      socket.off("room-joined", onRoomJoined);
      socket.off("user-joined", onUserJoined);
      socket.off("user-left", onUserLeft);
      socket.off("new-message", onNewMessage);
      socket.off("ai-stream-start", onAiStart);
      socket.off("ai-stream-token", onAiToken);
      socket.off("ai-stream-end", onAiEnd);
      socket.off("ai-fallback", onAiFallback);
      socket.off("reaction-updated", onReactionUpdated);
      socket.off("user-typing", onUserTyping);
      socket.off("user-stop-typing", onUserStopTyping);
      socket.off("persona-changed", onPersonaChanged);
      socket.off("model-changed", onModelChanged);
      socket.off("summary-stream-start", onSummaryStart);
      socket.off("summary-stream-token", onSummaryToken);
      socket.off("summary-stream-end", onSummaryEnd);
      socket.off("summary-error", onSummaryError);
      socket.off("server-error", onServerError);
    };
  }, [color, roomId, socket, username]);

  const sendMessage = (message, options = {}) => {
    socket.emit("send-message", {
      roomId,
      message,
      model: currentModel,
      persona: currentPersona,
      username,
      isAskingAI: options.isAskingAI || false,
    });
  };

  const startTyping = () => {
    socket.emit("typing-start", { roomId, username });
  };

  const stopTyping = () => {
    socket.emit("typing-stop", { roomId, username });
  };

  const toggleReaction = ({ messageId, emoji, hasReacted }) => {
    socket.emit(hasReacted ? "remove-reaction" : "add-reaction", {
      roomId,
      messageId,
      emoji,
      username,
    });
  };

  const changePersona = (persona) => {
    setCurrentPersona(persona);
    socket.emit("change-persona", { roomId, persona });
  };

  const changeModel = (model) => {
    setCurrentModel(model);
    socket.emit("change-model", { roomId, model });
  };

  const summarizeRoom = () => {
    setSummaryState({ isOpen: true, isStreaming: true, content: "" });
    socket.emit("summarize-room", {
      roomId,
      model: currentModel,
      persona: currentPersona,
    });
  };

  const leaveRoom = () => {
    socket.emit("leave-room", { roomId });
  };

  return {
    users,
    messages,
    typingUsers,
    isAiStreaming,
    currentModel,
    currentPersona,
    summaryState,
    connectionError,
    isRoomLoading,
    mentionPulseUsers,
    aiAvailability,
    sendMessage,
    startTyping,
    stopTyping,
    toggleReaction,
    changePersona,
    changeModel,
    summarizeRoom,
    setSummaryState,
    leaveRoom,
  };
}
