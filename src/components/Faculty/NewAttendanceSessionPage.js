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
import { InputLabel , FormControl, Button, TextField} from "@mui/material";
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ThemeOptions } from "@mui/material/styles";

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';


export default function NewAttendanceSessionPage() {

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
  const [selectedClassName, setSelectedClassName] = useState(null);
  const [selectedCode, setSelectedCode] = useState('');
  
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [updatedfirestore, setUpdatedFirestore] = useState(false);

  const [ subjectElective, setSubjectElective] = useState('');
  const [ electiveStudentsUSN, setElectiveStudentUSN ] = useState([]);


  useEffect(() => {
    const getSubjectData = async () => {
      let subjectCollectionRef = null;
    
      if (selectedClassName && selectedSubject) {
        subjectCollectionRef = doc(db, 'database', selectedClassName, 'subjects', selectedSubject);
        const querySnapshot = await getDoc(subjectCollectionRef);
        if(querySnapshot.data()){
          const subjectType = querySnapshot.data().theoryLab;
          const subjectSemester = querySnapshot.data().semester;

          const subjectElective = querySnapshot.data().compulsoryElective;

          const electiveStudents = querySnapshot.data().electiveStudents;
       
          setSubjectType(subjectType); // Set the subjectType state
          setSubjectSemester(subjectSemester);
          setSubjectElective(subjectElective);
          setElectiveStudentUSN(electiveStudents);
        }

      }
    };
  
    getSubjectData();
  }, [selectedClassName, selectedSubject]);

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
            const classSemester = classDocSnapshot.data().currentSemester.toString();
            
            const code = facultyDoc.data().code;
            const subjectName = facultyDoc.data().name;
            const subjectType = facultyDoc.data().theoryLab; 
            const subSemester = facultyDoc.data().semester.toString();
            console.log(classSemester, subSemester)
  
            if (subSemester === classSemester) {
              console.log("yes")
              classSubjectPairsList.push({ className, code, subjectName, subjectType, subSemester, classSemester, ...classData });
            }
          }
        }));
        console.log(classSubjectPairsList);
  
        setClassSubjectPairs(classSubjectPairsList);
      };
  
      fetchData();
    }
  }, [user]);
  
  
  

  
  // Create a mapping of unique class names and their corresponding options
  const uniqueClassOptions = classSubjectPairs.reduce((acc, pair) => {
    if (!acc[pair.className]) {
      acc[pair.className] = [];
    }
    acc[pair.className].push(pair);
    return acc;
  }, {});

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
          attendance: subjectElective === "compulsory"
            ? selectedBatch ? attendance.filter((student) => student.labBatch === selectedBatch).map((student) => ({
                name: student.name,
                usn: student.usn,
                Present: student.Present,
              })) 
              :  attendance.map((student) => ({
                name: student.name,
                usn: student.usn,
                Present: student.Present,
              })) 
            : attendance.filter(student => electiveStudentsUSN.includes(student.usn))
                        .map((student) => ({
                          name: student.name,
                          usn: student.usn,
                          Present: student.Present,
                        })),
          presentCount: subjectElective === "compulsory" ? presentCount : electiveStudentsUSN.length,
          absentCount: absentCount,
          updatedBy: user.email,
          sessionTime: sessionTime,
          labBatch: selectedBatch ? selectedBatch : "theory",
        };
  
        await setDoc(
          doc(
            db,
            "database",
            selectedClassName,
            "attendance",
            subjectSemester + "SEM",
            selectedSubject,
            selectedDateTimestamp
          ),
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

  function setAllDefaultAttendance() {
    setAttendance((prevAttendance) => {
      return prevAttendance.map((student) => {
        return { ...student, Present: true };
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

  const AllstudentCards = attendance.filter(student => subjectElective === 'compulsory' || electiveStudentsUSN.includes(student.usn)).map((student) => (
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

      presentCount = subjectElective === "compulsory" ? presentCount : electiveStudentsUSN.length
  
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

  
  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
    setSelectedBatch(null);
      
  };
  
  const stepOne = (
    
    <div className="step1-body">
      <div style={{ zIndex: "-1", width: '90%', maxWidth: '400px' }} className="step1-container">
        <h4 style={{ paddingBottom: "5px", textAlign: "center", color: '#9c27b0' }}>
          Create New Attendance Session
        </h4>
        <p style={{ paddingBottom: "5%", textAlign: "center", color: 'grey', fontSize: '15px' }}>
          Please fill all the fields and Click on Next to Mark Attendance
        </p>


        <div>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <FormControl   style={{ width: '100%', maxWidth: '100%',marginTop: '0px', textOverflow: 'ellipsis' }}>
    <MobileDatePicker defaultValue={dayjs()} label="Select Date" format='ddd, MMM D' onChange={handleDateChange} value={selectedDate}/>
    </FormControl>
    </LocalizationProvider>
    </div>

        {Object.keys(uniqueClassOptions).length > 0 && (
  <div>
     



    <FormControl   style={{ width: '100%', maxWidth: '100%',marginTop: '15px', textOverflow: 'ellipsis' , border: 0}}>
    <InputLabel>Select Class</InputLabel>

    <Select
      value={selectedClassName}
      onChange={handleClassChange}
      displayEmpty
      variant="outlined"
      label="Select Class"
      style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis',  }}
      sx={{'&:focus': {
        borderColor: 'green', // Add your custom focus color
        
      },}}
    >
      {Object.keys(uniqueClassOptions).map((className, index) => (
        <MenuItem key={index} value={className}>
          {uniqueClassOptions[className][0].classSemester}SEM {className} 
        </MenuItem>
      ))}
    </Select>
    </FormControl>

    {selectedClassName && (
  <FormControl style={{ width: '100%', maxWidth: '100%', marginTop: '15px', textOverflow: 'ellipsis' }}>
  <InputLabel>Select Subject</InputLabel>
  <Select
    value={selectedSubject}
    onChange={(event) => {
      handleSubjectChange(event);
 
    }}
    displayEmpty
    label="Select Subject"
    variant="outlined"
    style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
  >
              {uniqueClassOptions[selectedClassName].map((pair, index) => (
                <MenuItem key={index} value={pair.code}>
                  {pair.subjectName} ({pair.code})
                </MenuItem>
    ))}
  </Select>
</FormControl>
    )}
  </div>
)}

<FormControl   style={{ width: '100%', maxWidth: '100%',marginTop: '15px', textOverflow: 'ellipsis' }}>
    <InputLabel>Class Session</InputLabel>
    <Select
      value={selectedSession}
      onChange={handleSessionChange}
      displayEmpty
      variant="outlined"
      label="Class Session"
      style={{ width: '100%', maxWidth: '100%', textOverflow: 'ellipsis' }}
    >
    {sessionOptions.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
    </Select>
    </FormControl>



        {isLabSubject && (

          <FormControl style={{ width: '100%', maxWidth: '100%', marginTop: '15px', textOverflow: 'ellipsis' }}>
            <InputLabel>Lab Batch</InputLabel>
            <Select
              value={selectedBatch}
              onChange={handleBatchChange}
              displayEmpty
              variant="outlined"
              label="Lab Batch"
              style={{ width: '100%', maxWidth: '100%', textOverflow: 'ellipsis' }}
            >
              {batchOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <button
          className="submitAttendance"
          style={{ marginTop: "30px" }}
          disabled={
            !selectedSubject ||
            !selectedSession ||
            (isLabSubject && !selectedBatch)
          }
          onClick={() => {
            setProgress(1);
            setAllDefaultAttendance();
          }}
        >
          NEXT
        </button>
      </div>
    </div>
  );

  const stepTwo = (
    <>
      <div
        className="mainContainer"
        style={{
          overflow: "hidden",
          marginBottom: "160px",
          marginTop: "100px",
        }}
      >
        <h3 style={{ paddingBottom: "10px", textAlign: "center" }}>
          Mark Attendance
        </h3>
        <h6
          style={{
            paddingBottom: "10px",
            marginLeft: "20px",
            marginRight: "20px",
            textAlign: "center",
            fontWeight: "400",
            color: "#777",
          }}
        >
          By Default All the Students are Marked as Present, Please tap on the
          cards to make changes, confirm the Absentees and submit the form.{" "}
        </h6>
        <h6 style={{ paddingBottom: "15px" }}>
          [&nbsp;<span className="text-present"> P </span>&nbsp;-
          Present,&nbsp;&nbsp;<span className="text-absent"> A </span>&nbsp;-
          Absent&nbsp;]{" "}
        </h6>
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
    <div className="step1-body" style={{ marginTop: "0px" }}>
      <div className="success-container">
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
      <StudentTopNavbar text={"Attendance"} />
      <FacultyMobileNav />
      {progress === 0 && stepOne}

      {progress === 1 && stepTwo}

      {progress === 2 && stepThree}
    </>
  )
  };