import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";

import AuthUserContext from "../../../Session/context";
import Home from "../../../Home";
import TermCheckbox from "../TermsCheckbox";

import { withFirebase } from "../../../Configuration";
import CollegeJSON from "../../../../CollegeList.json";

import * as ROUTES from "../../../../constants/routes";
import * as ROLE from "../../../../constants/role";

import Banner from "../../FormBanner";
import StuSignUpBanner from "../../../../images/stud_banner.png";
import "../../index.css";

const condition = (authUser) => !!authUser;

const SignUpStudentPageCondition = () => (
  <AuthUserContext.Consumer>
    {(authUser) => (condition(authUser) ? <Home /> : <SignUpStuPage />)}
  </AuthUserContext.Consumer>
);

const SignUpStuPage = () => (
  <div style={{ backgroundColor: `#FCFCFC` }}>
    <Banner
      banner={StuSignUpBanner}
      alt="FcaulLoginBanner"
      banner_header="Register as an Attendee"
      banner_subheader="Please Register Your Student Profile By Filling Below Blanks"
    />
    <SignUpStuForm />
    <SignInLink />
  </div>
);

const INITIAL_STATE = {
  fname: "",
  lname: "",
  college: "",
  enrolno: "",
  department: "",
  semester: "",
  division: "",
  email: "",
  shift: "",
  passwordOne: "",
  passwordTwo: "",
  error: null,
  role: ROLE.STUDENT,

  college_list: CollegeJSON,
  course_list: [],
};

const ERROR_CODE_ACCOUNT_EXISTS = "auth/email-already-in-use";
const ERROR_CODE_INVALID_EMAIL = "auth/invalid-email";

const ERROR_MSG_ACCOUNT_EXISTS =
  "An account with this E-Mail address already exists. Try to login with another account instead.";
