import React, { useState } from "react";

function App() {
    const [message, setMessage] = useState("");

    const fetchHello = async () => {
        const response = await fetch("http://localhost:8080/hello");
        const text = await response.text();
        setMessage(text);
    };

    return (
        <div>
            <button onClick={fetchHello}>Get Hello</button>
            <p>{message}</p>
        </div>
    );
}

export default App;
