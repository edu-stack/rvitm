import React, { useState ,useEffect} from "react";
import { useUserAuth } from "../Backend/context/UserAuthContext";
import { db } from "../Backend/Firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import FacultySidebar from "./FacultySidebar";
import FacultyMobileNav from "./FacultyMobileNav";
import StudentTopNavbar from "../Student/MobileNav/StudentTopNavbar";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import None from '../Images/None.jpg'

import { RxHamburgerMenu } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import ThreeDotModal from "../Student/MobileNav/Modal/ThreedotModal/ThreeDotModal";
import { AnimatePresence } from "framer-motion";
import logo from '../Student/MobileNav/EduStack.svg'
import './FacultyDashboard.css'
import colloegelogo from './RVlogo.png'

import { BsPersonCheck, BsClockHistory, BsFiletypePdf} from 'react-icons/bs';
import { MdOutlineAssignment } from 'react-icons/md'
import { GrScorecard } from 'react-icons/gr'



const FacultyDashboard = () => {
  const { user } = useUserAuth();
  const [usn, setUsn] = useState("");
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const close = () => setModalOpen(false);
  const open = () => setModalOpen(true);

  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const getUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsn(userData.usn);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (user) {
    getUserData(user.uid);
  }

  useEffect(() => {
    if (user) {
      getUserData(user.uid);
    }
  }, [user]);


  

  return (
    <>
<nav className="FacultyHomepage">
<div style={{display: 'flex', justifyContent: 'space-between'}}>
<div className="leftIcon" >
<img src={logo} style={{height: '25px'}}/>
</div>

<button
  style={{ border: "none", backgroundColor: "transparent" ,color: 'black'}}
  className="rightIcon"
  onClick={() => (modalOpen ? close() : open())}
>
  <RxHamburgerMenu />
</button>
</div>
</nav>
<div style={{position: 'absolute', backgroundColor: '#f4f4f4', minHeight: '100%', borderRadius: '15px',top: '70px', boxShadow: '0 -3px 5px rgba(0,0,0,.1)'}} >
<div style={{display: 'flex', alignItems: 'center',justifyContent: 'center'}}>
<div style={{ marginTop: '10px',maxWidth: '10vw', marginBottom: '0px', borderRadius: '8px', backgroundColor: 'white', minHeight: '3px', backgroundColor: '#9e9e9e',minWidth: '15vw' }} >    
</div>

</div>

<div style={{ display: 'flex', marginTop: '20px', marginLeft: '10px', marginRight: '10px', marginBottom: '0px', borderRadius: '8px', backgroundColor: 'white', maxHeight: '80px'}} >    
<img src={None} style={{ width: '80px', borderRadius: '50%', padding: '12px' }} />
  
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: '10px' }}>
    <p style={{ color: '#0f0f0f', padding: '0', margin: 0, fontSize: '16px' }}>Welcome Deepak D J</p>
    <p style={{ color: 'grey', padding: '0', margin: 0, fontSize: '12px' }}>Assistant Professor, Dept of ISE</p>
  </div>
  
</div>

<div style={{ display: 'flex', marginTop: '10px', marginLeft: '10px', marginRight: '10px', marginBottom: '20px',borderRadius: '8px',backgroundColor: 'white', maxHeight: '80px'}} >    

  <img src={colloegelogo} style={{width: '80px',height: '80px', borderRadius: '50%', padding: '12px'}}/>

  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: '0px' }}>
    <p style={{ color: '#0f0f0f', padding: '0', margin: 0, fontSize: '16px', lineHeight: '18px' }}>RV Institute of Technology & Management</p>
    <p style={{ color: 'grey', padding: '0',paddingTop: '4px', margin: 0, fontSize: '12px' }}>Bengaluru, Karnataka</p>
  </div>
</div> 

<h6 style={{marginTop: '15px', marginLeft: '20px', marginBottom: '10px', color: '#2f2f2f'}}>Categories</h6>
<div className="categories-container">
      <div className="category-item">
        <div className="category-icon">
        <BsPersonCheck style={{fontSize: '30px'}}/>
        </div>
        <p style={{padding: 0, margin: 0, fontSize :'12px', color: 'grey',paddingTop: '5px'}}>Attendance</p>
      </div>
      <div className="category-item">
        <div className="category-icon">
        <BsClockHistory style={{fontSize: '30px'}}/>
        </div>
        <p style={{padding: 0, margin: 0, fontSize :'12px', color: 'grey',paddingTop: '5px'}}>History</p>
      </div>
            <div className="category-item">
        <div className="category-icon">
        <MdOutlineAssignment style={{fontSize: '30px'}}/>
        </div>
        <p style={{padding: 0, margin: 0, fontSize :'12px', color: 'grey',paddingTop: '5px'}}>Assignment</p>
      </div>
      <div className="category-item">
        <div className="category-icon">
        <GrScorecard style={{fontSize: '30px'}}/>
        </div>
        <p style={{padding: 0, margin: 0, fontSize :'12px', color: 'grey',paddingTop: '5px'}}>Results</p>
      </div>
      <div className="category-item">
        <div className="category-icon">
        <BsFiletypePdf style={{fontSize: '30px'}}/>
        </div>
        <p style={{padding: 0, margin: 0, fontSize :'12px', color: 'grey',paddingTop: '5px'}}>Materials</p>
      </div>

    </div>
    </div>
<AnimatePresence>
{modalOpen && (
  <ThreeDotModal
    modalOpen={modalOpen}
    handleClose={() => close()}
  
  />
)}
</AnimatePresence>
 
      <FacultyMobileNav/>
      {/* <div style={{position: 'absolute', backgroundColor: 'rgba(215,215,215,.2)', minHeight: '100vh'}} >


      <div >
        <div className="dashboard-box">
          {user && user.photoURL && (
            <img
              src={user.photoURL}
              alt="Profile"
              className="profile-image"
            />
          )}
          <h2 className="welcome-text">
            Welcome {user && user.displayName}
          </h2>

          <div className="dashboard-section">
  <h3 className="section-title">Mark Attendance</h3>
  <p className="section-description">
    Record attendance for your subjects.
  </p>
</div>
<div className="dashboard-section">
  <h3 className="section-title">Attendance History</h3>
  <p className="section-description">
    View and export attendance data from previous sessions.
  </p>
</div>
<div className="dashboard-section">
  <h3 className="section-title">New Feature Suggestions</h3>
  <p className="section-description">
    Provide feedback and suggestions for new features, as well as report bugs.
  </p>
</div>
        </div>
        <div className="notices-container">
          <h3 className="notices-title">Notices</h3>
          <div className="notices-content">
            <p>No notices at the moment.</p>
          </div>
        </div>
      </div> */}
      {/* </div> */}
    </>
  );
};

export default FacultyDashboard;
