import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmotionInput from "./pages/EmotionInput";
import OrbVisualization from "./pages/OrbVisualization";
import OrbGallery from "./pages/OrbGallery";
import EmotionJournal from "./pages/EmotionJournal";
import OrbCombinations from "./components/OrbCombinations";
import CustomOrbColors from "./components/CustomOrbColors";
import LoadingTransition from "./components/LoadingTransition";
import { EmotionProvider } from "./context/EmotionContext";

function App() {
  return (
    <EmotionProvider>
      <div className="App">
        <BrowserRouter>
          <LoadingTransition />
          <Routes>
            <Route path="/" element={<EmotionInput />} />
            <Route path="/orb" element={<OrbVisualization />} />
            <Route path="/gallery" element={<OrbGallery />} />
            <Route path="/journal" element={<EmotionJournal />} />
            <Route path="/combinations" element={<OrbCombinations />} />
            <Route path="/customize" element={<CustomOrbColors />} />
          </Routes>
        </BrowserRouter>
      </div>
    </EmotionProvider>
  );
}

export default App;