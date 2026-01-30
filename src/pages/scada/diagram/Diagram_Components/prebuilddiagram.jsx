import React, { useState } from 'react';

const DiagramComponent = () => {
  // State management
  const [count, setCount] = useState(0);

  // Event handler
  const handleIncrement = () => {
    setCount(prevCount => prevCount + 1);
  };

  return (
    <div className="example-container">
      {/* Display count */}
      <h1>Count: {count}</h1>
      
      {/* Interactive button */}
      <button onClick={handleIncrement} className="increment-btn">
        Increment
      </button>

      {/* Conditional rendering */}
      {count > 5 && <p>Count is greater than 5!</p>}
    </div>
  );
};

export default DiagramComponent;