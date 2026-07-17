import './Layout.css';
import Sidebar from '../Sidebar/Sidebar.jsx';

export default function Layout({ groups, current, onSelect, children }) {
  return (
    <div className="layout">
      <Sidebar groups={groups} current={current} onSelect={onSelect} />
      <main className="layout-main">{children}</main>
    </div>
  );
}
