import React from 'react';
import { useDrag } from 'react-dnd';

const NodeType = {
  NODE: 'node'
};

const createNodeTemplate = (text, isDragging, img) => ({
  width: '180px',
  height: '50px',
  margin: '8px',
  alignItems:'center',
  backgroundColor: '#fff0d4',
  cursor: isDragging ? 'grabbing' : 'grab', // 🟢 Hand cursor
  borderRadius: '10px',
  display: 'flex',
  justifyContent: 'space-between',
  paddingLeft: '10px',
  fontFamily: 'Roboto, sans-serif',
  fontSize: '10pt',
  fontWeight: 'bold',
  color: 'black',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  opacity: isDragging ? 0.5 : 1, // 🟢 Reduce opacity while dragging
});

const DraggableNode = ({ nodeGlobalData }) => {
  const [{ isDragging }, drag] = useDrag({
    type: NodeType.NODE,
    item: nodeGlobalData, // Passing the whole node object
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  console.log("nodeGlobalData", nodeGlobalData)

  return (
    <div ref={drag} style={createNodeTemplate(nodeGlobalData.text, isDragging, nodeGlobalData.img)}>
      <span>{nodeGlobalData.text}</span>
      {nodeGlobalData.img && (
        <img 
          src={nodeGlobalData.img} 
          alt={nodeGlobalData.text}
          style={{ 
            width: '40px', 
            height: '40px', 
            marginRight: '10px',
            objectFit: 'contain'
          }} 
        />
      )}
    </div>
  );
};

export default DraggableNode;
