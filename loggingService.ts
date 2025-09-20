import { LogEntry, LogType, User } from './types';

class LoggingService {
    private logs: LogEntry[] = [];
    private subscribers: Array<(logs: LogEntry[]) => void> = [];
    private nextId = 1;

    addLog(type: LogType, message: string, user?: User | null) {
        const logEntry: LogEntry = {
            id: this.nextId++,
            timestamp: new Date().toISOString(),
            type,
            message,
            ...(user && { user: { email: user.email } }),
        };
        this.logs = [...this.logs, logEntry];
        this.notifySubscribers();
    }

    getLogs(): LogEntry[] {
        return this.logs;
    }

    subscribe(callback: (logs: LogEntry[]) => void): () => void {
        this.subscribers.push(callback);
        // Immediately notify with current logs
        callback(this.logs); 
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    private notifySubscribers() {
        this.subscribers.forEach(callback => callback([...this.logs]));
    }
}

export const log = new LoggingService();