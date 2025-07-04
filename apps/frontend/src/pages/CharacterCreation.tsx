import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CharacterCreation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("black");
  const [brushSize, setBrushSize] = useState(2);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [characterClass, setCharacterClass] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas background to a light color for better drawing visibility
    context.fillStyle = "#f3f4f6"; // bg-gray-100
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([imageData]);
    setHistoryIndex(0);
  }, []);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prevHistory) => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      return newHistory;
    });
    setHistoryIndex((prevIndex) => prevIndex + 1);
  }, [historyIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";

    let isDrawing = false;

    const startDrawing = (event: MouseEvent) => {
      isDrawing = true;
      const { offsetX, offsetY } = event;
      context.beginPath();
      context.moveTo(offsetX, offsetY);
    };

    const draw = (event: MouseEvent) => {
      if (!isDrawing) return;
      const { offsetX, offsetY } = event;
      context.lineTo(offsetX, offsetY);
      context.stroke();
    };

    const stopDrawing = () => {
      if (isDrawing) {
        context.closePath();
        isDrawing = false;
        saveState();
      }
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
    };
  }, [color, brushSize, saveState]);

  const restoreState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || historyIndex < 0) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const imageData = history[historyIndex];
    if (imageData) {
      context.putImageData(imageData, 0, 0);
    }
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    restoreState();
  }, [historyIndex, restoreState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        handleUndo();
      }
      if (event.ctrlKey && event.key === "y") {
        event.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f3f4f6"; // bg-gray-100
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "character-portrait.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleSaveCharacter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("name", name);
      formData.append("race", race);
      formData.append("class", characterClass);
      formData.append("portrait", blob, "character-portrait.png");

      try {
        setIsSaving(true);
        const response = await fetch("https://api.weeboo.xyz/api/characters", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Character saved:", result);
          setDescription(result.description);
          alert("Character saved successfully!");
        } else {
          console.error("Failed to save character");
          alert("Error: Failed to save character.");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("Error: Could not connect to the server.");
      } finally {
        setIsSaving(false);
      }
    }, "image/png");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Side: Character Form */}
      <div className="w-1/3 p-8 overflow-y-auto border-r border-gray-700">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Create Your Character
        </h1>
        <div className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-lg">
              Name
            </Label>
            <Input
              id="name"
              placeholder="E.g., Eldrin the Brave"
              className="mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="race" className="text-lg">
              Race
            </Label>
            <Select value={race} onValueChange={setRace}>
              <SelectTrigger id="race" className="mt-2">
                <SelectValue placeholder="Select a race" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="human">Human</SelectItem>
                <SelectItem value="elf">Elf</SelectItem>
                <SelectItem value="dwarf">Dwarf</SelectItem>
                <SelectItem value="halfling">Halfling</SelectItem>
                <SelectItem value="dragonborn">Dragonborn</SelectItem>
                <SelectItem value="gnome">Gnome</SelectItem>
                <SelectItem value="half-elf">Half-Elf</SelectItem>
                <SelectItem value="half-orc">Half-Orc</SelectItem>
                <SelectItem value="tiefling">Tiefling</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="class" className="text-lg">
              Class
            </Label>
            <Select value={characterClass} onValueChange={setCharacterClass}>
              <SelectTrigger id="class" className="mt-2">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="barbarian">Barbarian</SelectItem>
                <SelectItem value="bard">Bard</SelectItem>
                <SelectItem value="cleric">Cleric</SelectItem>
                <SelectItem value="druid">Druid</SelectItem>
                <SelectItem value="fighter">Fighter</SelectItem>
                <SelectItem value="monk">Monk</SelectItem>
                <SelectItem value="paladin">Paladin</SelectItem>
                <SelectItem value="ranger">Ranger</SelectItem>
                <SelectItem value="rogue">Rogue</SelectItem>
                <SelectItem value="sorcerer">Sorcerer</SelectItem>
                <SelectItem value="warlock">Warlock</SelectItem>
                <SelectItem value="wizard">Wizard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            className="w-full !mt-8 text-lg"
            onClick={handleSaveCharacter}
            disabled={isSaving}
          >
            {isSaving ? "Generating Description..." : "Save Character"}
          </Button>
        </div>
        {description && (
          <div className="mt-8 p-4 border border-gray-700 rounded-lg bg-gray-800">
            <h3 className="text-xl font-bold mb-2">AI-Generated Description</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{description}</p>
          </div>
        )}
      </div>

      {/* Right Side: Canvas */}
      <div className="w-2/3 p-8 flex flex-col items-center justify-center bg-gray-800">
        <h2 className="text-2xl font-bold mb-4">
          Sketch Your Character Portrait
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="color-picker">Color</Label>
            <Input
              type="color"
              id="color-picker"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="p-1 h-10 w-14"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="brush-size">Brush:</Label>
            <Input
              id="brush-size"
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-32"
            />
            <span className="w-8 text-center">{brushSize}</span>
          </div>
          <div className="flex items-center gap-2">
            <Label>Swatches:</Label>
            <div className="flex gap-1">
              <Button
                onClick={() => setColor("#000000")}
                className="w-8 h-8 p-0 bg-black hover:bg-black border-2 border-gray-400 rounded-full"
              />
              <Button
                onClick={() => setColor("#ff0000")}
                className="w-8 h-8 p-0 bg-red-500 hover:bg-red-500 border-2 border-gray-400 rounded-full"
              />
              <Button
                onClick={() => setColor("#00ff00")}
                className="w-8 h-8 p-0 bg-green-500 hover:bg-green-500 border-2 border-gray-400 rounded-full"
              />
              <Button
                onClick={() => setColor("#0000ff")}
                className="w-8 h-8 p-0 bg-blue-500 hover:bg-blue-500 border-2 border-gray-400 rounded-full"
              />
              <Button
                onClick={() => setColor("#ffffff")}
                className="w-8 h-8 p-0 bg-white hover:bg-white border-2 border-gray-400 rounded-full"
              />
            </div>
          </div>
          <Button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            variant="outline"
            className="text-black"
          >
            Undo
          </Button>
          <Button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            variant="outline"
            className="text-black"
          >
            Redo
          </Button>
          <Button
            onClick={clearCanvas}
            variant="outline"
            className="text-red-500"
          >
            Reset
          </Button>
          <Button
            onClick={exportImage}
            variant="outline"
            className="text-black"
          >
            Export
          </Button>
        </div>
        <div className="rounded-lg overflow-hidden border-4 border-gray-600">
          <canvas ref={canvasRef} width={500} height={600} />
        </div>
      </div>
    </div>
  );
}

export default CharacterCreation;
