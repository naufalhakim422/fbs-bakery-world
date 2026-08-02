import { AuditLog } from '@/types';

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    adminName: 'admin@fbsbakeryworld.com',
    action: 'System Initialization',
    category: 'SETTINGS',
    details: 'Audit Log System initialized with security tracking active.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'log-2',
    adminName: 'admin@fbsbakeryworld.com',
    action: 'Admin Login',
    category: 'AUTH',
    details: 'Successful login from Admin Dashboard Portal.',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
  }
];

export const getAuditLogs = (): AuditLog[] => {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  try {
    const saved = localStorage.getItem('fbs_audit_logs');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading audit logs:', e);
  }
  return INITIAL_AUDIT_LOGS;
};

export const recordAuditLog = (
  action: string,
  category: AuditLog['category'],
  details: string,
  adminName: string = 'admin@fbsbakeryworld.com'
): AuditLog => {
  const currentLogs = getAuditLogs();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    adminName,
    action,
    category,
    details,
    timestamp: new Date().toISOString(),
  };

  const updatedLogs = [newLog, ...currentLogs].slice(0, 300); // Keep latest 300 entries

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('fbs_audit_logs', JSON.stringify(updatedLogs));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('fbs_db_updated'));
    } catch (e) {
      console.error('Error saving audit log:', e);
    }
  }

  return newLog;
};
