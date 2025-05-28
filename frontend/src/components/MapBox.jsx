import React, { useEffect, useRef, useState } from "react";
import { Map, MapStyle, config } from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import axios from "axios";

config.apiKey = "rAlinUdEto5rsHqbmz2r";
const orsKey = "5b3ce3597851110001cf6248700ff0f5dafb4899802385a794920dcb";

function MapBox() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const belfast = {
    lng: -5.9301,
    lat: 54.5973,
  };
  const zoom = 13;

  useEffect(() => {
    if (!map.current) {
      console.log("creating map....");
      map.current = new Map({
        container: mapContainer.current,
        style: MapStyle.STREETS,
        center: [belfast.lng, belfast.lat],
        zoom: zoom,
      });
    }
  }, [belfast.lng, belfast.lat, zoom]);

  return (
    <div className="flex items-center justify-center px-20 min-h-screen">
      <div className="card w-full max-w-4xl mx-auto rounded-lg shadow-2xl bg-green-200 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-10 py-10">
          {/* Map container */}
          <div
            ref={mapContainer}
            className="w-full h-[500px] rounded-box border border-black"
          ></div>

          {/*Inputs and labels*/}
          <div className="flex flex-col justify-center gap-4">
            <div>
              <label className="label font-semibold">Origin Location</label>
              <input
                type="text"
                placeholder="Enter origin"
                className="input input-bordered w-full mt-1"
              />
            </div>

            <div>
              <label className="label font-semibold">Destination</label>
              <input
                type="text"
                placeholder="Enter destination"
                className="input input-bordered w-full mt-1"
              />
            </div>

            <button className="btn btn-is-primary shadow-xl mt-6">
              Show Route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapBox;
