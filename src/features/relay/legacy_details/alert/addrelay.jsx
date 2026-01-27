import React from 'react';
import { useParams } from 'react-router-dom';

const Addrelay = () => {
  const {no} = useParams();
  console.log("sdfjskjdfjksdgsd",no)
  return (
    <div>addrelay</div>
  );
}

export default Addrelay;
