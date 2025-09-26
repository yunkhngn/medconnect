import React from "react";
import HelloFetch from "./hello";

function App() {
  const user = localStorage.getItem("user");

  return (
    <div>
      <HelloFetch/>
    </div>
  );
}

export default App;
