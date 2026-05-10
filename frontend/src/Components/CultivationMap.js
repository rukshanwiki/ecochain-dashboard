// src/Components/CultivationMap.js
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CultivationMap = ({ locations: propLocations }) => {
  const [locations, setLocations] = useState(() => {
    if (propLocations && propLocations.length) return propLocations;
    return JSON.parse(localStorage.getItem("declarations") || "[]");
  });

  // if parent passes locations prop, update when prop changes
  useEffect(() => {
    if (propLocations) setLocations(propLocations);
  }, [propLocations]);

  // listen for declarations updates from the ProductDeclaration component
  useEffect(() => {
    const handler = () => {
      if (!propLocations) {
        setLocations(JSON.parse(localStorage.getItem("declarations") || "[]"));
      }
    };
    window.addEventListener("declarationsUpdated", handler);
    return () => window.removeEventListener("declarationsUpdated", handler);
  }, [propLocations]);

  // Filter only items that have valid location object
  const itemsWithLocation = (locations || []).filter(
    (it) => it && it.location && typeof it.location.lat === "number" && typeof it.location.lng === "number"
  );

  return (
    <div style={{ height: "550px", width: "90%", borderRadius: "12px", overflow: "hidden", margin: "0 auto" }}>
      <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
        {itemsWithLocation.map((item, idx) => (
          <Marker key={item.id || idx} position={[item.location.lat, item.location.lng]} icon={redIcon}>
            <Popup>
              <div style={{ lineHeight: 1.4 }}>
                <strong>📍 {item.product}</strong><br />
                <b>Units:</b> {item.units}<br />
                <b>Cultivation:</b> {item.cultivationDate}<br />
                <b>Harvesting:</b> {item.harvestingDate}<br />
                <b>Location:</b> {item.locationText}<br />
                <b>Comments:</b> {item.comments || "—"}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CultivationMap;

