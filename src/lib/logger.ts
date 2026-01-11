/**
 * 🔥 FireSend Logger "Chivato"
 * Sistema centralizado de logging que captura todo
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "success";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
  stack?: string;
}

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  persistToStorage: boolean;
  maxStoredLogs: number;
  showTimestamp: boolean;
  showModule: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  success: 2,
  warn: 3,
  error: 4,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: "#9CA3AF",
  info: "#3B82F6",
  success: "#10B981",
  warn: "#F59E0B",
  error: "#EF4444",
};

const LOG_ICONS: Record<LogLevel, string> = {
  debug: "🔍",
  info: "ℹ️",
  success: "✅",
  warn: "⚠️",
  error: "❌",
};

class FireLogger {
  private config: LoggerConfig = {
    enabled: process.env.NODE_ENV !== "production",
    minLevel: "debug",
    persistToStorage: true,
    maxStoredLogs: 500,
    showTimestamp: true,
    showModule: true,
  };

  private logs: LogEntry[] = [];
  private listeners: Set<(entry: LogEntry) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
      // Exponer en window para debugging
      (
        window as unknown as { __FIRESEND_LOGGER__: FireLogger }
      ).__FIRESEND_LOGGER__ = this;
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("firesend_logs");
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch {
      // Storage no disponible
    }
  }

  private saveToStorage(): void {
    if (!this.config.persistToStorage || typeof window === "undefined") return;
    try {
      // Mantener solo los últimos N logs
      const logsToStore = this.logs.slice(-this.config.maxStoredLogs);
      localStorage.setItem("firesend_logs", JSON.stringify(logsToStore));
    } catch {
      // Storage lleno o no disponible
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(entry: LogEntry): string[] {
    const parts: string[] = [];

    if (this.config.showTimestamp) {
      parts.push(`[${entry.timestamp}]`);
    }

    parts.push(`${LOG_ICONS[entry.level]}`);

    if (this.config.showModule) {
      parts.push(`[${entry.module}]`);
    }

    parts.push(entry.message);

    return parts;
  }

  private log(
    level: LogLevel,
    module: string,
    message: string,
    data?: unknown,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
      stack: level === "error" ? new Error().stack : undefined,
    };

    // Guardar en memoria
    this.logs.push(entry);

    // Notificar listeners
    this.listeners.forEach((listener) => listener(entry));

    // Persistir
    this.saveToStorage();

    // Mostrar en consola si está habilitado
    if (!this.shouldLog(level)) return;

    const formattedParts = this.formatMessage(entry);
    const style = `color: ${LOG_COLORS[level]}; font-weight: bold;`;

    if (data !== undefined) {
      console.groupCollapsed(`%c${formattedParts.join(" ")}`, style);
      console.log("Data:", data);
      if (entry.stack) console.log("Stack:", entry.stack);
      console.groupEnd();
    } else {
      console.log(`%c${formattedParts.join(" ")}`, style);
    }
  }

  // Métodos públicos de logging
  debug(module: string, message: string, data?: unknown): void {
    this.log("debug", module, message, data);
  }

  info(module: string, message: string, data?: unknown): void {
    this.log("info", module, message, data);
  }

  success(module: string, message: string, data?: unknown): void {
    this.log("success", module, message, data);
  }

  warn(module: string, message: string, data?: unknown): void {
    this.log("warn", module, message, data);
  }

  error(module: string, message: string, data?: unknown): void {
    this.log("error", module, message, data);
  }

  // Crear un logger con módulo prefijado
  module(moduleName: string) {
    return {
      debug: (msg: string, data?: unknown) => this.debug(moduleName, msg, data),
      info: (msg: string, data?: unknown) => this.info(moduleName, msg, data),
      success: (msg: string, data?: unknown) =>
        this.success(moduleName, msg, data),
      warn: (msg: string, data?: unknown) => this.warn(moduleName, msg, data),
      error: (msg: string, data?: unknown) => this.error(moduleName, msg, data),
    };
  }

  // Utilidades
  getLogs(filter?: {
    level?: LogLevel;
    module?: string;
    limit?: number;
  }): LogEntry[] {
    let result = [...this.logs];

    if (filter?.level) {
      result = result.filter((log) => log.level === filter.level);
    }

    if (filter?.module) {
      result = result.filter((log) => log.module.includes(filter.module!));
    }

    if (filter?.limit) {
      result = result.slice(-filter.limit);
    }

    return result;
  }

  clearLogs(): void {
    this.logs = [];
    if (typeof window !== "undefined") {
      localStorage.removeItem("firesend_logs");
    }
    this.info("Logger", "Logs cleared");
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Suscribirse a nuevos logs (útil para UI de logs en tiempo real)
  subscribe(callback: (entry: LogEntry) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Configuración
  configure(options: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...options };
  }

  // Tabla resumen en consola
  summary(): void {
    const counts = this.logs.reduce(
      (acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.table(counts);
  }
}

// Singleton
export const logger = new FireLogger();

// Helpers para uso rápido
export const log = {
  debug: (module: string, msg: string, data?: unknown) =>
    logger.debug(module, msg, data),
  info: (module: string, msg: string, data?: unknown) =>
    logger.info(module, msg, data),
  success: (module: string, msg: string, data?: unknown) =>
    logger.success(module, msg, data),
  warn: (module: string, msg: string, data?: unknown) =>
    logger.warn(module, msg, data),
  error: (module: string, msg: string, data?: unknown) =>
    logger.error(module, msg, data),
};

// Export types
export type { LogEntry, LogLevel, LoggerConfig };
