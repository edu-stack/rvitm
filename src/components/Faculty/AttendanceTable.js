import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  collectionGroup,
  query,
  where,
} from "firebase/firestore";
import { db } from "../Backend/Firebase/firebase";
import "./AttendanceTable.css";
import FacultyMobileNav from "./FacultyMobileNav";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useUserAuth } from "../Backend/context/UserAuthContext";
import MenuItem from "@mui/material/MenuItem";
import {
  InputLabel,
  FormControl,
  Button,
  TextField,
} from "@mui/material";
import { Select } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import * as React from 'react';
import dayjs from 'dayjs';

export function AttendanceTable() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState("alltime");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterOption, setFilterOption] = useState("alltime");
  const [subjects, setSubjects] = useState({});
  const [isLabSubject, setIsLabSubject] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const { user } = useUserAuth();
  const [selectedClassName, setSelectedClassName] = useState(null);
  const [classSubjectPairs, setClassSubjectPairs] = useState([]);
  const [subjectType, setSubjectType] = useState('theory');
  const [subjectSemester, setSubjectSemester] = useState(null);



  const batchOptions = [
    { value: "1", label: "Batch 1" },
    { value: "2", label: "Batch 2" },
    { value: "3", label: "Batch 3" },
  ];

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

  const getUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSubjects(userData.subject);
        console.log(userData.subject);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user && user.email) {
      const fetchData = async () => {
        const queryPath = "subjects"; // Update this to the subcollection path
        const collectionGroupRef = collectionGroup(db, queryPath);
        const facultiesQuery = query(
          collectionGroupRef,
          where("faculties", "array-contains", user.email)
        );

        const facultiesSnapshot = await getDocs(facultiesQuery);
        const classSubjectPairsList = [];

        facultiesSnapshot.forEach((facultyDoc) => {
          const className = facultyDoc.ref.parent.parent.id;
          const code = facultyDoc.data().code;
          const subjectName = facultyDoc.data().name;
          const subjectType = facultyDoc.data().theoryLab;
          const subSemester = facultyDoc.data().semester;

          classSubjectPairsList.push({
            className,
            code,
            subjectName,
            subjectType,
          });
        });

        setClassSubjectPairs(classSubjectPairsList);
      };

      fetchData();
    }
  }, [user]);

  const uniqueClassOptions = classSubjectPairs.reduce((acc, pair) => {
    if (!acc[pair.className]) {
      acc[pair.className] = [];
    }
    acc[pair.className].push(pair);
    return acc;
  }, {});

  useEffect(() => {
    if (user) {
      getUserData(user.uid);
    }
  }, [user]);

  const handleDateFilterChange = (event) => {
    setSelectedDateFilter(event.target.value);
  };

  useEffect(() => {
    async function fetchAttendanceData() {
      try {
        if (selectedSubject) {
          let startDate;
          let endDate;
  
          // Remove time component from dates
          const today = new Date();
          today.setHours(0, 0, 0, 0);
  
          if (selectedDateFilter === "today") {
            startDate = new Date(today);
            endDate = new Date(today);
          } else if (selectedDateFilter === "last7days") {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            endDate = new Date(today);
          } else if (selectedDateFilter === "last28days") {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 28);
            endDate = new Date(today);
          } else if (selectedDateFilter === "custom") {
            if (customStartDate && customEndDate) {
              startDate = new Date(customStartDate);
              endDate = new Date(customEndDate);
            } else {
              // Handle case when custom dates are not selected
              return;
            }
          } else {
            // Handle default case
            startDate = null;
            endDate = null;
          }
  
          const attendanceRef = collection(
            db,
            "database",
            selectedClassName,
            "attendance",
            "4SEM",
            selectedSubject
          );
  
          const snapshot = await getDocs(attendanceRef);
  
          const filteredDocs = snapshot.docs.filter((doc) => {
            const docDate = new Date(doc.data().date);
            docDate.setHours(0, 0, 0, 0); // Remove time component from doc date
            return (
              (!startDate || docDate >= startDate) &&
              (!endDate || docDate <= endDate)
            );
          });
  
          const attendanceDocs = selectedBatch
            ? filteredDocs
                .map((doc) => doc.data())
                .filter((data) => data.labBatch === selectedBatch)
            : filteredDocs.map((doc) => doc.data());
  
          setAttendanceData(attendanceDocs);
        }
      } catch (error) {
        console.error("Error fetching attendance data from Firestore", error);
      }
    }
  
    fetchAttendanceData();
  }, [
    selectedSubject,
    selectedDateFilter,
    customStartDate,
    customEndDate,
    selectedBatch,
    selectedClassName,
  ]);
  
  

  const getClassCount = () => {
    return attendanceData.length;
  };

  const getAttendanceCount = (usn) => {
    return attendanceData.reduce((total, data) => {
      const student = data.attendance.find((student) => student.usn === usn);
      return total + (student && student.Present ? 1 : 0);
    }, 0);
  };

  const getAttendancePercentage = (attendanceCount, classCount) => {
    return classCount > 0
      ? ((attendanceCount / classCount) * 100).toFixed(2)
      : "N/A";
  };

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
 
  };

  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
  };

  useEffect(() => {

    if (subjectType === 'lab') {
      setIsLabSubject(true);
    } else if (subjectType === 'theory') {
      setIsLabSubject(false);
    }
  }, [selectedSubject, subjectType]);

  const handleClassChange = (event) => {
    setSelectedClassName(event.target.value);
  };

  const mergedAttendanceData = attendanceData.reduce((mergedData, data) => {
    data.attendance.forEach((student) => {
      const existingStudentIndex = mergedData.findIndex(
        (mergedStudent) => mergedStudent.usn === student.usn
      );

      if (existingStudentIndex !== -1) {
        mergedData[existingStudentIndex].attendance[data.date] = student.Present;
      } else {
        const newStudent = {
          usn: student.usn,
          name: student.name,
          attendance: { [data.date]: student.Present },
        };
        mergedData.push(newStudent);
      }
    });

    return mergedData;
  }, []);

  const exportTableAsCSV = () => {
    const csvRows = [];
  
    // Prepare header row
    const headerRow = [
      "Name",
      "USN",
      "Classes Held",
      "Classes Attended",
      "Attendance Percentage",
    ];
    attendanceData.forEach((data) => {
      headerRow.push(
        `${data.date.substring(0, 10)} ${data.sessionTime}`
      );
    });
    csvRows.push(headerRow.join(","));
  
    // Prepare data rows
    mergedAttendanceData.forEach((student, index) => {
      const dataRow = [
        student.name,
        student.usn,
        getClassCount(),
        getAttendanceCount(student.usn),
        getAttendancePercentage(
          getAttendanceCount(student.usn),
          getClassCount()
        ),
      ];
      attendanceData.forEach((data) => {
        const attendanceRecord = student.attendance[data.date];
        dataRow.push(attendanceRecord !== undefined ? (attendanceRecord ? "P" : "A") : "-");
      });
      csvRows.push(dataRow.join(","));
    });
  
    // Create CSV content
    const csvContent = csvRows.join("\n");
  
    // Convert to Blob
    const blob = new Blob([csvContent], { type: "text/csv" });
  
    // Create object URL and initiate download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance_data.csv";
    link.click();
  
    // Clean up temporary URL
    URL.revokeObjectURL(url);
  };
  
  

  return (
    <>
      <div className="t-container">
        <FacultyMobileNav />

        <div style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>

        <FormControl
          style={{
            width: "100%",
            maxWidth: "100%",
            marginTop: "20px",
            textOverflow: "ellipsis",
            border: 0,
          }}
        >
          <InputLabel>Select Class</InputLabel>

          <Select
            value={selectedClassName}
            onChange={handleClassChange}
            displayEmpty
            variant="outlined"
            label="Select Class"
            style={{
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {Object.keys(uniqueClassOptions).map((className, index) => (
              <MenuItem key={index} value={className}>
                {className}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedClassName && (
          <FormControl
            style={{
              width: "100%",
              maxWidth: "100%",
              marginTop: "20px",
              textOverflow: "ellipsis",
            }}
          >
            <InputLabel>Select Subject</InputLabel>
            <Select
              value={selectedSubject}
              onChange={(event) => {
                handleSubjectChange(event);
              }}
              displayEmpty
              label="Select Subject"
              variant="outlined"
              style={{
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
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

       <div style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
        {isLabSubject && (
  <FormControl
    style={{
      width: "100%",
      maxWidth: "100%",
      marginTop: "20px",
      textOverflow: "ellipsis",
    }}
  >
    <InputLabel >Select Batch:</InputLabel>
    <Select
      displayEmpty
      value={selectedBatch}
      onChange={handleBatchChange}
      label="Select Batch"
      variant="outlined"
      style={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {batchOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
)}

        <FormControl style={{ width: "100%", maxWidth: "100%", marginTop: "20px", textOverflow: "ellipsis", border: 0 }}>
          <InputLabel>Select Date Filter</InputLabel>
          <Select
            value={selectedDateFilter}
            onChange={handleDateFilterChange}
            displayEmpty
            variant="outlined"
            label="Select Date Filter"
            style={{ width: "100%", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            <MenuItem value="alltime">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="last7days">Last 7 Days</MenuItem>
            <MenuItem value="last28days">Last 28 Days</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
        </FormControl>
        </div>

       
        {selectedDateFilter === "custom" && (
          // MUI Mobile Date Picker for custom dates
          <div style={{ width: "100%",display: 'flex',gap: '20px',minWidth: '100%', maxWidth: "100%", marginTop: "20px" }}>


          <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDatePicker
          
          label="Start Date"
          value={customStartDate}
          onChange={(date) => setCustomStartDate(date)}
          renderInput={(params) => <TextField {...params} />}
        />
        _
          <MobileDatePicker
          label="End Date"
          value={customEndDate}
          onChange={(date) => setCustomEndDate(date)}
          renderInput={(params) => <TextField {...params} />}
        />
          </LocalizationProvider>
          </div>
        )}

 {selectedSubject && (<Button variant="contained" style={{marginTop: '10px'}} color="secondary"  onClick={exportTableAsCSV}>
  Export CSV
</Button>)}

<div className="custom-table">
  {attendanceData.length > 0 ? (
    <div className="table-container">
     <table className="responsive-table">
        <thead className="sticky-header">
          <tr className="table-row">
            <th className="table-header" style={{ backgroundColor: "#2f2f2f" }}>
              Name
            </th>
            <th className="table-header" style={{ backgroundColor: "#2f2f2f" }}>
              USN
            </th>
            <th className="table-header" style={{ backgroundColor: "#2f2f2f" }}>
              Classes Held
            </th>
            <th className="table-header" style={{ backgroundColor: "#2f2f2f" }}>
              Classes Attended
            </th>
            <th className="table-header" style={{ backgroundColor: "#2f2f2f" }}>
              Attendance Percentage
            </th>
            {attendanceData.map((data) => (
              <th
                className="table-header"
                key={data.date}
                style={{ backgroundColor: "#2f2f2f" }}
              >
                <div>{data.date.substring(0, 10)}</div>
                <div>{data.sessionTime}</div>
              </th>
            ))}
          </tr>
        </thead>
  <tbody>
        {mergedAttendanceData.map((student, index) => (
          <tr
            className={`table-row ${index % 2 === 0 ? "odd-row" : "even-row"}`}
            key={student.usn}
          >
            <td className="table-data">{student.name}</td>
            <td className="table-data">{student.usn}</td>
            <td className="table-data">{getClassCount()}</td>
            <td className="table-data">{getAttendanceCount(student.usn)}</td>
            <td className="table-data">
              {getAttendancePercentage(
                getAttendanceCount(student.usn),
                getClassCount()
              )}
              %
            </td>
            {attendanceData.map((data) => (
              <td
                key={`${data.date}-${student.usn}`}
                className="table-data"
              >
                {student.attendance[data.date] !== undefined
                  ? student.attendance[data.date]
                    ? "P"
                    : "A"
                  : "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      </table>
    </div>

          ) : (
            <div className="empty-table">
              <p className="empty-table__message">No data found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
