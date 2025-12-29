import { useState } from "react";
import "./App.css";
import { Button } from "@/components/ui/button";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="mb-4 text-xl">Count: {count}</div>
      <Button
        onClick={() => setCount(count + 1)}
        className="bg-blue-500 hover:bg-blue text-black font-bold py-2 px-4 rounded"
      >
        OK
      </Button>
    </>
  );
}

export default App;
