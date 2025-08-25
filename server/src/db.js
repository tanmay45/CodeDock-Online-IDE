import pkg from 'pg';
const { Pool } = pkg;
import { config } from './config.js';

export const pool = new Pool(config.pg);

// 🔧 helper to normalize values before inserting into Postgres
function normalizeValue(v) {
  if (v && typeof v === 'object') {
    // Handle Long.js objects (from BullMQ / Redis)
    if (typeof v.toNumber === 'function') {
      return v.toNumber();
    }
    // ✅ If it's an array, let pg driver handle it (don't stringify)
    if (Array.isArray(v)) {
      return v;
    }
    // For plain objects -> stringify
    return JSON.stringify(v);
  }
  return v ?? null;
}

export async function createExecution({ id, language, code, stdin, args }) {
  const res = await pool.query(
    `INSERT INTO executions (id, language, code, stdin, args, status)
     VALUES ($1,$2,$3,$4,$5,'queued') RETURNING *`,
    [
      normalizeValue(id),
      normalizeValue(language),
      normalizeValue(code),
      normalizeValue(stdin),
      normalizeValue(args) // ✅ Will now be an array, not a string
    ]
  );
  return res.rows[0];
}

export async function updateExecution(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return;

  const sets = keys.map((k, i) => `"${k}"=$${i + 1}`).join(', ');
  const values = keys.map(k => normalizeValue(fields[k]));
  values.push(normalizeValue(id));

  await pool.query(
    `UPDATE executions SET ${sets} WHERE id=$${values.length}`,
    values
  );
}

export async function listExecutions(limit = 50) {
  const r = await pool.query(
    'SELECT id, language, status, exit_code, created_at FROM executions ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return r.rows;
}

export async function getExecution(id) {
  const r = await pool.query('SELECT * FROM executions WHERE id=$1', [normalizeValue(id)]);
  return r.rows[0] || null;
}
