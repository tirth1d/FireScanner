import React, { Component } from "react";
import "./classroom.css";
import CollegeJSON from "../../CollegeList.json";

import { compose } from "recompose";
import { withFirebase } from "../Configuration";

import AuthUserContext from "../Session/context";
import SignUpStuPage from "../Forms/SignUp/SignUpStu";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const condition = (authUser) => !!authUser;

class Classroom extends Component {
  render() {
    return (
      <AuthUserContext.Consumer>
        {(authUser) =>
          condition(authUser) ? <ClassroomSectionMain /> : <SignUpStuPage />
        }
      </AuthUserContext.Consumer>
    );
  }
}

const INITIAL_STATE = {
  department: "",
  subject: "",
  semester: "",
  division: "",
  shift: "",
};

class ClassroomSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
      authUser: JSON.parse(localStorage.getItem("authUser")),
      isToggle: false,
      isHide: false,
      isHideLast: 0,
      onCardClickToggle: false,

      fac_name: JSON.parse(localStorage.getItem("authUser")).name,
      fac_college_name: JSON.parse(localStorage.getItem("authUser")).college,

      course_list: CollegeJSON.find(
        (college) =>
          college.name === JSON.parse(localStorage.getItem("authUser")).college
      ).courses,

      stu_college_name: JSON.parse(localStorage.getItem("authUser")).college,
      stu_dept: JSON.parse(localStorage.getItem("authUser")).department,
      stu_sem: JSON.parse(localStorage.getItem("authUser")).semester,
      stu_div: JSON.parse(localStorage.getItem("authUser")).division,
      stu_shift: JSON.parse(localStorage.getItem("authUser")).shift,
    };

    this.classCardMainFacStuSection = React.createRef();
    this.componentDidMount = this.componentDidMount.bind(this);

    // console.log(
    //   this.state.stu_college_name,
    //   this.state.stu_dept,
    //   this.state.stu_sem,
    //   this.state.stu_div
    // );
  }

  componentDidMount() {
    const {
      stu_college_name,
      stu_dept,
      stu_sem,
      stu_div,
      stu_shift,
    } = this.state;

    if (this.state.authUser.role === "Faculty") {
      this.props.firebase
        .facultySubjects(this.state.fac_name, this.state.fac_college_name)
        .on("child_added", (snapshot) => {
          var subject = snapshot.child("subject").val();
          var semester = snapshot.child("semester").val();
          var division = snapshot.child("division").val();
          var shift = snapshot.child("shift").val();
          if (shift === `No Shift (Has only one Shift)`) {
            shift = "No Shift";
          } else {
            shift = snapshot.child("shift").val();
          }

          // console.log(subject);

          var classCardMainFacSection = document.createElement("div");
          var classCardMain = document.createElement("div");
          var classCardMainSideStraps = document.createElement("div");
          var classCardMainInfo = document.createElement("div");
          var classCardMainInfoSub = document.createElement("h3");
          var classCardMainInfoSDShift = document.createElement("p");
          var classCardMainInfoSem = document.createElement("span");
          var classCardMainInfoDiv = document.createElement("span");
          var classCardMainInfoShift = document.createElement("span");

          var classCardMainSideStrapsGenerateBtn = document.createElement(
            "button"
          );
          var classCardMainSideStrapsGenerateBtnRandom = document.createElement(
            "button"
          );

          classCardMainFacSection.className = "classCardMainFacSection";
          classCardMain.className = "classCardMain";
          classCardMainSideStraps.className = "classCardMainSideStraps";
          classCardMainSideStrapsGenerateBtn.className =
            "classCardMainSideStrapsGenerateBtn";
          classCardMainSideStrapsGenerateBtnRandom.className =
            "classCardMainSideStrapsGenerateBtn";

          classCardMainSideStrapsGenerateBtn.addEventListener("click", () => {
            classCardMainSideStraps.classList.toggle("strapsSlide");

            classCardMainSideStraps.removeChild(
              classCardMainSideStrapsGenerateBtn
            );
            classCardMainSideStraps.appendChild(
              classCardMainSideStrapsGenerateBtnRandom
            );
            classCardMainSideStrapsGenerateBtnRandom.classList.toggle(
              "showStrapsBtn"
            );
            classCardMainSideStrapsGenerateBtnRandom.append(
              Math.floor(1000 + Math.random() * 9000)
            );
          });

          classCardMainSideStrapsGenerateBtnRandom.addEventListener(
            "click",
            () => {
              classCardMainSideStraps.classList.toggle("strapsSlide");
              classCardMainSideStrapsGenerateBtnRandom.classList.toggle(
                "showStrapsBtn"
              );
            }
          );

          classCardMain.addEventListener("click", () => {
            classCardMainSideStraps.classList.toggle("strapsSlide");
            classCardMainSideStrapsGenerateBtn.classList.toggle(
              "showStrapsBtn"
            );
            classCardMainSideStrapsGenerateBtnRandom.classList.toggle(
              "showStrapsBtn"
            );
          });

          classCardMainFacSection.appendChild(classCardMain);
          classCardMain.appendChild(classCardMainSideStraps);
          classCardMain.appendChild(classCardMainInfo);
          classCardMainInfo.appendChild(classCardMainInfoSub);
          classCardMainInfo.appendChild(classCardMainInfoSDShift);
          classCardMainInfoSDShift.appendChild(classCardMainInfoSem);
          classCardMainInfoSDShift.appendChild(classCardMainInfoDiv);
          classCardMainInfoSDShift.appendChild(classCardMainInfoShift);

          classCardMainSideStraps.appendChild(
            classCardMainSideStrapsGenerateBtn
          );
          classCardMainSideStrapsGenerateBtn.append("Generate a Random Number");

          classCardMainInfoSub.append(subject);
          classCardMainInfoSem.append(`Sem(${semester})`);
          classCardMainInfoDiv.append(division);
          classCardMainInfoShift.append(shift);

          this.classCardMainFacStuSection.current.appendChild(
            classCardMainFacSection
          );

          console.log(classCardMainFacSection);
        });
    } else if (this.state.authUser.role === "Student") {
      this.props.firebase
        .studentSubjects(stu_college_name)
        .on("value", (snapshot) => {
          const faculties = [];
          const facultySubArray = [];
          snapshot.forEach((item) => {
            const temp = item.val();
            faculties.push(temp);
            return false;
          });
          //console.log(faculties);
          faculties.forEach((item) => {
            facultySubArray.push(item.subjects);
            return false;
          });
          //console.log(facultySubArray);
          facultySubArray.forEach((subs) => {
            //console.log(subs);

            //Value as an object just by simply looping over to the element object
            for (var key in subs) {
              if (subs.hasOwnProperty(key)) {
                if (
                  subs[key].department === stu_dept &&
                  subs[key].semester === stu_sem &&
                  subs[key].division === stu_div &&
                  subs[key].shift === stu_shift
                ) {
                  var StuSubject = subs[key].subject;
                  var SubFacName = subs[key].fname;

                  // console.log(StuSubject);
                  // console.log(StuShift);
                  //Value as an Array after converting object into an array using Object.entries(). [And this the preffered method oflooping over to objects bcz here we do not to check element.hasOwnProperty() and things like that....] [You can even use Object.keys and Object.values instead of Object.entries, if you want either of them...]
                  // for (const [key, value] of Object.entries(subjects)) {
                  //   console.log(`${key}, ${value.division}`);
                  // }

                  var classCardMainStuSection = document.createElement("div");
                  var classCardMain = document.createElement("div");
                  var classCardMainSideStraps = document.createElement("div");
                  var classCardMainInfo = document.createElement("div");
                  var classCardMainInfoSub = document.createElement("h3");
                  var classCardMainInfoFacName = document.createElement("p");

                  classCardMainStuSection.className = "classCardMainStuSection";
                  classCardMain.className = "classCardMain";
                  classCardMainSideStraps.className = "classCardMainSideStraps";
                  classCardMainStuSection.appendChild(classCardMain);
                  classCardMain.appendChild(classCardMainSideStraps);
                  classCardMain.appendChild(classCardMainInfo);
                  classCardMainInfo.appendChild(classCardMainInfoSub);
                  classCardMainInfo.appendChild(classCardMainInfoFacName);

                  classCardMainInfoSub.append(StuSubject);
                  classCardMainInfoFacName.append(SubFacName);

                  this.classCardMainFacStuSection.current.appendChild(
                    classCardMainStuSection
                  );

                  //console.log(classCardMainStuSection);
                }
              }
            }
          });
        });
    }
  }

  onCardClick = () => {
    this.setState({ onCardClickToggle: !this.state.onCardClickToggle });
    console.log(this.state.onCardClickToggle);
  };

  addBtnToggle = () => {
    this.setState({ isToggle: !this.state.isToggle });
  };

  nextClickBtn = () => {
    this.setState(
      this.state.department && this.state.department !== "--DEPARTMENT--"
        ? { isHide: !this.state.isHide }
        : { isHide: this.state.isHide }
    );
  };

  nextClickBtnLast = () => {
    this.setState(this.state.subject ? { isHideLast: 1 } : { isHideLast: 0 });
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onSubmit = () => {
    const {
      fac_name,
      fac_college_name,
      subject,
      department,
      semester,
      division,
      shift,
    } = this.state;

    if (
      this.state.semester &&
      this.state.division &&
      this.state.shift &&
      this.state.semester !== "SEMESTER--" &&
      this.state.division !== "DIVISION--" &&
      this.state.shift !== "COLLEGE SHIFT--"
    ) {
      this.props.firebase
        .facultySubjects(fac_name, fac_college_name)
        .child(`${subject} - ${department}`)
        .set({
          department,
          subject,
          semester,
          division,
          shift,
          fname: fac_name,
        })
        .then(() => {
          this.setState({ isToggle: !this.state.isToggle });
          window.location.reload(true);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("Please Submit All your fields Properly!");
    }
  };

  render() {
    const { department, subject, semester, division, shift } = this.state;

    return (
      <div className="classRoomSectionMain">
        {this.state.authUser.role === "Faculty" && (
          <div>
            <div
              className={
                !this.state.isToggle
                  ? "bgBlurCardList"
                  : "bgBlurCardList unscroll"
              }
            ></div>
            <div
              className={
                !this.state.isToggle ? "quesCardsMain" : "quesCardsMain visible"
              }
            >
              <div
                className={
                  !this.state.isHide ? "quesCardOne" : "quesCardOne hide"
                }
              >
                <p>Select the Dept.</p>
                <div className="queCardOneForm">
                  <select
                    className="collegeListDropdown"
                    name="department"
                    value={department}
                    onChange={this.onChange}
                  >
                    <option>--DEPARTMENT--</option>
                    {this.state.course_list.map((dept) => {
                      return <option key={dept}>{dept}</option>;
                    })}
                  </select>
                  <div className="queCardOnebtn" onClick={this.nextClickBtn}>
                    <FontAwesomeIcon
                      icon="arrow-right"
                      className="queCardOnebtnIcon"
                    />
                  </div>
                </div>
              </div>
              <div
                className={
                  this.state.isHide && this.state.isHideLast === 0
                    ? "quesCardTwo"
                    : "quesCardTwo hide"
                }
              >
                <p>The Subject Name?</p>
                <div className="queCardTwoForm">
                  <input
                    type="text"
                    name="subject"
                    value={subject}
                    onChange={this.onChange}
                    className="SubjectNameDropdown"
                    placeholder="Subject"
                  />

                  <div
                    className="queCardTwobtn"
                    onClick={this.nextClickBtnLast}
                  >
                    <FontAwesomeIcon
                      icon="arrow-right"
                      className="queCardTwobtnIcon"
                    />
                  </div>
                </div>
              </div>
              <div
                className={
                  this.state.isHideLast === 1
                    ? "quesCardThreeMain"
                    : "quesCardThreeMain hide"
                }
              >
                <div className="quesCardThree">
                  <p>Sem., Div. &amp; Shift?</p>
                  <div className="queCardThreeForm">
                    <select
                      className="SemesterListDropdown"
                      name="semester"
                      value={semester}
                      onChange={this.onChange}
                    >
                      <option>SEMESTER--</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6</option>
                      <option>7</option>
                      <option>8</option>
                    </select>
                    <select
                      className="DivisionListDropdown"
                      name="division"
                      value={division}
                      onChange={this.onChange}
                    >
                      <option>DIVISION--</option>
                      <option>A</option>
                      <option>B</option>
                      <option>C</option>
                      <option>D</option>
                      <option>Not Any</option>
                    </select>
                    <select
                      className="ShiftListDropdown"
                      name="shift"
                      value={shift}
                      onChange={this.onChange}
                    >
                      <option>COLLEGE SHIFT--</option>
                      <option>First Shift</option>
                      <option>Second Shift</option>
                      <option>No Shift (Has only one Shift)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="queCardThreebtn"
                  onClick={this.onSubmit}
                >
                  <FontAwesomeIcon
                    icon="arrow-right"
                    className="queCardThreebtnIcon"
                  />
                </button>
              </div>
            </div>
            <div className="EditBarMain">
              <div className="EditBarBgShapeLeft">
                <FontAwesomeIcon
                  icon="pencil-alt"
                  className="editBarEditBtnIcon"
                />
              </div>
              <svg
                className="EditBarBgShapeMid"
                width="177"
                height="48"
                viewBox="0 0 177 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M58.9751 15.3465C53.4225 7.40845 45.5652 0 35.8778 0H1H0V0.999999V1V47V48H1.00001H176H177V47V1V0H176H141.122C131.435 0 123.578 7.40844 118.025 15.3465C111.389 24.8338 100.636 31 88.5 31C76.3641 31 65.6115 24.8338 58.9751 15.3465Z"
                  fill="#4885ed"
                />
              </svg>

              <div className="editBarAddBtn" onClick={this.addBtnToggle}>
                <FontAwesomeIcon
                  icon="plus"
                  className={
                    !this.state.isToggle
                      ? "editBarAddBtnIcon"
                      : "editBarAddBtnIcon rotate"
                  }
                />
              </div>

              <div className="EditBarBgShapeRight">
                <FontAwesomeIcon
                  icon="trash-alt"
                  className="editBarDelBtnIcon"
                />
              </div>
            </div>
          </div>
        )}

        <div className="classListSection">
          <div
            className={
              !this.state.isToggle ? "classListNavBar" : "classListNavBar blur"
            }
          >
            <p className="classListNavHeader">
              <span style={{ color: `#4885ed` }}>C</span>
              <span style={{ color: `#db3236` }}>l</span>
              <span style={{ color: `#f4c20d` }}>a</span>
              <span style={{ color: `#4885ed` }}>s</span>
              <span style={{ color: `#3cba54` }}>s</span>
              <span style={{ color: `#db3236` }}>r</span>
              <span style={{ color: `#f4c20d` }}>o</span>
              <span style={{ color: `#4885ed` }}>o</span>
              <span style={{ color: `#3cba54` }}>m</span>
            </p>
          </div>
          <div
            ref={this.classCardMainFacStuSection}
            className={
              !this.state.isToggle
                ? "classCardMainFacStuSection"
                : "classCardMainFacStuSection blur"
            }
            style={
              this.state.authUser.role === "Faculty"
                ? { paddingBottom: `120px` }
                : { paddingBottom: `30px` }
            }
          >
            {/* <div className="classCardMain">
          <div className="classCardMainSideStraps"></div>
          <div>
            <h3>{subject}</h3>
            <p>{department}</p>
            <p>
              <span>Sem({semester}) - </span>
              <span>{division} - </span>
              <span>{shift}</span>
            </p>
          </div>
        </div> */}
          </div>
        </div>
      </div>
    );
  }
}

const ClassroomSectionMain = compose(withFirebase)(ClassroomSection);

export default Classroom;

export { ClassroomSectionMain };
