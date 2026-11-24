import type { Metadata } from 'next';
import { Order, type Sources } from '@/components/order/Order';
import { allPosts, allProjects } from '@/lib/content';

export const metadata: Metadata = {
  title: 'The Order',
  description: 'Describe the engineer you need and get the matching work from Vedant Kale, with a source for every claim.',
};

export default function OrderPage() {
  const sources: Sources = { profile: { title: 'Facts', href: '/facts/' } };
  for (const p of allProjects()) sources[p.slug] = { title: p.title, href: `/projects/${p.slug}/` };
  for (const p of allPosts()) sources[p.slug] = { title: p.title, href: `/palace/${p.slug}/` };

  return (
    <main className="page order">
      <h1>The Order</h1>
      <p className="lead">
        Tell me the engineer you need. I&apos;ll mix it from work I&apos;ve actually done, and show where each part comes from.
      </p>
      <Order sources={sources} />
    </main>
  );
}
