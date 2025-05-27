import MapBox from "./components/MapBox";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <NavBar />

      <MapBox />
    </div>
  );
}

export default App;
