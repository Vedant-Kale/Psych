import Link from 'next/link';

export default function Home() {
  return (
    <main className="page">
      <Link className="skip" href="/facts/">
        Skip to the facts
      </Link>
      <h1>PSYCH</h1>
      <p>One night in Melbourne is being built. The facts are ready now.</p>
      <p>
        Or <Link href="/order/">order an engineer</Link>: describe what you need and get the matching work, with sources.
      </p>
    </main>
  );
}
