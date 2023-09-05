import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./ScheduleTimeTable/ScheduleTimeTable.css";
import CourseTopNavabr from "./CourseTopNavbar";
// Firebase
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../Backend/Firebase/firebase";
import StudentTopNavbar from "../MobileNav/StudentTopNavbar";

const Course = () => {
  const [EVENTS, setEVENTS] = useState([]);

  // Function to Get Events from DB
  const getAllEvents = async () => {
    const querySnapshot = await getDocs(collection(db, "classes"));
    let e = [];
    querySnapshot.forEach((doc) => {
      e.push(doc.data());
    });
    setEVENTS(e);
    console.log(e);
  };

  useEffect(() => {
    getAllEvents();
  }, []);

  return (
    <>
      <CourseTopNavabr text={"Course Section"} />
      <div
        style={{ padding: "15px", paddingTop: "20px", paddingBottom: "60px" }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={"timeGridDay"}
          headerToolbar={{
            start: "today prev,next",

            end: "timeGridWeek,timeGridDay",
          }}
          nowIndicator={true}
          events={EVENTS}
          height={"100vh"}
          width={"100vw"}
        />
      </div>
    </>
  );
};

export default Course;
