import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ConsoleLog {
  id: number;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
  args: unknown[];
}

interface ConsoleViewProps {
  maxLogs?: number;
  className?: string;
  cardName: string; // Made required since it changes based on selected card
}

const ConsoleView: React.FC<ConsoleViewProps> = ({ maxLogs = 100, className = '', cardName }) => {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const logIdRef = useRef(0);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Function to add log entry (wrapped in useCallback to avoid dependency issues)
  const addLog = useCallback((type: ConsoleLog['type'], args: unknown[]) => {
    const message = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');

    const newLog: ConsoleLog = {
      id: logIdRef.current++,
      type,
      message,
      timestamp: new Date(),
      args,
    };

    setLogs(prevLogs => {
      const updatedLogs = [...prevLogs, newLog];
      return updatedLogs.slice(-maxLogs);
    });
  }, [maxLogs]);

  useEffect(() => {
    // Clear logs when cardName changes
    setLogs([]);
  }, [cardName]);

  useEffect(() => {
    // Don't set up iframe if cardName is empty or invalid
    if (!cardName || cardName.trim() === '' || cardName === 'unknown') {
      return;
    }

    // Add initial console message
    addLog('info', [`Console initialized for page: ${cardName}`]);

    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        window.location.origin,
      ];

      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      if (event.data && event.data.type === 'console') {
        const { level, args } = event.data;
        addLog(level as ConsoleLog['type'], args);
      }
    };

    window.addEventListener('message', handleMessage);

    const injectConsoleScript = () => {
      const iframeId = `console-iframe-${cardName}`;
      const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

      if (iframe && iframe.contentWindow && iframe.contentDocument) {
        try {
          const script = iframe.contentDocument.createElement('script');
          script.textContent = `
            (function() {
              // Store original console methods
              const originalConsole = {
                log: console.log.bind(console),
                error: console.error.bind(console),
                warn: console.warn.bind(console),
                info: console.info.bind(console),
                debug: console.debug.bind(console),
                trace: console.trace.bind(console),
                group: console.group.bind(console),
                groupEnd: console.groupEnd.bind(console),
                table: console.table.bind(console),
                time: console.time.bind(console),
                timeEnd: console.timeEnd.bind(console)
              };

        const post = (level, args) => {
                try {
                  window.parent.postMessage({
                    type: 'console',
                    level,
                    args: args.map(arg => {
                      if (typeof arg === 'object' && arg !== null) {
                        try { return JSON.stringify(arg, null, 2); } catch { return '[Object - circular reference]'; }
                      }
                      return String(arg);
                    }),
                    timestamp: new Date().toISOString()
          }, location.origin || '*');
                } catch {}
              };

              // Override console methods to capture all output
              ['log', 'error', 'warn', 'info', 'debug'].forEach(level => {
                console[level] = (...args) => {
                  originalConsole[level](...args);
                  post(level, args);
                };
              });

              // Capture unhandled errors
              window.addEventListener('error', (event) => {
                console.error('Uncaught Error:', event.error || event.message);
              });

              // Capture unhandled promise rejections
              window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled Promise Rejection:', event.reason);
              });

              // Override window.onerror for older browsers
              const originalOnError = window.onerror;
              window.onerror = (message, source, lineno, colno, error) => {
                console.error('Script Error:', { message, source, lineno, colno, error });
                if (originalOnError) {
                  return originalOnError(message, source, lineno, colno, error);
                }
                return false;
              };

              // --- Pixel & Analytics detection helpers ---
              const notifyOnce = (() => {
                const done = new Set();
                return (key, msg) => { if (!done.has(key)) { done.add(key); post('info', [msg]); } };
              })();

      function detectFacebookPixel() {
                try {
                  // fbq exists and is loaded
                  if (window.fbq) {
        notifyOnce('fbq', 'Pixel is initialised');
                  }
                  // Legacy ga
                  if (window.ga && (typeof window.ga === 'function')) {
                    notifyOnce('ga', 'Google Analytics (analytics.js) initialized');
                  }
                  // gtag
                  if (window.gtag && (typeof window.gtag === 'function')) {
                    notifyOnce('gtag', 'Google gtag initialized');
                  }
                  // GTM via dataLayer
                  if (Array.isArray(window.dataLayer) && typeof window.dataLayer.push === 'function') {
                    notifyOnce('gtm', 'Google Tag Manager initialized');
                  }
                } catch {}
              }

              // Observe resource loads for known CDNs
              try {
                const po = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    const name = entry.name || '';
                    if (/connect\\.facebook\\.net/.test(name)) {
                      notifyOnce('fbq-script', 'Facebook Pixel script loaded');
                    }
                    if (/googletagmanager\\.com/.test(name)) {
                      notifyOnce('gtm-script', 'Google Tag Manager script loaded');
                    }
                    if (/www\\.google-analytics\\.com/.test(name)) {
                      notifyOnce('ga-script', 'Google Analytics script loaded');
                    }
                  }
                });
                po.observe({ type: 'resource', buffered: true });
              } catch {}

              // Hook setters to catch late assignment
              try {
                let _fbq = window.fbq;
                Object.defineProperty(window, 'fbq', {
                  configurable: true,
                  get() { return _fbq; },
                  set(v) { _fbq = v; notifyOnce('fbq', 'Pixel is initialised'); }
                });
              } catch {}

              try {
                let _gtag = window.gtag;
                Object.defineProperty(window, 'gtag', {
                  configurable: true,
                  get() { return _gtag; },
                  set(v) { _gtag = v; notifyOnce('gtag', 'Google gtag initialized'); }
                });
              } catch {}

              // Periodic polling for the first few seconds after load
              const start = Date.now();
              const poll = setInterval(() => {
                detectFacebookPixel();
                if (Date.now() - start > 15000) clearInterval(poll);
              }, 500);

              // Initial check
              detectFacebookPixel();
            })();
          `;

          iframe.contentDocument.head.appendChild(script);
        } catch {
          addLog('warn', [`❌ Cannot inject console script: Cross-origin restriction`]);
        }
      } else {
        addLog('warn', [`❌ Cannot access iframe content (cross-origin)`]);
      }
    };

    // Create or find the iframe for this card
    const setupIframe = () => {
      const iframeId = `console-iframe-${cardName}`;
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement;

      if (!iframe) {
        // Create hidden iframe to load the card page
        iframe = document.createElement('iframe');
        iframe.id = iframeId;
        iframe.src = `/json/${cardName}`; // Use same origin via proxy
        iframe.style.display = 'none';

        // Add error handler for iframe
        iframe.onerror = () => {
          addLog('error', ['Failed to load page iframe', `URL: /json/${cardName}`]);
        };

        // Add load error detection
        iframe.onload = () => {
          // Check if the iframe actually loaded successfully
          try {
            // Try to access the iframe content
            const doc = iframe.contentDocument;

            if (doc === null) {
              // Cross-origin restriction - this is expected behavior
              addLog('info', [`Iframe loaded successfully (cross-origin restrictions apply)`]);
              addLog('info', [`Target URL: /json/${cardName}`]);
              // Page loaded successfully

              // Try to inject script anyway - it might work in some cases
              setTimeout(injectConsoleScript, 100);
            } else {
              addLog('info', [`Iframe loaded with full access`]);
              setTimeout(injectConsoleScript, 100);
            }
          } catch {
            addLog('info', [`Iframe loaded (security restrictions in place)`]);
            setTimeout(injectConsoleScript, 100);
          }
        };

        document.body.appendChild(iframe);
      }

      const handleLoad = () => {
        // Check if we can access the iframe content
        try {
          if (iframe.contentDocument && iframe.contentWindow) {
            addLog('info', [`Successfully connected to page: ${cardName}`]);
            // Small delay to ensure iframe is fully loaded
            setTimeout(injectConsoleScript, 100);
          } else {
            addLog('warn', [`Page loaded but console injection may fail due to CORS restrictions`]);
            setTimeout(injectConsoleScript, 100);
          }
        } catch {
          addLog('warn', [`Page loaded but console injection blocked by security policy`]);
        }
      };

      if (iframe.contentDocument?.readyState === 'complete') {
        handleLoad();
      } else {
        iframe.addEventListener('load', handleLoad);
      }

      return iframe;
    };

    const iframe = setupIframe();

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      if (iframe) {
        // Remove the iframe when component unmounts or cardName changes
        iframe.remove();
      }
    };
  }, [maxLogs, cardName, addLog]);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getLogTypeColor = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* Console Panel */}
      <div className="bg-black border border-gray-600 rounded-lg shadow-lg w-full h-full flex flex-col">
        {/* Logs Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4 space-y-2">
              <p>No console logs yet...</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 text-xs font-mono border-b border-gray-800 pb-1"
              >
                <span className="text-gray-500 text-[10px] mt-0.5 flex-shrink-0">
                  {formatTimestamp(log.timestamp)}
                </span>
                <span className={`${getLogTypeColor(log.type)} break-all`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
};

export default ConsoleView;
