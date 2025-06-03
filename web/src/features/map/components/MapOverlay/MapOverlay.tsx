type Props = {
  children: React.ReactNode;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

const positionStyle = {
  'top-left': { top: 0, left: 0 },
  'top-right': { top: 0, right: 0 },
  'bottom-left': { bottom: 0, left: 0 },
  'bottom-right': { bottom: 0, right: 0 },
};

export default function MapOverlay({ position, children }: Props) {
  return <div style={{ position: 'absolute', zIndex: 1000, ...positionStyle[position] }}>{children}</div>;
}
