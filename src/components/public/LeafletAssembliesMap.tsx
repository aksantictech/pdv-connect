"use client";

import { useEffect } from "react";
import {
CircleMarker,
MapContainer,
Popup,
TileLayer,
useMap,
} from "react-leaflet";

import type { PublicAssemblyMapItem } from "@/types/assemblies-map";

type MapProps = {
assemblies: PublicAssemblyMapItem[];
};

function MapViewport({ assemblies }: MapProps) {
const map = useMap();

useEffect(() => {
const positions = assemblies.map(
(assembly) =>
[assembly.latitude, assembly.longitude] as [number, number]
);

if (positions.length === 1) {
  map.setView(positions[0], 14, { animate: false });
  return;
}

map.fitBounds(positions, {
  padding: [45, 45],
  maxZoom: 12,
  animate: false,
});

}, [assemblies, map]);

return null;
}

export default function LeafletAssembliesMap({
assemblies,
}: MapProps) {
return ( <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm">
<MapContainer
center={[-4.325, 15.322]}
zoom={11}
scrollWheelZoom={false}
className="h-[460px] w-full"
> <TileLayer
       attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
     />

    <MapViewport assemblies={assemblies} />

    {assemblies.map((assembly) => (
      <CircleMarker
        key={assembly.id}
        center={[assembly.latitude, assembly.longitude]}
        radius={11}
        pathOptions={{
          color: "#ffffff",
          weight: 3,
          fillColor: "#0a56a4",
          fillOpacity: 1,
        }}
      >
        <Popup>
          <div className="min-w-[210px] p-1">
            <p className="text-base font-black text-[#092e63]">
              {assembly.name}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              {assembly.location}
            </p>

            {assembly.pastorName && (
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Pasteur : {assembly.pastorName}
              </p>
            )}

            {assembly.mapsUrl && (
              <a
                href={assembly.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-lg bg-[#0a3d82] px-3 py-2 text-xs font-extrabold text-white"
              >
                Ouvrir l’itinéraire
              </a>
            )}
          </div>
        </Popup>
      </CircleMarker>
    ))}
  </MapContainer>
</div>

);
}
