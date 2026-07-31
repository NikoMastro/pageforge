import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import NotificationCard, { type NotificationType } from "../ui/cards/notificationCard";

export type AppNotification = {
  id: string;
  message: string;
  title?: string;
  type: NotificationType;
  timeoutMs?: number;
};

export interface NotificationsContextValue {
  notify: (n: Omit<AppNotification, "id">) => void;
  success: (message: string, opts?: Partial<Omit<AppNotification, "id" | "message" | "type">>) => void;
  error: (message: string, opts?: Partial<Omit<AppNotification, "id" | "message" | "type">>) => void;
  info: (message: string, opts?: Partial<Omit<AppNotification, "id" | "message" | "type">>) => void;
  update: (message: string, opts?: Partial<Omit<AppNotification, "id" | "message" | "type">>) => void;
  backendFail: (message: string) => void;
  userCreatedLp: (lpName: string, user: string) => void;
  deploymentSuccess: (lpName: string, url: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within <NotificationsProvider>");
  return ctx;
}

function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface NotificationsProviderProps {
  children: React.ReactNode;
  defaultTimeoutMs?: number;
  maxVisible?: number;
}

export default function NotificationsProvider({ children, defaultTimeoutMs = 5000, maxVisible = 4 }: NotificationsProviderProps) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const timers = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    const t = timers.current[id];
    if (t) {
      clearTimeout(t);
      delete timers.current[id];
    }
  }, []);

  const notify = useCallback<NotificationsContextValue["notify"]>((n) => {
    const id = newId();
    const timeoutMs = n.timeoutMs ?? defaultTimeoutMs;

    setItems((prev) => {
      const next = [{ id, ...n }, ...prev];
      return next.slice(0, maxVisible);
    });

    if (timeoutMs && timeoutMs > 0) {
      timers.current[id] = window.setTimeout(() => remove(id), timeoutMs);
    }
  }, [defaultTimeoutMs, maxVisible, remove]);

  const api = useMemo<NotificationsContextValue>(() => ({
    notify,
    success: (message, opts) => notify({ message, type: "success", ...opts }),
    error: (message, opts) => notify({ message, type: "error", ...opts }),
    info: (message, opts) => notify({ message, type: "info", ...opts }),
    update: (message, opts) => notify({ message, type: "update", ...opts }),
    backendFail: (message) => notify({ message, type: "error" }),
    userCreatedLp: (lpName, user) => notify({
      title: `${lpName} created`,
      message: `${lpName} created by ${user}`,
      type: "primary",
    }),
    deploymentSuccess: (lpName, url) => notify({
      title: `${lpName} deployed`,
      message: `${lpName} deployed at: ${url}`,
      type: "success",
    }),
  }), [notify]);

  return (
    <NotificationsContext.Provider value={api}>
      {children}
      {/* Container positioned to the right and above the sidebar bell */}
      <div className="pointer-events-none fixed left-72 bottom-10 z-[100] flex w-full max-w-sm flex-col gap-2">
        {items.map((n) => (
          <div
            key={n.id}
            className="pointer-events-auto animate-in slide-in-from-left-4 fade-in duration-200"
          >
            <NotificationCard
              title={n.title}
              message={n.message}
              type={n.type}
              onClose={() => remove(n.id)}
            />
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}

// Convenience hooks for common app events
export function useNotificationBindings() {
  const { success, error, update, info } = useNotifications();
  return {
    onLpCreated: (lpName?: string) => success(lpName ? `Landing page "${lpName}" created` : "New landing page created"),
    onLpModified: (lpName?: string) => update(lpName ? `Landing page "${lpName}" updated` : "Landing page changed"),
    onBackendFail: (msg?: string) => error(msg ?? "A server error occurred"),
    onBackendSuccess: (msg?: string) => success(msg ?? "Operation completed successfully"),
    info,
  };
}
