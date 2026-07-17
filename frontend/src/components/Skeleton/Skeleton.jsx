import './Skeleton.css';

export default function Skeleton({ width = '100%', height = '14px', radius = '8px' }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius }} />;
}
