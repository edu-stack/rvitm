import React, { useState, useEffect } from "react";
import { getDocs, collection, doc, getDoc , setDoc} from "firebase/firestore";
import { db } from "../Backend/Firebase/firebase";
import StudentCard from "./StudentCard"; // Make sure to import your StudentCard component

export default function DataTestFirebase() {
  const [selectedEditSession, setSelectedEditSession] = useState(null);
  const [editAttendanceData, setEditAttendanceData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchEditAttendanceData = async () => {
      if (selectedEditSession) {
        const attendanceDocRef = doc(
          db,
          "database",
          "2021ISE0", 
          "attendance",
          "4SEM",
          "21BE45"

        );

        const attendanceDocSnapshot = await getDoc(attendanceDocRef);
        if (attendanceDocSnapshot.exists()) {
          const attendanceData = attendanceDocSnapshot.data();
          setEditAttendanceData(attendanceData.attendance);
        }
      }
    };

    fetchEditAttendanceData();
  }, [selectedEditSession]);

  const handleEditSessionChange = (event) => {
    setSelectedEditSession(event.target.value);
    setEditAttendanceData([]);
    setIsEditing(false);
  };

  const handleEditAttendance = (studentIndex) => {
    const updatedAttendanceData = [...editAttendanceData];
    updatedAttendanceData[studentIndex].Present = !updatedAttendanceData[studentIndex].Present;
    setEditAttendanceData(updatedAttendanceData);
  };

  const updateEditedAttendance = async () => {
    if (selectedEditSession && editAttendanceData.length > 0) {
      try {
        // Update the edited attendance data in Firestore
        const attendanceDocRef = doc(db, "database", selectedEditSession.path);
        await setDoc(attendanceDocRef, { attendance: editAttendanceData }, { merge: true });
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating edited attendance:", error);
      }
    }
  };

  return (
    <div className="edit-attendance-container">
      <h3>Edit Attendance</h3>
      <select onChange={handleEditSessionChange} value={selectedEditSession}>
        <option value="" disabled>
          Select Session to Edit
        </option>
        {/* Render options for sessions you want to edit */}
      </select>
      {editAttendanceData.length > 0 && (
        <div className="student-cards-container">
          {editAttendanceData.map((student, index) => (
            <StudentCard
              key={student.usn}
              img={student.Image}
              USN={student.usn}
              Name={student.name}
              Present={student.Present}
              toggle={() => handleEditAttendance(index)}
            />
          ))}
        </div>
      )}
      {editAttendanceData.length > 0 && (
        <button onClick={updateEditedAttendance}>Submit Edited Attendance</button>
      )}
    </div>
  );
}
