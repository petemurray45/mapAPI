import React, { useEffect, useRef, useState } from "react";
import { Map, MapStyle, config } from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { LngLatBounds } from "@maptiler/sdk";
import axios from "axios";

const apiKey = import.meta.env.VITE_MAP_TILER_API_KEY;
const orsKey = "5b3ce3597851110001cf6248700ff0f5dafb4899802385a794920dcb";

function MapBox() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [originFocused, setOriginFocused] = useState(false);
  const belfast = {
    lng: -5.9301,
    lat: 54.5973,
  };
  const zoom = 13;
  config.apiKey = apiKey;

  // creates the map on the webpage
  useEffect(() => {
    if (!map.current) {
      console.log("creating map....");
      map.current = new Map({
        container: mapContainer.current,
        style: MapStyle.STREETS,
        center: [belfast.lng, belfast.lat],
        zoom: zoom,
      });
    } // coords for begining location on the displayed map
  }, [belfast.lng, belfast.lat, zoom]);

  // function that fetches suggestions for dropdown menu

  const fetchSuggestions = async (text, type = "origin") => {
    if (!text) {
      type === "origin"
        ? setOriginSuggestions([])
        : setDestinationSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(
          text
        )}.json?key=${apiKey}`
      );

      const suggestions = res.data.features.map((f) => ({
        name: f.place_name,
        coords: f.geometry.coordinates,
      }));
      console.log("Fetched suggestions", suggestions);

      if (type === origin) setOriginSuggestions(suggestions);
      else setDestinationSuggestions(suggestions);
    } catch (err) {
      console.log("Something went wrong in fetchSuggestions function", err);
    }
  };

  // function that displays route to destination
  const handleRoute = async () => {
    try {
      // gets start and end coords from geocode function
      const originCoords = await geoCode(origin);
      const destinationCoords = await geoCode(destination);

      console.log("Origin input:", origin);
      console.log("Origin coordinates:", originCoords);
      console.log("Destination input:", destination);
      console.log("Destination coordinates:", destinationCoords);

      if (!originCoords || !destinationCoords) {
        alert("Could not find one or both locations");
        return;
      }

      const res = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          coordinates: [originCoords, destinationCoords],
        },
        {
          headers: {
            Authorization: orsKey,
            "Content-Type": "application/json",
          },
        }
      );

      const geojson = res.data;

      if (map.current.getSource("route")) {
        map.current.getSource("route").setData(geojson);
      } else {
        map.current.addSource("route", {
          type: "geojson",
          data: geojson,
        });
        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#3b82f6",
            "line-width": 4,
          },
        });
        // gets route coordinates
        const coords = geojson.features[0].geometry.coordinates;
        //creates bounds object starting with first point
        const bounds = new LngLatBounds(coords[0], coords[0]);
        // extends bounds to include every coordinate in the route
        coords.forEach((coord) => bounds.extend(coord));

        // fits map to match current bounds
        map.current.fitBounds(bounds, {
          padding: 40,
          maxZoom: 15,
          duration: 1000,
        });
      }
    } catch (err) {
      console.log("Something went wrong in handle route function", err);
    }
  };

  // function that gets coordinates for selected origin and destination
  const geoCode = async (text) => {
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      text
    )}.json?key=${apiKey}`;

    try {
      const res = await axios.get(url);
      const coords = res.data.features?.[0]?.geometry?.coordinates;

      if (!coords) throw new Error("No results found for: ", text);
      return coords; // [long, lat]
    } catch (err) {
      console.log("Something went wrong in geoCode function ", err);
      return null;
    }
  };

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
              <select className="select select-bordered w-full max-w">
                <option disabled selected>
                  Transport Method
                </option>
                <option>Walking</option>
                <option>Driving</option>
                <option>Cycling</option>
              </select>
            </div>
            <div>
              <label className="label font-semibold">Origin Location</label>
              <div className="relative m-h-[200px]">
                <input
                  type="text"
                  placeholder="Enter origin"
                  className="input input-bordered w-full mt-1"
                  onFocus={() => setOriginFocused(true)}
                  onBlur={() => setTimeout(() => setOriginFocused(false), 150)} // small delay so click works
                  onChange={(e) => {
                    setOrigin(e.target.value);
                    fetchSuggestions(e.target.value, "origin");
                  }}
                  value={origin}
                />
                {true && (
                  <ul className="absolute dropdown-content z-10 menu bg-white p-2 shadow-md rounded-box w-full mt-1 max-h-48 overflow-y-auto">
                    {originSuggestions.map((s, index) => (
                      <li key={index}>
                        <button
                          onClick={() => {
                            setOrigin(s.name);
                            setOriginSuggestions([]);
                          }}
                          className="text-left w-full"
                        >
                          {s.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <label className="label font-semibold">Destination</label>
              <input
                type="text"
                placeholder="Enter destination"
                className="input input-bordered w-full mt-1"
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <button
              className="btn btn-is-primary shadow-xl mt-6"
              onClick={handleRoute}
            >
              Show Route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapBox;
