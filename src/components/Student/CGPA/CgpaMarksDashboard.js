import React from "react";
import StudentTopNavbar from "../MobileNav/StudentTopNavbar";
import { motion } from "framer-motion";

const CgpaMarksDashboard = () => {
  return (
    <>
      <StudentTopNavbar text={"Marks"} />
      
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}

      >

      <img src='/search.png' style={{maxHeight: '100px',margin: '20px'}}/>

      <div><h6 style={{color: '#777'}}>No Results Announced Yet</h6></div>
      </div>
    </>
  );
};

export default CgpaMarksDashboard;
