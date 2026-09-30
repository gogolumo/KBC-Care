// Same 24x24 stroke icons as the web app (frontend/app/page.jsx), drawn with react-native-svg.
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

const SHAPES = {
  home: [<Path key="a" d="m3 10 9-7 9 7v10H4z" />, <Path key="b" d="M9 21v-7h6v7" />],
  card: [<Rect key="a" x="3" y="5" width="18" height="14" rx="2" />, <Path key="b" d="M3 10h18" />],
  transfer: [<Path key="a" d="M4 8h15m-4-4 4 4-4 4" />, <Path key="b" d="M20 16H5m4-4-4 4 4 4" />],
  user: [<Circle key="a" cx="12" cy="8" r="4" />, <Path key="b" d="M4 21c1-5 15-5 16 0" />],
  arrow: [<Path key="a" d="M5 12h14m-6-6 6 6-6 6" />],
  check: [<Path key="a" d="m5 12 4 4L19 6" />],
  close: [<Path key="a" d="M5 5l14 14M19 5 5 19" />],
  reset: [<Path key="a" d="M20 11a8 8 0 1 1-2.3-5.7M20 4v6h-6" />],
  lock: [<Rect key="a" x="4" y="10" width="16" height="11" rx="2" />, <Path key="b" d="M8 10V7a4 4 0 0 1 8 0v3" />],
  shield: [<Path key="a" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, <Path key="b" d="m9 12 2 2 4-4" />],
  spark: [<Path key="a" d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z" />],
  menu: [<Path key="a" d="M4 7h16M4 12h16M4 17h16" />],
  help: [
    <Circle key="a" cx="12" cy="12" r="9" />,
    <Path key="b" d="M9.8 9a2.3 2.3 0 1 1 3.5 2c-.9.5-1.3 1-1.3 2" />,
    <Path key="c" d="M12 17h.01" />,
  ],
  pause: [<Path key="a" d="M9 5v14M15 5v14" />],
  play: [<Path key="a" d="m8 5 11 7-11 7z" />],
  server: [
    <Rect key="a" x="4" y="4" width="16" height="7" rx="1.5" />,
    <Rect key="b" x="4" y="13" width="16" height="7" rx="1.5" />,
    <Path key="c" d="M8 7.5h.01M8 16.5h.01" />,
  ],
};

export default function Icon({ name, size = 20, color = colors.text }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {SHAPES[name] || null}
      </G>
    </Svg>
  );
}
