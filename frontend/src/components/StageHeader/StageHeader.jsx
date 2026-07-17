import './StageHeader.css';
import StateSwitcher from '../StateSwitcher/StateSwitcher.jsx';

export default function StageHeader({ group, title, description, variants, current, onChangeVariant }) {
  return (
    <div className="stage-header">
      <p className="stage-header-eyebrow">{group}</p>
      <h2 className="stage-header-title">{title}</h2>
      <p className="stage-header-desc">{description}</p>
      <StateSwitcher variants={variants} current={current} onChange={onChangeVariant} />
    </div>
  );
}
