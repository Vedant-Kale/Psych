import type { ProjectStatus } from '@/lib/content/schema';

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}
