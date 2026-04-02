import React from 'react';

export default function Statistics() {
  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Estatísticas</h1>
      <p>Aqui você poderá ver os Brawlers mais banidos, mapas mais jogados, taxa de vitórias, etc.</p>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#333', borderRadius: '8px' }}>
        <h3>Em construção 🚧</h3>
        {/* Futuramente você pode passar aquele Hook de JSON para cá e ler os dados salvos! */}
      </div>
    </div>
  );
}