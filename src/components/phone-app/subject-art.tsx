/* The Question Universe's subject icons, after the app's: a small 3D still life for each subject, standing on a green
   tile. Redrawn flat with a lit side and a shaded side, so they stay sharp at any size. 64 × 64. */

export type ArtSubject = "Sejarah" | "Sains" | "Matematik" | "Prinsip Perakaunan" | "Biologi" | "Kimia";

const tile = <rect x="11" y="12" width="42" height="40" rx="3.5" fill="#5fcf72" />;
const tileShade = <path d="M11 46h42v2.5a3.5 3.5 0 0 1-3.5 3.5h-35A3.5 3.5 0 0 1 11 48.5Z" fill="#4cb85f" />;

/** An open book, the Petronas towers and a bunga raya. */
function Sejarah() {
  return (
    <>
      {tile}
      {tileShade}
      <path d="M17 18.5 16 33" stroke="#4d5560" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M22 17 21.4 33" stroke="#5d6672" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16.8 24h5" stroke="#9aa3ad" strokeWidth="1" />
      <path d="M7 34c8-2.4 17-1.6 25 2.6 8-4.2 17-5 25-2.6v11c-8-2.2-17-1.4-25 2.8-8-4.2-17-5-25-2.8Z" fill="#f3e4c4" />
      <path d="M7 34c8-2.4 17-1.6 25 2.6V48c-8-4.2-17-5-25-2.8Z" fill="#ead6ad" />
      <path d="M7 45.2c8-2.2 17-1.4 25 2.8 8-4.2 17-5 25-2.8v2c-8-2-17-1.2-25 3-8-4.2-17-5-25-3Z" fill="#b98a4e" />
      <path d="M11 38c6-1.2 12-.6 17 1.4M11 41.5c6-1.2 12-.6 17 1.4M36 39.4c5-2 11-2.6 17-1.4M36 42.9c5-2 11-2.6 17-1.4" stroke="#d6bf92" strokeWidth=".9" />
      <g transform="translate(33 30)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-6" rx="4.6" ry="6.4" transform={`rotate(${a})`} fill="#e2433f" />
        ))}
        {[36, 108, 180, 252, 324].map((a) => (
          <path key={a} d="M0 0 0-9" transform={`rotate(${a})`} stroke="#b82d2d" strokeWidth=".8" />
        ))}
        <circle r="2.2" fill="#f7c948" />
        <path d="M0 0 4-7" stroke="#f7c948" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      <path d="M44 20c2-2 5-2 6 .5 1 2.4-.6 4.6-1 7.5h-5c-.6-2.6-1.8-5.6 0-8Z" fill="#c99566" />
      <path d="M45 20.5c-1.4-2-1-4 .6-4.4M49.5 21c1.8-1.8 1.8-3.8.2-4.6" stroke="#8a6040" strokeWidth="1" strokeLinecap="round" fill="none" />
      <circle cx="46.6" cy="22.6" r=".7" fill="#3a2a20" />
    </>
  );
}

/** A test-tube rack with flasks on a blue stand. */
function Sains() {
  return (
    <>
      {tile}
      {tileShade}
      <path d="M14 48h36a3 3 0 0 0 3-3v-1H11v1a3 3 0 0 0 3 3Z" fill="#3a8fd9" />
      <rect x="11" y="40" width="42" height="5" rx="2.5" fill="#7cc3f5" />
      <path d="M16 40V18M48 40V18" stroke="#9fd4f8" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="13" y="15" width="38" height="5.5" rx="2.75" fill="#d99a52" />
      <path d="M13 18h38" stroke="#b97a36" strokeWidth="1.2" />
      {[22, 31, 40].map((x) => (
        <g key={x}>
          <rect x={x - 2} y="10" width="4" height="7" rx="1.5" fill="#e9f5fd" stroke="#a7c6db" strokeWidth=".8" />
          <rect x={x - 2.4} y="9" width="4.8" height="2.2" rx="1" fill="#c9d4dc" />
        </g>
      ))}
      <path d="M24 26v6l-5 8.5c-.6 1 .1 2.5 1.3 2.5h12.4c1.2 0 1.9-1.5 1.3-2.5L29 32v-6Z" fill="#e6f4fc" fillOpacity=".9" stroke="#8fb9d4" strokeWidth=".9" />
      <path d="M20.6 38.6h11.8l1.3 2c.6 1-.1 2.4-1.3 2.4H20.6c-1.2 0-1.9-1.4-1.3-2.4Z" fill="#7fd3c6" />
      <path d="M38 24h6v9.5a6 6 0 1 1-6 0Z" fill="#e6f4fc" fillOpacity=".9" stroke="#8fb9d4" strokeWidth=".9" />
      <path d="M35.4 38.6a6 6 0 0 0 11.2 0Z" fill="#7fd3c6" />
      <path d="M25.6 27v4.5M39.4 25v7" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".9" />
    </>
  );
}

