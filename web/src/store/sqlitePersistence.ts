import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

const DB_NAME = 'astro_colony_db';

class SQLitePersistence {
  private sqlite: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;

  async initialize() {
    if (!Capacitor.isNativePlatform()) return;

    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.db = await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    await this.db.open();

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT
      );
      CREATE TABLE IF NOT EXISTS backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data BLOB,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async get(key: string): Promise<string | null> {
    if (!this.db) return null;
    const res = await this.db.query('SELECT value FROM kv_store WHERE key = ?', [key]);
    return res.values && res.values.length > 0 ? res.values[0].value : null;
  }

  async set(key: string, value: string): Promise<void> {
    if (!this.db) return;
    await this.db.run('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)', [key, value]);
  }

  async saveBackup(data: Uint8Array): Promise<void> {
    if (!this.db) return;
    // We store the backup as a base64 string or similar if BLOB is tricky via bridge
    const base64 = btoa(new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), ""));
    await this.db.run('INSERT INTO backups (data) VALUES (?)', [base64]);
    // Keep only last 5 backups
    await this.db.run('DELETE FROM backups WHERE id NOT IN (SELECT id FROM backups ORDER BY timestamp DESC LIMIT 5)');
  }

  async getLatestBackup(): Promise<Uint8Array | null> {
    if (!this.db) return null;
    const res = await this.db.query('SELECT data FROM backups ORDER BY timestamp DESC LIMIT 1');
    if (res.values && res.values.length > 0) {
      const base64 = res.values[0].data;
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
    return null;
  }
}

export const sqlitePersistence = new SQLitePersistence();
