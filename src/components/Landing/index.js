import React from "react";
import "./index.css";
import ChoiceCard from "./CardChoice";
import StudentImg from "../../images/student.png";
import FacultyImg from "../../images/faculty.png";
import { Link } from "react-router-dom";
import * as ROUTES from "../../constants/routes";

function Choice() {
  return (
    <div className="Choice">
      <p className="ChoiceHeader">Are you a Faculty or an Attendee?</p>
      <div className="ChoiceCards">
        <div className="ChoiceCardOneDiv">
          <Link to={ROUTES.STU_SIGN_UP} style={{ textDecoration: "none" }}>
            <ChoiceCard
              image={StudentImg}
              choice="Student"
              alt="Student_Image"
            />
          </Link>
        </div>
        <div className="ChoiceCardSecondDiv">
          <Link to={ROUTES.FAC_SIGN_UP} style={{ textDecoration: "none" }}>
            <ChoiceCard
              image={FacultyImg}
              choice="Faculty"
              alt="Faculty_Image"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Choice;
