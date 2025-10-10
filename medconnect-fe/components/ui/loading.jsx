import React from "react";
import '../../styles/loading.css';

const Loading = () => {
  const letters = ["L", "O", "A", "D", "I", "N", "G"];

  return (
    <div className="wrapper-grid">
      {letters.map((char, index) => (
        <div className="cube" key={index}>
          <div className="face face-front">{char}</div>
          <div className="face face-back" />
          <div className="face face-right" />
          <div className="face face-left" />
          <div className="face face-top" />
          <div className="face face-bottom" />
        </div>
      ))}
    </div>
  );
};

export default Loading;
