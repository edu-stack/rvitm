import { useState, useEffect } from "react";
import StudentCard from "./StudentCard";
import { setDoc, doc, getDoc, Timestamp,collection,  collectionGroup, query, where, getDocs } from "firebase/firestore";
import { db } from "../Backend/Firebase/firebase";
import "./AttendanceSession.css";
import success from "../Images/success.png";
import { useUserAuth } from "../Backend/context/UserAuthContext";
import "bootstrap/dist/css/bootstrap.css";
import FacultyMobileNav from "./FacultyMobileNav";
import StudentTopNavbar from "../Student/MobileNav/StudentTopNavbar";
import MoveToTop from "./MoveToTop";
import { MdArrowBackIosNew } from "react-icons/md";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { InputLabel , FormControl, Button, TextField, Card, CardContent, Typography } from "@mui/material";
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ThemeOptions } from "@mui/material/styles";
import Box from '@mui/material/Box';
import SessionModal from './SessionModal'; 
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ListItem from '@mui/material/ListItem';
import { AiOutlineRightCircle } from 'react-icons/ai'
import { NavLink } from "react-router-dom";

import {  ListItemText, ListItemButton } from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";


export default function AttendanceSession() {

  const [subjectType, setSubjectType] = useState('theory');
  const [subjectSemester, setSubjectSemester] = useState(null);


  const [studentData, setStudentData] = useState([]);
  const [attendance, setAttendance] = useState([]); 
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [, setIsSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isLabSubject, setIsLabSubject] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const { user } = useUserAuth(); 

  const [classSubjectPairs, setClassSubjectPairs] = useState([]);
  // const [selectedClassName, setSelectedClassName] = useState(Object.keys(uniqueClassOptions)[0]);
  const [selectedCode, setSelectedCode] = useState('');
  
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [previousAttendanceSessions, setPreviousAttendanceSessions] = useState([]);
  const [selectedPreviousSession, setSelectedPreviousSession] = useState(null);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);


  const [selectedClassName, setSelectedClassName] = useState(null);

  const [sessionDetails, setSessionDetails] = useState({});

  const handleChangeTab = (event, newSelectedPair) => {
    setSelectedPair(newSelectedPair);
};



  
  const openSessionModal = () => {
    setIsSessionModalOpen(true);
  };

  const closeSessionModal = () => {
    setIsSessionModalOpen(false);
  };
  
  // const [studentDetails, setStudentDetails] = useState(null);

  // useEffect(() => {
  //   if (user && user.email) {
  //     const fetchData = async () => {
  //       const queryPath = 'students'; // Update this to the subcollection path
  //       const collectionGroupRef = collectionGroup(db, queryPath);
  //       const studentQuery = query(collectionGroupRef, where('email', '==', user.email));
  //       const studentSnapshot = await getDocs(studentQuery);

  //       await Promise.all(studentSnapshot.docs.map(async (studentDoc) => {
  //         const className = studentDoc.ref.parent.parent.id;
  //         const studentID = studentDoc.ref.id;

  //         const classDocRef = doc(db, 'database', className); // Update with your class collection name
  //         const classDocSnapshot = await getDoc(classDocRef);
  
  //         if (classDocSnapshot.exists()) {
  //           const classSemester = classDocSnapshot.data().currentSemester;
  //           // console.log(classSemester)
  //           const studentLabBatch = studentDoc.data().labBatch;
  //           const studentName = studentDoc.data().name;
  //           const studentUSN = studentDoc.data().usn;
  //           const studentEmail = studentDoc.data().email;
  //           const parentEmail = studentDoc.data().parentEmail;
  //           const parentPhone = studentDoc.data().parentPhone
  //           const studentDetails = {studentName,parentEmail,studentEmail,parentPhone, studentID, studentUSN, studentLabBatch, classSemester, className };
            
  //           setStudentDetails(studentDetails)
  //         }
  //       }));
  //     };

  //     fetchData();
  //   }
  // }, [user]);

  
  


  useEffect(() => {
    if (user && user.email) {
      const fetchData = async () => {
        const queryPath = 'subjects'; // Update this to the subcollection path
        const collectionGroupRef = collectionGroup(db, queryPath);
        const facultiesQuery = query(collectionGroupRef, where('faculties', 'array-contains', user.email));
  
        const facultiesSnapshot = await getDocs(facultiesQuery);
        const classSubjectPairsList = [];
  
        await Promise.all(facultiesSnapshot.docs.map(async (facultyDoc) => {
          const className = facultyDoc.ref.parent.parent.id;
          const classDocRef = doc(db, 'database', className); // Update with your class collection name
          const classDocSnapshot = await getDoc(classDocRef);
  
          if (classDocSnapshot.exists()) {
            const classData = classDocSnapshot.data();
            const classSemester = classDocSnapshot.data().currentSemester;
            // console.log(classSemester)
            const code = facultyDoc.data().code;
            const subjectName = facultyDoc.data().name;
            const subjectType = facultyDoc.data().theoryLab;
            const subSemester = facultyDoc.data().semester;
  
            classSubjectPairsList.push({ className, code, subjectName, subjectType, subSemester,classSemester, ...classData });
          }
        }));
  
        setClassSubjectPairs(classSubjectPairsList);
      };
  
      fetchData();
    }
  }, [user]);
  
  
  
  

  
  const [selectedPair, setSelectedPair] = useState(classSubjectPairs[0]);
  // console.log(classSubjectPairs[0])

  useEffect(() => {
    const fetchData = async () => {
      // Fetch your data and update classSubjectPairs here
      // ...

      if (classSubjectPairs.length > 0) {
        setSelectedPair(classSubjectPairs[0]); // Set the first pair as the default
      }
    };

    fetchData();
  }, [classSubjectPairs]);

  useEffect(() => {
    
    if (selectedPair) {
      const setDataOfTabs = () => {
        setSelectedClassName(selectedPair.className);
        setSelectedSubject(selectedPair.code);
      };
  
      setDataOfTabs();
    }
  }, [selectedPair]);
  

  const handleClassChange = (event) => {
    setSelectedClassName(event.target.value);
    setSelectedSubject(null);
    setIsLabSubject(false);
    setSelectedCode(null); // Reset selected code when class is changed
    setSelectedBatch(null);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  }


  
  useEffect(() => {
    const fetchPreviousAttendanceSessions = async () => {
      if (selectedSubject) {
        const previousSessionsCollectionRef = collection(
          db,
          "database",
          selectedClassName,
          "attendance",
          subjectSemester + "SEM",
          selectedSubject
        );
  
        const querySnapshot = await getDocs(previousSessionsCollectionRef);
        const sessionsData = [];
  
        querySnapshot.forEach((doc) => {
          sessionsData.push({
            id: doc.id,
            data: doc.data() // Store the entire data object here
          });
          // console.log(doc.data())
        });
  
        setPreviousAttendanceSessions(sessionsData);
      }
    };
  
    fetchPreviousAttendanceSessions();
  }, [selectedClassName, selectedSubject, subjectSemester]);


  const [selectedSessionData, setSelectedSessionData] = useState(null); 

  const handleCardClick =  (session) => {
    setSelectedPreviousSession(session);
    setIsSessionModalOpen(true)

  };

  const handleModalClose = () => {
    setIsSessionModalOpen(false);
  };


  useEffect(() => {
    const getSubjectData = async () => {
      let subjectCollectionRef = null;
    
      if (selectedClassName && selectedSubject) {
        subjectCollectionRef = doc(db, 'database', selectedClassName, 'subjects', selectedSubject);
        const querySnapshot = await getDoc(subjectCollectionRef);
        if(querySnapshot.data()){
          const subjectType = querySnapshot.data().theoryLab;
          const subjectSemester = querySnapshot.data().semester;
       
          setSubjectType(subjectType); // Set the subjectType state
          setSubjectSemester(subjectSemester);
        }

      }
    };
  
    getSubjectData();
  }, [selectedClassName, selectedSubject]);


  const clearState = () => {
    setIsConfirmationModalOpen(false);
    setAttendance(studentData);
    setProgress(0);
    setSelectedSubject(null);
    setSelectedSession(null);
    setPresentCount(0);
    setAbsentCount(0);
    setIsSubmitted(false);
    setIsLabSubject(false);
    setSelectedBatch(null);
    setSelectedClassName(null);
    setIsSessionModalOpen(false);
    

    // reset other state variables to their initial values or desired empty state
  };




  const updateFirestore = async () => {
    let presentCount = 0;
    let absentCount = 0;
    selectedBatch
      ? attendance
          .filter((student) => student.labBatch === selectedBatch)
          .forEach((student) => {
            if (student.Present) {
              presentCount++;
            } else {
              absentCount++;
            }
          })
      : attendance.forEach((student) => {
          if (student.Present) {
            presentCount++;
          } else {
            absentCount++;
          }
        });

    if (attendance.length > 0 && presentCount > 0) {
      try {
        setPresentCount(presentCount);
        setAbsentCount(absentCount);
        setIsSubmitted(true);

        const subjectCode = selectedSubject;
        const sessionTime = selectedSession;
        const Time = new Date().toISOString();

      

        const selectedDateTimestamp = selectedDate.$d.toISOString(); 

        
  

        const newAttendanceDoc = {
          date: selectedDateTimestamp,
          recordedDate: Timestamp.now(),
          attendance: selectedBatch
            ? attendance
                .filter((student) => student.labBatch === selectedBatch)
                .map((student) => ({
                  name: student.name,
                  usn: student.usn,
                  Present: student.Present,
                }))
            : attendance.map((student) => ({
                name: student.name,
                usn: student.usn,
                Present: student.Present,
              })),
          presentCount: presentCount,
          absentCount: absentCount,
          updatedBy: user.displayName,
          sessionTime: sessionTime,
          labBatch: selectedBatch ? selectedBatch : "theory",
        };
     

        await setDoc(
          doc(db, "database", selectedClassName ,"attendance", subjectSemester+'SEM', selectedSubject, selectedPreviousSession),
          newAttendanceDoc
        );
        console.log("Attendance Recorded Successfully");
        setProgress(2);
      } catch (error) {
        console.error("Error writing to Firestore", error);
      }
    }
  };

  function toggleAttendance(usn) {
    setAttendance((prevAttendance) => {
      return prevAttendance.map((student) => {
        if (student.usn === usn) {
          return { ...student, Present: !student.Present };
        } else {
          return student;
        }
      });
    });
  }

  const batchOptions = [
    { value: "1", label: "Batch 1" },
    { value: "2", label: "Batch 2" },
    { value: "3", label: "Batch 3" },
  ];

  const sessionOptions = 
     
      isLabSubject ? [
        { value: "9:00am - 11:00am", label: "9:00am - 11:00am " },
        { value: "2:00pm - 4:00pm", label: "2:00pm - 4:00pm " },
      ] : [
        { value: "9:00am - 10:00am", label: "9:00am - 10:00am " },
        { value: "10:00am - 11:00am", label: "10:00am -11:00am " },
        { value: "11:20am - 12:20pm", label: "11:20am - 12:20pm " },
        { value: "12:20pm - 1:20pm", label: "12:20pm - 1:20pm " },
        { value: "2:00pm - 3:00pm", label: "2:00pm - 3:00pm " },
        { value: "3:00pm - 4:00pm", label: "3:00pm - 4:00pm " },
       ]

  const handleSessionChange = (event) => {
    setSelectedSession(event.target.value);
  };

  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
  };

  const AllstudentCards = attendance.map((student) => (
    <StudentCard
      key={student.usn}
      img={student.Image}
      USN={student.usn}
      Name={student.name}
      Present={student.Present}
      toggle={() => toggleAttendance(student.usn)}
    />
  ));

  const Batch1studentCards = attendance.map((student) => (
    <>
      {student.labBatch === '1' && (
        <StudentCard
          key={student.usn}
          img={student.Image}
          USN={student.usn}
          Name={student.name}
          Present={student.Present}
          toggle={() => toggleAttendance(student.usn)}
        />
      )}
    </>
  ));

  const Batch2studentCards = attendance.map((student) => (
    <>
      {student.labBatch === '2' && (
        <StudentCard
        key={student.usn}
        img={student.Image}
        USN={student.usn}
        Name={student.name}
        Present={student.Present}
        toggle={() => toggleAttendance(student.usn)}
        />
      )}
    </>
  ));

  const Batch3studentCards = attendance.map((student) => (
    <>
      {student.labBatch === '3' && (
        <StudentCard
        key={student.usn}
        img={student.Image}
        USN={student.usn}
        Name={student.name}
        Present={student.Present}
        toggle={() => toggleAttendance(student.usn)}
        />
      )}
    </>
  ));



  function ConfirmationModal({ isOpen, onClose, absentStudents}) {
    const presentCount = absentStudents.filter(student => student.Present).length;
    const absentCount = absentStudents.length - presentCount;
  
    return (
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle style={{ fontWeight: 'bold'}}>Confirm Submission?</DialogTitle>
        <DialogContent>
        <p><span style={{fontWeight: 'bold', color: '#7950a5'}}>Class:</span> {selectedClassName}</p>
          <p><span style={{fontWeight: 'bold', color: '#7950a5'}}>Subject:</span> {selectedSubject}</p>
          <p><span style={{fontWeight: 'bold', color: '#7950a5'}}>Date:</span> {selectedDate.$d.toISOString()}</p>
          <p><span style={{fontWeight: 'bold', color: '#7950a5'}}>Class Time:</span> {selectedSession}</p>
          <p><span style={{fontWeight: 'bold', color: '#7950a5'}}>Students Present:</span> {presentCount}</p>
          <p><span style={{fontWeight: 'bold', color: '#7950a5'}}>Students Absent:</span> {absentCount}</p>
          <p><span style={{fontWeight: 'bold', color: '#7950a5'}}>Absent Students:</span></p>
          <List style={{ fontSize: '12px', padding: 0 }}>
          {absentStudents.map(student => (
            <ListItem key={student.usn} style={{ paddingTop: '3px', paddingBottom: '3px' }}>
             <span style={{fontWeight: 'bold'}}>{student.usn}:</span>  {student.name}
            </ListItem>
          ))}
        </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={updateFirestore} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  function submitAttendance() {
    setIsConfirmationModalOpen(true);
  }

  useEffect(() => {
    const fetchData = async () => {
      let studentsCollectionRef = null; // Define the variable before the if block
  
      if (selectedClassName) {
        studentsCollectionRef = collection(db, 'database', selectedClassName, 'students');
        const querySnapshot = await getDocs(studentsCollectionRef);
  
        const StudentData = [];
        querySnapshot.forEach((doc) => {
          const student = doc.data();
          const { name, usn, labBatch } = student;
          StudentData.push({ name, usn, labBatch });
        });
  
    
  
        setStudentData(StudentData);
        setAttendance(StudentData);
      }
    };
  
    fetchData();
  }, [selectedClassName]); 

 
  useEffect(() => {

    if (subjectType === 'lab') {
      setIsLabSubject(true);
    } else if (subjectType === 'theory') {
      setIsLabSubject(false);
    }
  }, [selectedSubject, subjectType]);

  
  const handleSubjectChange =  (event) => {
    setSelectedSubject(event.target.value);
    setSelectedBatch(null);

 
      
  };
  
  const stepOne = (
    
    <><div style={{marginTop: '0px', marginBottom: '60px', backgroundColor: 'rgba(215,215,215,.2)', minHeight: '100vh'}} >


      <div >
 
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' , paddingBottom: '20px'}}>
         <NavLink to='/faculty/dashboard/attendance/new' style={{ textDecoration: 'none', width: '90%' }}>
           <button className="submitAttendance" style={{ marginTop: '20px', textDecoration: 'none', maxWidth: '100%' }}>
             NEW ATTENDANCE SESSION
           </button>
         </NavLink>
         
         <NavLink to='/faculty/dashboard/attendance/history' style={{ textDecoration: 'none', width: '90%' }}>
           <button className="checkHistory" style={{ marginTop: '20px', textDecoration: 'none', maxWidth: '100%' }}>
             EXPORT HISTORY
           </button>
         </NavLink>
        </div>

       <div>
       <Typography style={{ color: 'grey', marginBottom: '8px', marginTop: '28px', fontWeight: '500', fontSize: '16px' , marginLeft: '10px'}}>
       YOUR CLASSES: 
      </Typography>
       </div>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
<Tabs
        value={selectedPair} // The entire pair object is used as the value
        onChange={handleChangeTab}
        variant="scrollable"
        scrollButtons='auto'
        textColor="secondary"
        indicatorColor="secondary"
      
        aria-label="Class and Subject Tabs"
      >
        {classSubjectPairs.map((pair, index) => (
          <Tab
            key={index}
            label={`${pair.classSemester}SEM ${pair.className} - ${pair.code}`}
            value={pair} // Using the entire pair object as the value
          />
        ))}
      </Tabs>
      </Box>
      
      {/* Rest of your form elements */}
      {selectedPair && (
  <>
    <List>
    <Card
      style={{
        width: '100%',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        marginBottom: '16px',
        
        borderRadius: '8px',
      }}
    >
      <Typography
        
        style={{ color: '#333', marginBottom: '8px', fontWeight: 'bold', fontSize: '15px' }}
      >
       {selectedPair.className} - {selectedPair.subjectName}
      </Typography>
      <Typography
        variant="body1"
        style={{ color: '#666', marginBottom: '2px' }}
      >
        Attendance from {' '}
        {previousAttendanceSessions.length > 0
          ? new Date(previousAttendanceSessions[0].id).toLocaleDateString(
              'en-US',
              {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }
            )
          : 'N/A'}
        {' to '}
        {previousAttendanceSessions.length > 0
          ? new Date(
              previousAttendanceSessions[previousAttendanceSessions.length - 1]
                .id
            ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : 'N/A'}{' '}

      </Typography>
      <Typography
        variant="body1"
        style={{ color: '#666' }}
      >
        Total Classes Held: {previousAttendanceSessions.length}
      </Typography>
      <Typography         variant="body1"
        style={{ color: '#666', marginBottom: '8px' }}>
          Average Attendance Percentage: {((previousAttendanceSessions.reduce((total, session) => total + session.data.presentCount, 0) / previousAttendanceSessions.reduce((total, session) => total + session.data.presentCount + session.data.absentCount, 0)) * 100).toFixed(2)}%
        </Typography>
    </Card>
    <Typography
        
        style={{ color: '#333', marginBottom: '8px', fontWeight: 'bold', fontSize: '15px' , marginLeft: '10px'}}
      >
       Previous classes: 
      </Typography>

      {previousAttendanceSessions.length === 0 ? (
        <ListItem>
          <Typography variant="subtitle1">No data available.</Typography>
        </ListItem>
      ) : (
        previousAttendanceSessions
          .slice()
          .reverse()
          .map((sessionObj, index) => (
            <ListItem key={index}>
              <Card
                style={{
                  width: '100%',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                  position: 'relative', // Added position for the serial number
                }}
                onClick={() => {
                  handleCardClick(sessionObj.id);
                  setSelectedSessionData(sessionObj);
                }}
              >
                {/* Serial Number */}
                <div
                  style={{
                    position: 'absolute',
                    top: '30%',
                    left: '5%',
                    color: 'white',
                    width: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    backgroundColor: '#9c27b0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {previousAttendanceSessions.length - index} {/* Serial number calculation */}
                </div>

                <CardContent style={{paddingBottom: '10px', padding: '10px'}}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      position: 'relative',
                      marginLeft: '13%'
                    }}
                  >
                    <div style={{ cursor: 'pointer', marginRight: '12px' }}>
                      <Typography sx={{ fontSize: 16 }}>
                        {new Date(sessionObj.id).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}{' '}
                        ({sessionObj.data.sessionTime})
                      </Typography>
                    </div>
                    <AiOutlineRightCircle
                      style={{
                        cursor: 'pointer',
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        fontSize: '20px',
                        color: '#9c27b0'
                      }}
                    />
                  </div>

                  <Typography
                    sx={{
                      fontSize: 14,
                      color: 'grey',
                      marginTop: '4px',
                      marginLeft: '13%'
                    }}
                  >
                    {sessionObj.data.presentCount} out of{' '}
                    {sessionObj.data.presentCount +
                      sessionObj.data.absentCount}{' '}
                    Present |{' '}
                    {sessionObj.data.labBatch
                      ? `Batch: ${sessionObj.data.labBatch}`
                      : 'Theory'}
                  </Typography>

                </CardContent>
              </Card>
            </ListItem>
          ))
      )}
    </List>
  </>
)}



      </div>
    </div>     
    
   {selectedSessionData && (
    <Dialog open={isSessionModalOpen} onClose={closeSessionModal}>
    <DialogTitle>{new Date(selectedSessionData.id).toLocaleDateString('en-GB')} {selectedSessionData.data.sessionTime}</DialogTitle>
    <DialogContent>
    
        
        <Typography>
          Class: {selectedPair.className}

          </Typography>
          <Typography>
          Subject: {selectedPair.subjectName} ({selectedSubject}) <br/>
          </Typography>
          <Typography>
          Students Present: {selectedSessionData.data.presentCount} out of {selectedSessionData.data.presentCount+selectedSessionData.data.absentCount}

        </Typography>


     

        <button
          className="submitAttendance"
          onClick={() => {
            setProgress(1);
          }}
          style={{marginTop: '20px'}}
        >
          EDIT ATTENDANCE
        </button>


        <button
              className="checkHistory"
              onClick={ () => handleModalClose()}
            >
              Close
            </button>
 
    </DialogContent>
  </Dialog>
   )}
    </>
  );

  useEffect(() => {
    if (selectedPreviousSession) {
      const fetchPreviousAttendanceData = async () => {
        const previousAttendanceRef = doc(
          db,
          "database",
          selectedClassName,
          "attendance",
          subjectSemester + "SEM",
          selectedSubject,
          selectedPreviousSession
        );
        
        const docSnapshot = await getDoc(previousAttendanceRef);
  
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const attendanceData = data.attendance.map((student) => ({
            ...student,
            Present: student.Present === true,
          }));
  
          setAttendance(attendanceData);
  
          // Pre-fill the students who were present in the previous session
          const presentStudents = attendanceData.filter((student) => student.Present);
          setAttendance((prevAttendance) =>
            prevAttendance.map((student) => ({
              ...student,
              Present: presentStudents.some((presentStudent) => presentStudent.usn === student.usn),
            }))
          );
        }
      };
  
      fetchPreviousAttendanceData();
    }
  }, [selectedClassName, selectedSubject, selectedPreviousSession]);

  const stepTwo = (
    <>
      <div
        className="mainContainer"
        style={{
          overflow: "hidden",
          marginBottom: "160px",
          marginTop: "40px",
        }}
      >
                <h3 style={{ paddingBottom: "10px", textAlign: "center" , paddingTop: '5px'}}>
          Edit Attendance
        </h3>
        <h6 style={{ paddingBottom: "15px" }}>
          [&nbsp;<span className="text-present"> P </span>&nbsp;-
          Present,&nbsp;&nbsp;<span className="text-absent"> A </span>&nbsp;-
          Absent&nbsp;]{" "}
        </h6>

           {selectedSessionData && (
  
    <Card style={{margin: '10px', backgroundColor: '#f1f1f1'}}>
      <CardContent>
        <Typography>
        Session: {new Date(selectedSessionData.id).toLocaleDateString('en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })} {selectedSessionData.data.sessionTime}

        </Typography>
        <Typography>
          Class: {selectedPair.className}

          </Typography>
          <Typography>
          Subject: {selectedPair.subjectName} ({selectedSubject}) <br/>
          </Typography>
          <Typography>
          Students Present: {selectedSessionData.data.presentCount} out of {selectedSessionData.data.presentCount+selectedSessionData.data.absentCount}

        </Typography>

     
      </CardContent>
    </Card>

   )}
        
  
        {selectedBatch === null && AllstudentCards}
        {selectedBatch === "1" && Batch1studentCards}
        {selectedBatch === "2" && Batch2studentCards}
        {selectedBatch === "3" && Batch3studentCards}

        <div className="buttonContainer">
          {progress > 0 && (
            <button
              className="move-to-top-button"
              onClick={() => {
                setProgress(progress - 1);
              }}
            >
              <MdArrowBackIosNew />
            </button>
          )}
          <button
            className="multibutton"
            onClick={() => {
              submitAttendance();
            }}
          >
            SUBMIT
          </button>
          <MoveToTop />
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        presentCount={presentCount}
        absentCount={absentCount}
        absentStudents={attendance.filter((student) => !student.Present)}
      />
    </>
  );

  const stepThree = (
    <div className="step1-body" style={{ marginTop: "0px",paddingTop: 0 }}>
      <div className="success-container" style={{ marginTop: "0px",paddingTop: 0 }}>
        {updateFirestore ? (
          <>
            <img src={success} alt="Success" style={{ maxHeight: "150px" }} />
            <h4
              style={{
                paddingBottom: "10px",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              Attendance Recorded Successfully
            </h4>
            <div className="success-info">
              <div>
                <span style={{ fontWeight: "bold", color: "blue" }}>
                  Subject:
                </span>{" "}
                <span>{selectedSubject}</span>
              </div>
              <div>
                <span style={{ fontWeight: "bold", color: "blue" }}>Time:</span>{" "}
                <span>{selectedSession}</span>
              </div>
              {selectedBatch && (
                <div>
                  <span style={{ fontWeight: "bold", color: "blue" }}>
                    Lab Batch:
                  </span>{" "}
                  <span>B{selectedBatch}</span>
                </div>
              )}
              {presentCount > 0 && (
                <div>
                  <span style={{ fontWeight: "bold", color: "blue" }}>
                    Students Present:
                  </span>{" "}
                  <span>{presentCount}</span>
                </div>
              )}
              {absentCount > 0 && (
                <div>
                  <span style={{ fontWeight: "bold", color: "blue" }}>
                    Students Absent:
                  </span>{" "}
                  <span>{absentCount}</span>
                </div>
              )}
            </div>

            <button
              className="submitAttendance"
              onClick={() => {
                clearState();
              }}
            >
              Return Home
            </button>
            <button
              className="checkHistory"
              href='/faculty/dashboard/attendance/history'
            >
              Check History
            </button>
          </>
        ) : (
          <>
            <h4 style={{ paddingBottom: "10px", textAlign: "center" }}>
              Failed to Record Attendance
            </h4>
            <p>
              There was an error while submitting the attendance. Please try
              again.
            </p>
            <button
              className="submitAttendance"
              onClick={() => {
                clearState();
              }}
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <StudentTopNavbar text={"Attendance Records"}  />
      <FacultyMobileNav />
      {progress === 0 && stepOne}

      {progress === 1 && stepTwo}

      {progress === 2 && stepThree}
    </>
  );
}
