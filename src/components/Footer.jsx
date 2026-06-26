export default function Footer() {
  return (
    <footer className="w-full text-center py-4 mt-6"
      style={{ borderTop: '1px solid rgba(168,85,247,0.15)' }}>
      <p className="text-xs font-semibold"
        style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em' }}>
        © 2026 Copyright. All Rights Reserved.{' '}
        <span style={{ color: 'rgba(251,191,36,0.7)' }}>Dr. Zeeshan Ahmed Khan</span>
        {' '}|{' '}
        <span style={{ color: 'rgba(192,132,252,0.7)' }}>The Tanganyika Schools</span>
      </p>
    </footer>
  );
}
