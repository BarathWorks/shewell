import 'server-only';

import { db } from './db';
import { logger } from '@repo/observability';
import type { AdminIdentity } from './authz';

/**
 * Writes an entry to the admin audit trail.
 *
 * Consequential admin actions previously left no record of who performed them —
 * approving a practitioner, disabling a customer, changing a colleague's role.
 * This is the record.
 *
 * **Never throws.** An audit write failing must not roll back the action it
 * describes, or a transient database blip becomes an outage. A failed write is
 * logged loudly instead, so the gap is visible.
 *
 * Keep `metadata` free of secrets and patient detail: this table is read by
 * operators and exported during reviews. Ids and before/after states, not names,
 * emails or medical notes.
 */
export type AuditEntry = {
  actor: AdminIdentity;
  /** Dotted event name, e.g. 'admin.role_changed'. */
  action: string;
  /** Model touched, e.g. 'AdminUser'. */
  entity: string;
  entityId?: string;
  /** One line a human can read without decoding metadata. */
  summary?: string;
  metadata?: Record<string, unknown>;
};

export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await db.adminAuditLog.create({
      data: {
        actorId: entry.actor.id,
        // Denormalised so the entry still reads correctly if the account is removed.
        actorEmail: entry.actor.email,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        summary: entry.summary ?? null,
        metadata: (entry.metadata ?? undefined) as never
      }
    });
  } catch (error) {
    logger.error('audit.write_failed', {
      source: 'admin-audit',
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      userId: entry.actor.id,
      error
    });
  }
}
