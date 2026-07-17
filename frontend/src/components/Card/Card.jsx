import './Card.css';

export default function Card({ children, muted = false, tinted = false, style }) {
  const classes = ['card', muted ? 'card-muted' : '', tinted ? 'card-tinted' : ''].join(' ').trim();
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
