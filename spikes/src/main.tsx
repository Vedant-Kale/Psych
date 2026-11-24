import { createRoot } from 'react-dom/client';
import { S1 } from './S1';
import { S2 } from './S2';
import { S3 } from './S3';
import { S4 } from './S4';

const pages: Record<string, () => React.JSX.Element> = { '1': S1, '2': S2, '3': S3, '4': S4 };

function Menu() {
  return (
    <main style={{ padding: 24 }}>
      <h1>PSYCH spikes</h1>
      <ol>
        <li><a href="?s=1">S1 — amber splat on a phone</a> (needs captures/scan.spz)</li>
        <li><a href="?s=2">S2 — third → first person</a> (needs the scan)</li>
        <li><a href="?s=3">S3 — dusk → night blend, scroll + clock</a></li>
        <li><a href="?s=4">S4 — ink → real dissolve</a></li>
      </ol>
      <p>Query options: <code>?budget=100000</code> <code>?dpr=1.5</code> <code>?post=0</code> <code>?rm</code> (reduced motion) <code>?flip=0</code> <code>?face=180</code> <code>?url=/other.ply</code></p>
    </main>
  );
}

const Page = pages[new URLSearchParams(location.search).get('s') ?? ''] ?? Menu;
createRoot(document.getElementById('root')!).render(<Page />);
