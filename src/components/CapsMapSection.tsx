import React, { Suspense, lazy } from 'react'

// O Leaflet é a maior dependência do site: só baixamos o mapa quando esta seção aparece,
// deixando o carregamento inicial das outras páginas mais leve.
const CapsMap = lazy(() => import('./CapsMap'))

export default function CapsMapSection(): React.ReactElement {
  return (
    <div className="caps-map-wrapper">
      <h3 className="caps-map-title">Mapa interativo da Rede de Saúde Mental em Campo Grande (MS)</h3>
      <p className="caps-map-subtitle">
        Use os marcadores para localizar unidades, comparar endereços e consultar contatos da rede.
      </p>
      <Suspense fallback={<div className="caps-map caps-map--loading" role="status">Carregando mapa...</div>}>
        <CapsMap />
      </Suspense>
    </div>
  )
}
