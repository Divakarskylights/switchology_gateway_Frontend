import React from "react";
import PrintableBills from "./PrintableComponent";

const ElectricityBill = ({ printRef, data }) => {

  return (
    <>
      <PrintableBills ref={printRef} data={data} />
    </>
  );
};

export default ElectricityBill;

