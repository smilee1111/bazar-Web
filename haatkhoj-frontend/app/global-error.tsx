'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#142A1C',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '20px'
        }}>
          <div style={{ maxWidth: '600px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Application Error</h1>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>
              We encountered an unexpected error. This has been logged.
            </p>
            
            <details style={{
              backgroundColor: '#222',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'left',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <summary style={{ cursor: 'pointer', color: '#ff6b6b', fontWeight: 'bold' }}>
                Error Details
              </summary>
              <pre style={{
                marginTop: '10px',
                fontSize: '12px',
                color: '#aaa',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {error.message}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </pre>
            </details>

            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                backgroundColor: '#267A4C',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1C5C39')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#267A4C')}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
