import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
// Importa os assets do leaflet para que o bundler (Vite) resolva os caminhos corretamente
const markerIcon2xUrl = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href
const markerIconUrl = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href
const markerShadowUrl = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href

import { caps } from '../data/mock'

import 'leaflet/dist/leaflet.css'

// Ajuste necessário para o Leaflet encontrar os ícones quando rodando com Vite.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  // Usa os arquivos importados para garantir caminhos corretos com Vite
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
})

// Ícone para unidades do tipo CAPS.
const capsIcon = new L.Icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [22, 34],
  iconAnchor: [11, 34],
  popupAnchor: [0, -34],
  className: 'caps-marker',
})

// Ícone para unidades do tipo Residência Terapêutica.
const rtIcon = new L.Icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [22, 34],
  iconAnchor: [11, 34],
  popupAnchor: [0, -34],
  className: 'rt-marker',
})

// Ícone para unidades UPA (verde).
const upaIcon = new L.Icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [22, 34],
  iconAnchor: [11, 34],
  popupAnchor: [0, -34],
  className: 'upa-marker',
})

type UpaUnit = {
  id: string
  title: string
  address: string
  lat: number
  lng: number
}

const upaUnits: UpaUnit[] = [
  {
    id: 'upa-coronel-antonino',
    title: 'UPA Coronel Antonino',
    address: 'Rua Caarapó, 1329 - Coronel Antonino',
    lat: -20.4348,
    lng: -54.6162,
  },
  {
    id: 'upa-universitario',
    title: 'UPA Universitário',
    address: 'Av. Gunter Hans, 4574 - Universitário',
    lat: -20.5292,
    lng: -54.6207,
  },
  {
    id: 'upa-moreninhas',
    title: 'UPA Moreninhas',
    address: 'Rua Anacá, 935 - Moreninhas',
    lat: -20.5184,
    lng: -54.5636,
  },
  {
    id: 'upa-santa-monica',
    title: 'UPA Santa Mônica',
    address: 'Rua Cândido Lima de Barros, 739 - Santa Mônica',
    lat: -20.4421,
    lng: -54.5489,
  },
  {
    id: 'upa-leblon',
    title: 'UPA Leblon',
    address: 'Rua Arthur Jorge, 6110 - Jardim Leblon',
    lat: -20.4787,
    lng: -54.6577,
  },
]

// Centro inicial do mapa (Campo Grande/MS).
const CAMPO_GRANDE_CENTER: [number, number] = [-20.4697, -54.6201]

export default function CapsMap(): React.ReactElement {
  // Filtra apenas unidades que possuem latitude e longitude válidas.
  const unitsWithCoords = caps.filter((c) => c.lat !== undefined && c.lng !== undefined)

  return (
    <div className="caps-map-wrapper">
      <h3 className="caps-map-title">Mapa interativo da Rede de Saúde Mental em Campo Grande (MS)</h3>
      <p className="caps-map-subtitle">
        Use os marcadores para localizar unidades, comparar endereços e consultar contatos da rede.
      </p>
      <MapContainer
        center={CAMPO_GRANDE_CENTER}
        zoom={12}
        className="caps-map"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Um marcador para cada unidade georreferenciada */}
        {unitsWithCoords.map((unit) => (
          <Marker
            key={unit.id}
            position={[unit.lat as number, unit.lng as number]}
            // Escolhe o ícone de acordo com o tipo da unidade.
            icon={unit.unitType === 'CAPS' ? capsIcon : rtIcon}
          >
            {/* Popup com resumo da unidade ao clicar no marcador */}
            <Popup>
              <strong>{unit.title}</strong>
              <br />
              <span>{unit.address}</span>
              {unit.contact ? (
                <>
                  <br />
                  <span>{unit.contact}</span>
                </>
              ) : null}
              {unit.capacity ? (
                <>
                  <br />
                  <span>{unit.capacity}</span>
                </>
              ) : null}
              <br />
              <em style={{ fontSize: '0.8rem', color: '#0f8f79' }}>{unit.unitType}</em>
            </Popup>
          </Marker>
        ))}

        {/* Marcadores das UPAs de Campo Grande */}
        {upaUnits.map((upa) => (
          <Marker
            key={upa.id}
            position={[upa.lat, upa.lng]}
            icon={upaIcon}
          >
            <Popup>
              <strong>{upa.title}</strong>
              <br />
              <span>{upa.address}</span>
              <br />
              <em style={{ fontSize: '0.8rem', color: '#2d8a3f' }}>UPA</em>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <p className="caps-map-legend">
        <span className="legend-caps">● CAPS</span>
        <span className="legend-rt">● Residência Terapêutica</span>
        <span className="legend-upa">● UPA</span>
      </p>
    </div>
  )
}
