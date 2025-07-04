import { Routes, Route } from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import CharacterCreation from "./pages/CharacterCreation";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/create-character" element={<CharacterCreation />} />
    </Routes>
  );
}

export default App;
