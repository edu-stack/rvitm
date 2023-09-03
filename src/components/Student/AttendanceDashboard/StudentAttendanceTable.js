

import React, { useContext, useEffect, useRef, useState } from 'react';

import { db } from '../../Backend/Firebase/firebase';
import 'react-datepicker/dist/react-datepicker.css';
import './StudentAttendanceTable.css';
import { useUserAuth } from '../../Backend/context/UserAuthContext'; 
import { collection, getDocs, doc, getDoc,collectionGroup,query,where } from 'firebase/firestore';
import { AttendanceContext } from './AttendanceContext';
import DonutChart from './DonutChart';
import { Chart } from 'chart.js/auto';
import 'bootstrap/dist/css/bootstrap.css'
import StudentTopNavbar from '../MobileNav/StudentTopNavbar';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Card, CardContent , Typography } from '@mui/material';
import { AiOutlineRightCircle } from 'react-icons/ai';

import AppBar from '@mui/material/AppBar';

import { Tab as MyTab, Tabs as MyTabs, TabList as MyTabList, TabPanel as MyTabPanel } from 'react-tabs';






function StudentAttendanceTable() {

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const { attendanceData, setAttendanceData } = useContext(AttendanceContext);
  const [subjectOptions, setSubjectOptions] = useState([{}]);
  const { user } = useUserAuth(); 
  const [usn, setUsn] = useState('');

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
            // console.log(classSemester)
            const studentLabBatch = studentDoc.data().labBatch;
            const studentName = studentDoc.data().name;
            const studentUSN = studentDoc.data().usn;
            const studentEmail = studentDoc.data().email;
            const parentEmail = studentDoc.data().parentEmail;
            const parentPhone = studentDoc.data().parentPhone
            const studentDetails = {studentName,parentEmail,studentEmail,parentPhone, studentID, studentUSN, studentLabBatch, classSemester, className };
            
            setStudentDetails(studentDetails)
            setUsn(studentDetails.studentUSN)
          }
        }));
      };

      fetchData();
    }
  }, [user]);
  console.log(studentDetails)


  useEffect(() => {
    const fetchSubjectOptions = async () => {
      const classDocRef = doc(db, 'database', '2021ISE0'); // Update with the appropriate document path
      const classDocSnapshot = await getDoc(classDocRef);

      if (classDocSnapshot.exists()) {
        const subjectsCollectionRef = collection(classDocRef, 'subjects'); // Assuming 'subjects' is the subcollection name
        const subjectDocsSnapshot = await getDocs(subjectsCollectionRef);
        
        const fetchedSubjectOptions = subjectDocsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return { value: data.code, label: data.name ,subjectType: data.theoryLab};
        });

        setSubjectOptions(fetchedSubjectOptions);
       
        console.log(fetchedSubjectOptions.value)
      }
    };

    fetchSubjectOptions();
  }, []);

  console.log(subjectOptions)
  

  useEffect(() => {
    async function fetchAttendanceData() {
      try {
        const subjectValues = subjectOptions.map((option) => option.value);
        const attendanceRefs = subjectValues.map((subject) =>
          collection(db, 'database','2021ISE0', 'attendance', '4SEM', subject)
        );
        const attendanceSnapshots = await Promise.all(attendanceRefs.map((ref) => getDocs(ref)));
        const attendanceDocs = attendanceSnapshots.map((snapshot) => snapshot.docs.map((doc) => doc.data()));
        setAttendanceData(attendanceDocs);
      } catch (error) {
        console.error('Error fetching attendance data from Firestore', error);
      }
    }

    fetchAttendanceData();
  }, [setAttendanceData, subjectOptions]);
  console.log(attendanceData)

  const getAttendanceCount = (subjectIndex) => {
    return attendanceData[subjectIndex]?.reduce((total, data) => {
      const student = data.attendance?.find((student) => student.usn === usn);
      return total + (student && student.Present ? 1 : 0);
    }, 0); 
  };

  const getClassCount = (subjectIndex) => {
    let count = 0;
    attendanceData[subjectIndex]?.forEach((data) => {
      const student = data.attendance?.find((student) => student.usn === usn);
      if (student) {
        count++;
      }
    });
    return count;
  };

  const getAttendancePercentage = (subjectIndex) => {
    const attendanceCount = getAttendanceCount(subjectIndex);
    const classCount = getClassCount(subjectIndex);
    return classCount > 0 ? ((attendanceCount / classCount) * 100).toFixed(2) : '0';
  };

  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef && chartRef.current) {
      const attendancePercentages = attendanceData.map((data, index) => getAttendancePercentage(index));
  
      const backgroundColors = attendancePercentages.map((percentage) => {
        if (percentage > 75) {
          return 'rgba(127,106,152,1)'; // Green color for attendance above 75
        } else if (percentage > 50) {
          return 'rgba(127,106,152,1)'; // Yellow color for attendance between 50 and 75
        } else {
          return 'rgba(127,106,152,1)'; // Red color for attendance below 50
        }
      });
  
      const ctx = chartRef.current.getContext('2d');
  
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy(); // Destroy the previous chart instance
      }
  
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas
  
      chartRef.current.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: subjectOptions.slice(0,9).map((option) => option.value),
          datasets: [
            {
              label: 'Attendance Percentage',
              data: attendancePercentages,
              backgroundColor: backgroundColors,
              borderColor: 'rgba(75, 192, 192, 0.1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 10,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceData, subjectOptions]);
  

  const totalClassesHeld = attendanceData.reduce((total, data, index) => total + getClassCount(index), 0);

  const totalClassesAttended = attendanceData.reduce((total, data, index) => total + getAttendanceCount(index), 0);

  const totalAttendancePercentage = Math.round((totalClassesAttended / totalClassesHeld) * 100);

  const theorySubjects = subjectOptions.filter(subject => subject.subjectType === 'theory');
const labSubjects = subjectOptions.filter(subject => subject.subjectType === 'lab');

function getClassmatesPresentCount(classAttendanceData, studentUSN) {
  if (!classAttendanceData) {
    return 0;
  }

  // Filter out the student's attendance record for this class
  const studentAttendance = classAttendanceData.find(
    (classData) => classData.attendance.some((student) => student.usn === studentUSN)
  );

  if (!studentAttendance) {
    return 0;
  }

  // Count the number of students marked as present in this class
  const classmatesPresent = studentAttendance.attendance.filter(
    (student) => student.usn !== studentUSN && student.Present
  );

  return classmatesPresent.length;
}


  return (
    <>
    <StudentTopNavbar text={'Attendance Dashboard'}/>
    <div className='table-containerrr'>
      <div className="table-containerr">

        <div className="attendance-card">
          <DonutChart totalAttendancePercentage={totalAttendancePercentage} />
          <div style={{alignItems: 'center'}}>
          <h5 style={{marginLeft: '30px', fontSize: '18px', marginBottom: '10px'}}>Attendance Summary</h5>
          <p style={{marginLeft: '30px', marginBottom: '0px', fontSize: '14px'}}>Classes Held: {totalClassesHeld} <br/>  Classes Attended: {totalClassesAttended} <br/>  Classes Absent: {totalClassesHeld-totalClassesAttended} </p>
          </div>

        </div>
        <canvas ref={chartRef} style={{ marginTop: '20px', width: '450px' }}></canvas>
        
        <div >

        <MyTabs style={{marginTop: '20px'}}>
  <MyTabList>
    <MyTab style={{width: '50%',textAlign: 'center'}}>Theory</MyTab>
    <MyTab style={{width: '50%',textAlign: 'center'}}>Lab</MyTab>
  </MyTabList>

  <MyTabPanel>
          
  
  <table className="responsive-table" style={{ }}>
    <thead className="sticky-header">
      <tr>
        <th className="table-header" style={{fontSize: '12px', backgroundColor: "#2f2f2f" }}>Subject Code</th>
        <th className="table-header" style={{fontSize: '12px', backgroundColor: "#2f2f2f" }}>Classes Held</th>
        <th className="table-header" style={{fontSize: '12px', backgroundColor: "#2f2f2f" }}>Classes Attended</th>
        <th className="table-header" style={{fontSize: '12px', backgroundColor: "#2f2f2f" }}>Attendance Percentage</th>
      </tr>
    </thead>
    <tbody>
      {theorySubjects.map((subject, index) => (
        <tr className={`table-row ${index % 2 === 0 ? "odd-row" : "even-row"}`} key={index}>
          <td className="table-data" style={{ fontSize: '12px' }}>{subject.label+' ('+subject.value+')'}</td>
          <td className="table-data">{getClassCount(index)}</td>
          <td className="table-data">{getAttendanceCount(index)}</td>
          <td className="table-data">{Math.round(getAttendancePercentage(index))}%</td>
        </tr>
      ))}
    </tbody>
  </table>

  </MyTabPanel>
        <MyTabPanel>

 
  <table className="responsive-table" style={{ }}>
    <thead className="sticky-header">
      <tr>
        <th className="table-header" style={{fontSize: '12px', backgroundColor: "#2f2f2f" }}>Subject Code</th>
        <th className="table-header" style={{fontSize: '12px', backgroundColor: "#2f2f2f" }}>Classes Held</th>
        <th className="table-header" style={{fontSize: '12px', backgroundColor: "#2f2f2f" }}>Classes Attended</th>
        <th className="table-header" style={{fontSize: '12px', backgroundColor: "#2f2f2f" }}>Attendance Percentage</th>
      </tr>
    </thead>
    <tbody>
      {labSubjects.map((subject, index) => (
        <tr className={`table-row ${index % 2 === 0 ? "odd-row" : "even-row"}`} key={index}>
          <td className="table-data" style={{ fontSize: '12px' }}>{subject.label}</td>
          <td className="table-data">{getClassCount(index)}</td>
          <td className="table-data">{getAttendanceCount(index)}</td>
          <td className="table-data">{Math.round(getAttendancePercentage(index))}%</td>
        </tr>
      ))}
    </tbody>
  </table>
  </MyTabPanel> 
        </MyTabs> 
          </div>

          <h6 style={{marginTop: '20px',marginBottom: '10px',marginLeft: '10px',color: 'grey'}}>Subject Wise Details:</h6>
         
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="full width tabs example"
        >
          {subjectOptions.map((subject, index) => (
            <Tab  key={index} label={subject.value} />
          ))}
        </Tabs>
    

      {subjectOptions.map((subject, index) => (
        <div key={index} hidden={value !== index}>
    <Card
      style={{
        width: '100%',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        marginTop: '12px',
        paddingBottom: 0,
        backgroundColor: '#f1f1f1',
      }}
    >
      <Typography style={{ marginTop: '20px', marginLeft: '10px' , fontWeight: 'bold'}}>
        SUBJECT: {subject.label} ({subject.value})
      </Typography>
      <Typography style={{ marginTop: '10px', marginLeft: '10px' }}>
        You have attended {getAttendanceCount(index)} out of {getClassCount(index)} Classes.
      </Typography>
      <Typography style={{ marginLeft: '10px' }}>
        Attendance Percentage: {Math.round(getAttendancePercentage(index))}%
      </Typography>

      {getAttendancePercentage(index) > 75 ? (
        <Typography style={{ marginLeft: '10px', color: 'green',marginBottom: '20px' }}>
          ✅ Your Attendance Requirement is Satisfied
        </Typography>
      ) : (
        <Typography style={{ marginLeft: '10px',  color: 'red', marginBottom: '20px' }}>
          🛑 You need to attend {Math.ceil(((0.75 * getClassCount(index)) - getAttendanceCount(index)) / 0.25)} more classes to reach 75%.
        </Typography>
      )}
    </Card>

          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {/* Iterate over attendance data for the selected subject */}
            {attendanceData[index]?.slice().reverse().map((classData, classIndex) => (
              <Card
                key={classIndex}
                style={{
                  width: '100%',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  marginTop: '12px',
                  paddingBottom: 0,
                  backgroundColor: '#f1f1f1',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '30%',
                    left: '5%',
                    color: 'white',
                    width: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    backgroundColor: classData.attendance.find((student) => student.usn === usn)?.Present
                      ? 'green' // Set the background color to green if present
                      : 'red', // Set the background color to red if absent
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {classData.attendance.find((student) => student.usn === usn)?.Present ? 'P' : 'A'}
                </div>
                <CardContent style={{padding: '10px'}}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      position: 'relative',
                      marginLeft: '13%',
                    }}
                  >
                    <div style={{ cursor: 'pointer', marginRight: '12px' }}>
                      <Typography sx={{ fontSize: 16 }}>
                        {new Date(classData.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        ({classData.sessionTime})
                      </Typography>
                    </div>
                    <AiOutlineRightCircle
                      style={{
                        cursor: 'pointer',
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        fontSize: '20px',
                        color: '#9c27b0',
                      }}
                    />
                  </div>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: 'grey',
                      marginTop: '4px',
                      marginLeft: '13%',
                    }}
                  >
                    {classData.presentCount + ' out of your ' + (classData.presentCount + classData.absentCount) + ' classmates were present'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

        </div>
      </div>
    </>
  );
}

export default StudentAttendanceTable;