const ERROR_MSG_INVALID_EMAIL = "Invalid Email ID";

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    // console.log(event.target.value);
  };

  onChangeCollege = (event) => {
    this.setState({ [event.target.name]: event.target.value });

    this.setState({
      course_list:
        event.target.value && event.target.value !== "--SELECT--"
          ? this.state.college_list.find(
              (college) => college.name === event.target.value
            ).courses
          : [],
    });
  };

  onSubmit = (event) => {
    const {
      fname,
      lname,
      college,
      enrolno,
      department,
      semester,
      division,
      email,
      shift,
      passwordOne,
      passwordTwo,
      role,
    } = this.state;

    // let role = "";

    // if (isStudent) {
    //   //Usually we don't need isStudent condition as it is always gonna be true bu i'm keeping it fot better understanding purposes.
    //   role = ROLE.STUDENT;
    // }

    this.setState({ error: null });

    if (
      fname === "" &&
      lname === "" &&
      department === "" &&
      semester === "" &&
      college === "" &&
      division === "" &&
      shift === ""
    ) {
      this.setState({ error: "Please Fill Everything Up Properly" });
    } else if (fname === "" || lname === "") {
      this.setState({ error: "Please Enter Your First & Last Name Properly" });
    } else if (email === "") {
      this.setState({ error: "Please Enter Your Email Address" });
    } else if (college === "") {
      this.setState({ error: "Please Select Your College" });
    } else if (division === "") {
      this.setState({ error: "Please Select Your Division" });
    } else if (enrolno === "") {
      this.setState({ error: "Please Enter Your GTU Enrolment No." });
    } else if (department === "") {
      this.setState({ error: "Please Enter Your Department" });
    } else if (shift === "") {
      this.setState({ error: "Please Enter Your College Shift" });
    } else if (semester === "") {
      this.setState({ error: "Please Enter Your Semester" });
    } else if (passwordOne !== passwordTwo) {
      this.setState({ error: "Passwords are not matching" });
    } else if (passwordOne === "") {
      this.setState({ error: "Please Enter Password" });
    } else {
      this.props.firebase
        .doCreateUserWithEmailAndPassword(email, passwordOne)
        .then((authUser) => {
          // Create a user in your Firebase realtime database
          return this.props.firebase.user(authUser.user.uid).set({
            name: fname + " " + lname,
            enrolment_no: enrolno,
            college,
            department,
            semester,
            division,
            email,
            shift,
            password: passwordOne,
            role: role,
          });
        })
        .then(() => {
          let stuTitle = `${fname} ${lname} - ${enrolno}`;
          // Create a user in your Firebase realtime database
          return this.props.firebase.student(stuTitle, college).set({
            name: fname + " " + lname,
            enrolment_no: enrolno,
            college,
            department,
            semester,
            division,
            email,
            shift,
            password: passwordOne,
            role: role,
          });
        })
        .then(() => {
          // console.log("Successfully Signed Up.");
          this.setState({ ...INITIAL_STATE });
          // console.log("Initialized newState!!");
          this.props.history.push(ROUTES.HOME);
          // console.log("Redirected to Home!!");
        })
        .catch((error) => {
          if (this.state.error == null) {
            if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
              error.message = ERROR_MSG_ACCOUNT_EXISTS;
              this.setState({ error: error.message });
            } else if (error.code === ERROR_CODE_INVALID_EMAIL) {
              error.message = ERROR_MSG_INVALID_EMAIL;
              this.setState({ error: error.message });
            }
          }
        });
    }

    event.preventDefault();
  };

  render() {
    const {
      fname,
      lname,
      college,
      enrolno,
      department,
      semester,
      division,
      email,
      shift,
      passwordOne,
      passwordTwo,
      error,

      college_list,
      course_list,
    } = this.state;

    return (
      <form onSubmit={this.onSubmit} className="StuSignupForm">
        <div className="flex-grp flex-fila-grp">
          <div className="group fi-name">
            <input
              type="text"
              name="fname"
              className="input"
              value={fname}
              onChange={this.onChange}
            />
            <label
              className={fname !== "" ? "placeholder above" : "placeholder"}
            >
              First Name
            </label>
          </div>
          <div className="group la-name">
            <input
              type="text"
              name="lname"
              className="input"
              value={lname}
              onChange={this.onChange}
            />
            <label
              className={lname !== "" ? "placeholder above" : "placeholder"}
            >
              Last Name
            </label>
          </div>
        </div>
        <br />

        <div className="flex-grp">
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              value={college}
              onChange={this.onChangeCollege}
              name="college"
            >
              <option>--SELECT--</option>
              {college_list.map((e, key) => {
                return <option key={key}>{e.name}</option>;
              })}
            </select>
            <label className="dropdown-placeholder">
              <label>College</label>
            </label>
          </div>
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              value={department}
              onChange={this.onChange}
              name="department"
            >
              <option>--SELECT--</option>
              {course_list.map((dept) => {
                return <option key={dept}>{dept}</option>;
              })}
            </select>

            <label className="dropdown-placeholder">Department</label>
          </div>
        </div>
        <br />
        <div className="flex-grp">
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              name="semester"
              value={semester}
              onChange={this.onChange}
            >
              <option>--SELECT--</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
            </select>
            <label className="dropdown-placeholder">
              Semester
              {semester && semester !== "--SELECT--" ? " - " + semester : null}
            </label>
          </div>
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              name="division"
              value={division}
              onChange={this.onChange}
            >
              <option>--SELECT--</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
              <option>Not Any</option>
            </select>
            <label className="dropdown-placeholder">
              Class Div.
              {division && division !== "--SELECT--" ? " - " + division : null}
            </label>
          </div>
        </div>
        <br />
        <div className="flex-grp">
          <div className="group">
            <input
              type="number"
              name="enrolno"
              className="input"
              value={enrolno}
              onChange={this.onChange}
            />
            <label
              className={enrolno !== "" ? "placeholder above" : "placeholder"}
            >
              Enrolment No.
            </label>
          </div>

          <div className="group">
            <input
              type="email"
              name="email"
              className="input"
              value={email}
              onChange={this.onChange}
            />
            <label
              className={email !== "" ? "placeholder above" : "placeholder"}
            >
              Email ID
            </label>
          </div>
        </div>
        <br />
        <div className="flex-grp">
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              name="shift"
              value={shift}
              onChange={this.onChange}
            >
              <option>--SELECT--</option>
              <option>First Shift</option>
              <option>Second Shift</option>
              <option>No Shift (Has only one Shift)</option>
            </select>
            <label className="dropdown-placeholder">
              Shift
              {shift && shift !== "--SELECT--"
                ? shift === "No Shift (Has only one Shift)"
                  ? " - No Shift"
                  : " - " + shift
                : null}
            </label>
          </div>
          <div className="group">
            <input
              type="password"
              name="passwordOne"
              className="input"
              value={passwordOne}
              onChange={this.onChange}
            />
            <label
              className={
                passwordOne !== "" ? "placeholder above" : "placeholder"
              }
            >
              Password
            </label>
          </div>
        </div>
        <br />
        <div className="flex-grp flex-fila-grp">
          <div className="group">
            <input
              type="password"
              name="passwordTwo"
              className="input"
              value={passwordTwo}
              onChange={this.onChange}
            />
            <label
              className={
                passwordTwo !== "" ? "placeholder above" : "placeholder"
              }
            >
              Confirm Password
            </label>
          </div>
        </div>

        <TermCheckbox />

        <button type="submit" name="submit" className="SubmitBut">
          Submit
        </button>
        <div className="error-text">
          {/* {error && <p style={{ color: `#ff0000` }}>*{error.message}*</p>} */}
          {error && <p style={{ color: `#ff0000` }}>*{error}*</p>}
        </div>
      </form>
    );
  }
}

const SignInLink = () => (
  <p style={{ textAlign: `center`, marginTop: `50px`, marginBottom: `50px` }}>
    Already have an account?{" "}
    <Link
      to={ROUTES.SIGN_IN}
      style={{
        textDecoration: `none`,
        color: `#0000ff`,
        fontWeight: `500`,
        marginLeft: `5px`,
      }}
    >
      Sign In
    </Link>
  </p>
);

const SignUpStuForm = compose(withRouter, withFirebase)(SignUpFormBase);

export default SignUpStudentPageCondition;

export { SignUpStuForm };
