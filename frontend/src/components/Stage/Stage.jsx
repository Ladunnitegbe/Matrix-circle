import './Stage.css';
import PhoneFrame from '../PhoneFrame/PhoneFrame.jsx';


export default function Stage({ children, notes }) {
  return (
    <div className="stage-body">
      <PhoneFrame>{children}</PhoneFrame>
      <div className="stage-notes">{notes}</div>
    </div>
  );
}
