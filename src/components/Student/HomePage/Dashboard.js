import React, { useState ,useEffect} from "react";
import { useUserAuth } from "../../Backend/context/UserAuthContext";
import { db } from "../../Backend/Firebase/firebase";
import { collection, getDocs, doc, getDoc,collectionGroup,query,where } from 'firebase/firestore';

import FacultyMobileNav from "../../Faculty/FacultyMobileNav";


import None from "./None.jpg"

import { RxHamburgerMenu } from "react-icons/rx";
import { Link, useNavigate } from "react-router-dom";
import ThreeDotModal from "../MobileNav/Modal/ThreedotModal/ThreeDotModal";
import { AnimatePresence } from "framer-motion";
import logo from '../MobileNav/EduStack.svg'

import colloegelogo from './RVlogo.png'

import { BsPersonCheck, BsClockHistory, BsFiletypePdf} from 'react-icons/bs';
import { MdOutlineAssignment } from 'react-icons/md'
import { GrScorecard } from 'react-icons/gr'



const Dashboard = () => {

  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const close = () => setModalOpen(false);
  const open = () => setModalOpen(true);

 


  const { user } = useUserAuth(); 
  const [usn, setUsn] = useState('');
  const [studentName, setStudentName] = useState('');
  const [sSEM, setSSEM] = useState('');
  const [classBranch, setClassBranch] = useState('');

  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    if (user && user.email) {
      const fetchData = async () => {
        const queryPath = 'students'; // Update this to the subcollection path
        const collectionGroupRef = collectionGroup(db, queryPath);
        const studentQuery = query(collectionGroupRef, where('email', '==', user.email));
        const studentSnapshot = await getDocs(studentQuery);

        await Promise.all(studentSnapshot.docs.map(async (studentDoc) => {
          const className = studentDoc.ref.parent.parent.id;
          const studentID = studentDoc.ref.id;

          const classDocRef = doc(db, 'database', className); // Update with your class collection name
          const classDocSnapshot = await getDoc(classDocRef);
  
          if (classDocSnapshot.exists()) {
            const classSemester = classDocSnapshot.data().currentSemester;
            const classBranch = classDocSnapshot.data().branch;
            // console.log(classSemester)
            const studentLabBatch = studentDoc.data().labBatch;
            const studentName = studentDoc.data().name;
            const studentUSN = studentDoc.data().usn;
            const studentEmail = studentDoc.data().email;
            const parentEmail = studentDoc.data().parentEmail;
            const parentPhone = studentDoc.data().parentPhone
            const studentDetails = {studentName,parentEmail,studentEmail,parentPhone, studentID, studentUSN, studentLabBatch, classSemester, className };
            
            setStudentDetails(studentDetails)
            setStudentName(studentDetails.studentName)
            setUsn(studentDetails.studentUSN)
            setSSEM(classSemester)
            setClassBranch(classBranch)
          }
        }));
      };

      fetchData();
    }
  }, [user]);
  console.log(studentDetails)

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
    <p style={{ color: '#0f0f0f', padding: '0', margin: 0, fontSize: '16px' }}>Welcome {studentName} </p>
    <p style={{ color: 'grey', padding: '0', margin: 0, fontSize: '12px' }}>{usn}, {sSEM} SEM {classBranch}</p>
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
        <Link to='/student/dashboard/attendance'>
        <div className="category-icon">
        <BsPersonCheck style={{fontSize: '30px', color: '#2f2f2f'}}/>
        </div>
        </Link>
        <p style={{padding: 0, margin: 0, fontSize :'12px', color: 'grey',paddingTop: '5px'}}>Attendance</p>
        
      </div>
      <div className="category-item">
      <Link to='/student/dashboard/course'>
        <div className="category-icon">
        <BsClockHistory style={{fontSize: '30px', color: '#2f2f2f'}}/>
        </div>
        </Link>
        <p style={{padding: 0, margin: 0, fontSize :'12px', color: 'grey',paddingTop: '5px'}}>Schedule</p>
      </div>
      <div className="category-item">
            <Link to='/student/dashboard/course/assignment'>
        <div className="category-icon">
        <MdOutlineAssignment style={{fontSize: '30px', color: '#2f2f2f'}}/>
        </div>
        </Link>  
        <p style={{padding: 0, margin: 0, fontSize :'12px', color: 'grey',paddingTop: '5px'}}>Assignment</p>
      </div>
      <div className="category-item">
      <Link to='/student/dashboard/marks'>
        <div className="category-icon">
        
        <GrScorecard style={{fontSize: '30px', color: '#2f2f2f'}}/>
        </div>
        </Link>
        <p style={{padding: 0, margin: 0, fontSize :'12px', color: 'grey',paddingTop: '5px'}}>Results</p>
      </div>
      <div className="category-item">
      <Link to='/student/dashboard/course/material'>
        <div className="category-icon">
        <BsFiletypePdf style={{fontSize: '30px', color: '#2f2f2f'}}/>
        </div>
        </Link>
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
 


    </>
  );
};

export default Dashboard;
