import './PhoneFrame.css';
import StatusBar from '../StatusBar/StatusBar.jsx';

export default function PhoneFrame({ children, bottom }) {
  return (
    <div className="phone-frame-screen">
      <StatusBar />
      <div className="phone-frame-scroll">{children}</div>
      {bottom}
    </div>
  );
}
