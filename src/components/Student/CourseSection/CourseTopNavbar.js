import { React, useState } from "react";

import { MdArrowBackIos } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { NavLink, useNavigate } from "react-router-dom";
import ThreeDotModal from "../MobileNav/Modal/ThreedotModal/ThreeDotModal";
import { AnimatePresence } from "framer-motion";

const CourseTopNavbar = ({ text, handleLogout }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const close = () => setModalOpen(false);
  const open = () => setModalOpen(true);

  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      <nav className="StudentTopNavbar" style={{boxShadow: 'none'}}>
        <div className="leftIcon" onClick={goBack}>
          <MdArrowBackIos />
        </div>
        <div className="centerText">
          <h5 style={{ fontSize: "17px" }}>{text}</h5>
        </div>
        <button
          style={{ border: "none", backgroundColor: "transparent" ,color: 'black'}}
          className="rightIcon"
          onClick={() => (modalOpen ? close() : open())}
        >
          <BsThreeDotsVertical />
        </button>
        
      </nav>
     <nav style={{
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around', // Use 'space-around' to evenly distribute space around elements
  width: '100%',
  boxShadow: '0 3px 5px rgba(0,0,0,.1)',
  paddingBottom: '10px',
  paddingTop: '10px'
}}>
    <div>
        <NavLink
            style={{ textDecoration: "none" }}
            to={"/student/dashboard/course"}
            className={
              window.location.pathname.endsWith("/course")
                ? "course-active-button"
                : "course-inactive-button"
            }>
              
            Class Schedule
      
            </NavLink>
        </div>
        <div>
        <NavLink
            style={{ textDecoration: "none" }}
            to={"/student/dashboard/course/material"}
            className={
              window.location.pathname.endsWith("/material")
                ? "course-active-button"
                : "course-inactive-button"
            }>
             
            Course Material
      
            </NavLink>
        </div>
        <div>
        <NavLink
            style={{ textDecoration: "none" }}
            to={"/student/dashboard/course/assignment"}
            className={
              window.location.pathname.endsWith("/course/assignment")
                ? "course-active-button"
                : "course-inactive-button"
            }>
               
                Assignments
               
            
            </NavLink> 
        </div>
      </nav>


      <AnimatePresence>
        {modalOpen && (
          <ThreeDotModal
            modalOpen={modalOpen}
            handleClose={() => close()}
            handleLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CourseTopNavbar;