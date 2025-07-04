import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function MainMenu() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-8">D&D Game</h1>
      <Link to="/create-character">
        <Button>Create Your Character</Button>
      </Link>
    </div>
  );
}

export default MainMenu;
