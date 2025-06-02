type Props = {
  children: React.ReactNode;
};

export default function MapOverlay({ children }: Props) {
  return <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }}>{children}</div>;
}
