import React from "react";
import ReactDOM from "react-dom/client";

const App = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>✅ University Club Frontend is Running!</h1>
      <p>Open the console to see logs too.</p>
    </div>
  );
};

// Render to the div with id="app"
ReactDOM.createRoot(document.getElementById("app")).render(<App />);

// Optional console message
console.log("✅ University Club Frontend is running!");