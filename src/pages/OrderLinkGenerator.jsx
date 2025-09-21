import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../context/AuthContext';

export default function OrderLinkGenerator() {
  const { state: authState } = useAuth();
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  // Solo embaladores pueden acceder
  if (authState.user?.role !== ROLES.EMBALADOR) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ padding: '2rem' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>
            Acceso Denegado
          </h2>
          <p style={{ color: '#64748b' }}>
            Solo los embaladores pueden acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  // Generar el enlace fijo al cargar
  useEffect(() => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/menu/whatsapp`;
    setGeneratedLink(link);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = generatedLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sendWhatsApp = () => {
    const message = `🍽️ *¡Hola! Bienvenido a nuestro restaurante* 🍽️

Haz tu pedido directamente desde tu celular:
${generatedLink}

¡Es rápido y fácil! 😊`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
          Enlace del Menú Digital
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Enlace fijo para compartir con todos los clientes por WhatsApp
        </p>
      </div>

      {/* Enlace fijo */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Enlace del Menú Digital</h3>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            marginBottom: '1rem'
          }}>
            Este es el enlace que debes compartir con todos los clientes por WhatsApp:
          </p>

          {/* Enlace generado */}
          {generatedLink && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Enlace del Menú Digital:
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    background: 'white'
                  }}
                />
                <button
                  onClick={copyToClipboard}
                  className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                >
                  {copied ? '✓' : '📋'}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              {/* Botones de acción */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={sendWhatsApp}
                  className="btn btn-whatsapp"
                >
                  <span>📱</span>
                  Enviar por WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">¿Cómo funciona?</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            background: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{
              background: '#2563eb',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              1
            </div>
            <div>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '0.25rem'
              }}>
                Copia el enlace
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: '#1e40af'
              }}>
                Copia el enlace fijo del menú digital
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{
              background: '#10b981',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              2
            </div>
            <div>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#065f46',
                marginBottom: '0.25rem'
              }}>
                Envía por WhatsApp
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: '#065f46'
              }}>
                El cliente recibe el enlace por WhatsApp y accede al menú digital
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            background: '#fef3c7',
            borderRadius: '8px',
            border: '1px solid #fde68a'
          }}>
            <div style={{
              background: '#f59e0b',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              3
            </div>
            <div>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '0.25rem'
              }}>
                Cliente hace su pedido
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: '#92400e'
              }}>
                El cliente selecciona sus productos y envía el pedido
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            background: '#f3e8ff',
            borderRadius: '8px',
            border: '1px solid #d8b4fe'
          }}>
            <div style={{
              background: '#8b5cf6',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              4
            </div>
            <div>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b21a8',
                marginBottom: '0.25rem'
              }}>
                Pedido llega a cocina
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: '#6b21a8'
              }}>
                El pedido aparece automáticamente en el sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Beneficios</h3>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem'
            }}>
              ⏱️
            </div>
            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '0.25rem'
            }}>
              Ahorro de Tiempo
            </h4>
            <p style={{
              fontSize: '0.75rem',
              color: '#64748b'
            }}>
              Los clientes ordenan solos, tú solo preparas
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem'
            }}>
              📱
            </div>
            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '0.25rem'
            }}>
              Experiencia Digital
            </h4>
            <p style={{
              fontSize: '0.75rem',
              color: '#64748b'
            }}>
              Los clientes ordenan desde WhatsApp
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem'
            }}>
              🎯
            </div>
            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '0.25rem'
            }}>
              Menos Errores
            </h4>
            <p style={{
              fontSize: '0.75rem',
              color: '#64748b'
            }}>
              Pedidos automáticos sin errores de transcripción
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}