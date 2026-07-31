import React from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathRoundedSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export type NotificationType = "success" | "error" | "info" | "update" | "primary";

export interface NotificationCardProps {
  title?: string;
  message: string;
  type?: NotificationType;
  onClose?: () => void;
}

const typeStyles: Record<NotificationType, { bg: string; border: string; text: string; icon: React.ReactNode }>
  = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: <XCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />,
  },
  update: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-900",
    icon: <ArrowPathRoundedSquareIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />,
  },
  primary: {
    bg: "bg-blue-900",
    border: "border-blue-800",
    text: "text-blue-100",
    icon: <InformationCircleIcon className="h-5 w-5 text-blue-200" aria-hidden="true" />,
  },
};

export default function NotificationCard({ title, message, type = "info", onClose }: NotificationCardProps) {
  const styles = typeStyles[type];
  // Render URLs inside the message as clickable links
  const Autolink: React.FC<{ text: string }> = ({ text }) => {
    const tokens = text.split(/(https?:\/\/[^\s]+)/g);
    return (
      <>
        {tokens.map((tok, i) =>
          /^https?:\/\//.test(tok) ? (
            <a
              key={i}
              href={tok}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 font-medium hover:opacity-80"
            >
              {tok}
            </a>
          ) : (
            <React.Fragment key={i}>{tok}</React.Fragment>
          )
        )}
      </>
    );
  };
  return (
    <div
      className={`relative w-full max-w-sm rounded-lg border ${styles.border} ${styles.bg} px-4 py-3 shadow-lg`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{styles.icon}</div>
        <div className="flex-1 min-w-0">
          {title && <div className={`text-sm font-semibold ${styles.text}`}>{title}</div>}
          <div className={`text-sm ${styles.text}`}>
            <Autolink text={message} />
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-gray-500 hover:text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Close notification"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
