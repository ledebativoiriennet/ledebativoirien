export default function Loading() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        width: '120px',
        height: '120px',
        position: 'relative',
        animation: 'pulse 2s infinite ease-in-out'
      }}>
        <img 
          src="/logo.svg" 
          alt="Le Débat Ivoirien" 
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div style={{
        marginTop: '2rem',
        fontSize: '0.9rem',
        fontWeight: 800,
        color: '#dc2626',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        animation: 'fadeInOut 1.5s infinite'
      }}>
        Chargement en cours...
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes fadeInOut {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}} />
    </div>
  );
}