/** A die among the four signs. */
function Matematik() {
  return (
    <>
      {tile}
      {tileShade}
      <path d="M18 24 34 18l14 7-1 17-16 6-13-7Z" fill="#7ccdf5" />
      <path d="M18 24 34 18l14 7-15 6Z" fill="#b5e4fb" />
      <path d="M33 31 48 25l-1 17-16 6Z" fill="#53b1e3" />
      {([
        [26, 23.5],
        [33, 21.6],
        [39.6, 25.2],
        [32.4, 27.8],
      ] as const).map(([x, y], i) => (
        <ellipse key={`t${i}`} cx={x} cy={y} rx="1.9" ry="1.2" fill="#fff" />
      ))}
      {([
        [22, 32],
        [27, 35],
        [22, 39],
        [27, 42],
      ] as const).map(([x, y], i) => (
        <circle key={`l${i}`} cx={x} cy={y} r="1.6" fill="#fff" />
      ))}
      {([
        [37, 34],
        [43, 31],
        [40, 40],
      ] as const).map(([x, y], i) => (
        <circle key={`r${i}`} cx={x} cy={y} r="1.6" fill="#e8f6fd" />
      ))}
      <path d="M7.5 9.5 14 16M14 9.5 7.5 16" stroke="#a46ce0" strokeWidth="4" strokeLinecap="round" />
      <path d="M50.5 6v9M46 10.5h9" stroke="#f5c542" strokeWidth="4" strokeLinecap="round" />
      <path d="M8 51h10" stroke="#e9548a" strokeWidth="4" strokeLinecap="round" />
      <path d="M45 46h9" stroke="#39b9a2" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="49.5" cy="41.5" r="1.9" fill="#39b9a2" />
      <circle cx="49.5" cy="50.5" r="1.9" fill="#39b9a2" />
    </>
  );
}

/** A folder of statements, a calculator and stacked coins. */
function PrinsipPerakaunan() {
  return (
    <>
      {tile}
      {tileShade}
      <rect x="21" y="8" width="24" height="30" rx="2" fill="#f2f4f7" stroke="#c7ced6" strokeWidth=".8" />
      <path d="M25 14h16M25 18h16M25 22h11" stroke="#b3bcc6" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 22h10l3 3h18a2 2 0 0 1 2 2v19H14Z" fill="#3f4a57" />
      <path d="M14 27h33v19H14Z" fill="#53606f" />
      <rect x="22" y="24" width="18" height="25" rx="2.5" fill="#2f3842" />
      <rect x="24.2" y="26.4" width="13.6" height="5" rx="1" fill="#d8e3e8" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={24.4 + c * 4.6} y={33.6 + r * 4.6} width="3.6" height="3.4" rx=".8" fill={r === 2 && c === 2 ? "#f08aa0" : "#f4b6c2"} />),
      )}
      {([
        [45, 47],
        [45, 43.6],
        [45, 40.2],
        [51.5, 47],
        [51.5, 43.6],
      ] as const).map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y + 1.2} rx="5" ry="2.2" fill="#c9921f" />
          <ellipse cx={x} cy={y} rx="5" ry="2.2" fill="#f5c542" />
        </g>
      ))}
      <circle cx="44" cy="34" r="5" fill="#f5c542" stroke="#d7a321" strokeWidth="1.2" />
      <path d="M44 31.4v5.2M42.2 32.6h3.2M42.2 35.4h3.2" stroke="#b9861a" strokeWidth=".9" strokeLinecap="round" />
    </>
  );
}

/** A microscope beside a strand of DNA. */
function Biologi() {
  return (
    <>
      {tile}
      {tileShade}
      <path d="M15 47h22" stroke="#3d4b5a" strokeWidth="4" strokeLinecap="round" />
      <path d="M30 46c4-3 5-9 2-14" stroke="#5a6a7a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="18" y="35" width="12" height="3" rx="1.5" fill="#8a9aaa" />
      <path d="M21 34 27 14" stroke="#e9eef2" strokeWidth="6" strokeLinecap="round" />
      <path d="M21 34 27 14" stroke="#c3ccd4" strokeWidth="2" strokeLinecap="round" />
      <path d="M25.5 12.5 29 13.5" stroke="#3d4b5a" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M20 33.6 19.4 36" stroke="#3d4b5a" strokeWidth="3" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const y = 14 + i * 5.6;
        const w = Math.cos(i * 1.05) * 5;
        return (
          <g key={i}>
            <path d={`M${44 - w} ${y}H${44 + w}`} stroke={i % 2 ? "#f08aa0" : "#a46ce0"} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx={44 - w} cy={y} r="1.7" fill="#39b9a2" />
            <circle cx={44 + w} cy={y} r="1.7" fill="#f5c542" />
          </g>
        );
      })}
    </>
  );
}

/** A round flask of violet solution and a molecule. */
function Kimia() {
  return (
    <>
      {tile}
      {tileShade}
      <path d="M24 12h8v10.5a12 12 0 1 1-8 0Z" fill="#eef7fc" fillOpacity=".95" stroke="#9fbdd2" strokeWidth="1" />
      <path d="M16.5 35a12 12 0 0 0 23 0Z" fill="#a46ce0" />
      <path d="M16.6 35a12 12 0 0 1 22.8 0c-3-1.6-7-1-11.4 0s-8 1.4-11.4 0Z" fill="#c39cf0" />
      <rect x="22.6" y="10" width="10.8" height="3.2" rx="1.4" fill="#cfd9e0" />
      <circle cx="24" cy="38" r="1.6" fill="#e3d1f9" />
      <circle cx="30" cy="41" r="1.1" fill="#e3d1f9" />
      <path d="M26 15v7" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M44 16 50 22M44 16 38 21M50 22 48 30M38 21 40 29" stroke="#3d4b5a" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="44" cy="16" r="3.2" fill="#f08aa0" />
      <circle cx="50" cy="22" r="2.6" fill="#f5c542" />
      <circle cx="38" cy="21" r="2.6" fill="#39b9a2" />
      <circle cx="48" cy="30" r="2.2" fill="#7ccdf5" />
      <circle cx="40" cy="29" r="2.2" fill="#7ccdf5" />
    </>
  );
}

const art = { Sejarah, Sains, Matematik, "Prinsip Perakaunan": PrinsipPerakaunan, Biologi, Kimia } as const;

export function SubjectArt({ subject, className }: { subject: ArtSubject; className?: string }) {
  const Drawing = art[subject];
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      <Drawing />
    </svg>
  );
}
