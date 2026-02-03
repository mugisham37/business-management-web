'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  X, 
  Download, 
  Trash2, 
  Filter,
  ChevronDown,
  ChevronUp,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
}

interface DevelopmentLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  maxEntries?: number;
}

export function DevelopmentLogger({ 
  isOpen, 
  onClose, 
  maxEntries = 1000 
}: DevelopmentLoggerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    console.log('🔍 [DevelopmentLogger] Starting development logger...');

    // Intercept console methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const addLog = (level: LogEntry['level'], category: string, message: string, data?: any) => {
      const logEntry: LogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        level,
        category,
        message,
        data,
      };

      setLogs(prev => {
        const newLogs = [...prev, logEntry];
        return newLogs.slice(-maxEntries); // Keep only the last maxEntries
      });
    };

    // Override console methods to capture logs
    console.log = (...args) => {
      originalLog(...args);
      const message = args.join(' ');
      
      // Parse structured logs
      if (message.includes('[GraphQL Client]')) {
        addLog('info', 'GraphQL', message, args.length > 1 ? args.slice(1) : undefined);
      } else if (message.includes('[ConnectionMonitor]')) {
        addLog('info', 'Connection', message, args.length > 1 ? args.slice(1) : undefined);
      } else if (message.includes('[Auth]')) {
        addLog('info', 'Auth', message, args.length > 1 ? args.slice(1) : undefined);
      } else if (message.includes('[ServerDependencyCheck]')) {
        addLog('info', 'Server', message, args.length > 1 ? args.slice(1) : undefined);
      } else {
        addLog('info', 'General', message, args.length > 1 ? args.slice(1) : undefined);
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      const message = args.join(' ');
      addLog('warn', 'Warning', message, args.length > 1 ? args.slice(1) : undefined);
    };

    console.error = (...args) => {
      originalError(...args);
      const message = args.join(' ');
      addLog('error', 'Error', message, args.length > 1 ? args.slice(1) : undefined);
    };

    // Listen for custom connection events
    const handleConnectionLog = (event: CustomEvent) => {
      addLog('info', 'Connection', event.detail.message);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('connection-log', handleConnectionLog as EventListener);
    }

    // Cleanup
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      
      if (typeof window !== 'undefined') {
        window.removeEventListener('connection-log', handleConnectionLog as EventListener);
      }
    };
  }, [isOpen, maxEntries]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isAutoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isAutoScroll]);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'connection') return log.category.toLowerCase().includes('connection') || log.category.toLowerCase().includes('graphql') || log.category.toLowerCase().includes('server');
    if (filter === 'auth') return log.category.toLowerCase().includes('auth');
    if (filter === 'errors') return log.level === 'error' || log.level === 'warn';
    return log.level === filter;
  });

  const clearLogs = () => {
    setLogs([]);
    console.log('🧹 [DevelopmentLogger] Logs cleared');
  };

  const downloadLogs = () => {
    const logData = logs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      category: log.category,
      message: log.message,
      data: log.data,
    }));

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `development-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      case 'debug': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    return <Circle className={cn('w-2 h-2 fill-current', getLevelColor(level))} />;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 w-96 max-w-[90vw] bg-black text-green-400 rounded-lg shadow-2xl border border-gray-700 font-mono text-sm z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-900 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span className="font-semibold">Development Logger</span>
            <Badge variant="outline" className="text-xs">
              {filteredLogs.length} entries
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              {isMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Controls */}
            <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600"
                >
                  <option value="all">All</option>
                  <option value="connection">Connection</option>
                  <option value="auth">Auth</option>
                  <option value="errors">Errors</option>
                  <option value="info">Info</option>
                  <option value="warn">Warnings</option>
                  <option value="error">Errors Only</option>
                </select>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={isAutoScroll}
                    onChange={(e) => setIsAutoScroll(e.target.checked)}
                    className="w-3 h-3"
                  />
                  Auto-scroll
                </label>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={downloadLogs}
                  className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearLogs}
                  className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Logs */}
            <div
              ref={logContainerRef}
              className="h-64 overflow-y-auto p-2 space-y-1"
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
                setIsAutoScroll(isAtBottom);
              }}
            >
              {filteredLogs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No logs to display
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 text-xs leading-relaxed"
                  >
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      {getLevelIcon(log.level)}
                      <span className="text-gray-500 w-16 text-right">
                        {log.timestamp.toLocaleTimeString().split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {log.category}
                        </Badge>
                        <span className="text-green-400 break-words">
                          {log.message}
                        </span>
                      </div>
                      {log.data && (
                        <div className="mt-1 text-gray-400 text-xs">
                          <pre className="whitespace-pre-wrap break-words">
                            {typeof log.data === 'object' 
                              ? JSON.stringify(log.data, null, 2) 
                              : String(log.data)
                            }
                          </pre>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default DevelopmentLogger;