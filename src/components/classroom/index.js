import React, { Component } from "react";
import "./classroom.css";
import CollegeJSON from "../../CollegeList.json";

import { Link, withRouter } from "react-router-dom";
import * as ROUTES from "../../constants/routes";

import { compose } from "recompose";
import { withFirebase } from "../Configuration";

import AuthUserContext from "../Session/context";
import SignInPage from "../Forms/SignIn";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import FacultyImg from "../../images/faculty.png";
import SomethingWrongGIF from "../../images/something_wrong.gif";

import Scanner from "./scanner";
import Result from "./result";

import ReactDOMServer from "react-dom/server";

import { PDFExport } from "@progress/kendo-react-pdf";

import "./attendees.css";
const condition = (authUser) => !!authUser;

class Classroom extends Component {
  render() {
    return (
      <AuthUserContext.Consumer>
        {(authUser) =>
          condition(authUser) ? <ClassroomSectionMain /> : <SignInPage />
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

    var today = new Date(),
      date =
        today.getDate() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getFullYear();

    var todayStyle = new Date(),
      dateStyle =
        todayStyle.getDate() +
        "." +
        (todayStyle.getMonth() + 1) +
        "." +
        todayStyle.getFullYear();

    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    this.state = {
      ...INITIAL_STATE,
      authUser: JSON.parse(localStorage.getItem("authUser")),
      isToggle: false,
      isToggleHamburger: false,
      isHide: false,
      isHideLast: 0,
      onCardClickToggle: false,

      fac_name: JSON.parse(localStorage.getItem("authUser")).name,
      fac_college_name: JSON.parse(localStorage.getItem("authUser")).college,
      fac_access_code: JSON.parse(localStorage.getItem("authUser")).access_code,
      facCardInfoObj: {},
      facAuthID: JSON.parse(localStorage.getItem("authUser")).uid,
      facKey: "",
      subStuKey: "",
      stuCardInfoObj: {},

      course_list: CollegeJSON.find(
        (college) =>
          college.name === JSON.parse(localStorage.getItem("authUser")).college
      ).courses,

      stu_college_name: JSON.parse(localStorage.getItem("authUser")).college,
      stu_dept: JSON.parse(localStorage.getItem("authUser")).department,
      stu_sem: JSON.parse(localStorage.getItem("authUser")).semester,
      stu_div: JSON.parse(localStorage.getItem("authUser")).division,
      stu_shift: JSON.parse(localStorage.getItem("authUser")).shift,
      stu_enrolno: JSON.parse(localStorage.getItem("authUser")).enrolment_no,
      stu_uid: JSON.parse(localStorage.getItem("authUser")).uid,
      stu_name: JSON.parse(localStorage.getItem("authUser")).name,

      randomNumber: 0,
      fac_access: false,
      resultBarcode: 0,
      scanningCardToggle: false,

      profile_name: JSON.parse(localStorage.getItem("authUser")).name,

      barcodeSuccessFailToggle: false,
      onScanAlternativeToggle: false,

      alt_enrolment_no: "",

      stuAttendanceInfoFirebaseFacName: "",
      stuAttendanceInfoFirebaseStuSubject: "",
      stuAttendanceInfoFirebaseCardDeptInfo: "",
      date: date,
      dateStyle: dateStyle,
      time: "",
      weekdayName: weekday[todayStyle.getDay()],

      stuLength: "",
      liveSubStuLength: "",

      StudentAttendanceCardInfoToggle: false,

      classCardMainSideStrapsDeleteToggle: false,

      StudentAttendanceCheckAgain: "",
      StudentAttendanceCheckToggle: false,

      StudentAttendanceCardInfo: false,
    };

    this.classCardMainFacStuSection = React.createRef();

    this.StudentAttendanceCardMain = React.createRef();

    this.StudentAttendanceCardLast = React.createRef();

    this.StudentAttendanceCardPresentList = React.createRef();

    this.StudentAttendanceCardAbsentList = React.createRef();
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
      this.setState({ StudentAttendanceCheckToggle: false });

      this.props.firebase
        .facultySubjects(this.state.facAuthID, this.state.fac_college_name)
        .orderByKey()
        .on("child_added", (snapshot) => {
          var subject = snapshot.child("subject").val();
          var current_facultySub_key = snapshot.key;
          var department = snapshot.child("department").val();
          var semester = snapshot.child("semester").val();
          var division = snapshot.child("division").val();
          var shift = snapshot.child("shift").val();
          if (shift === `No Shift (Has only one Shift)`) {
            shift = "No Shift";
          } else {
            shift = snapshot.child("shift").val();
          }

          this.setState({
            facCardInfoObj: {
              subject,
              current_facultySub_key,
              department,
              semester,
              division,
              shift,
            },
          });

          this.props.firebase
            .studentList(this.state.fac_college_name)
            .orderByKey()
            .on("child_added", (snapshot) => {
              var studentList = snapshot.val();
              var studentListKey = snapshot.key;
              if (
                studentList.department === department &&
                studentList.division === division &&
                studentList.semester === semester &&
                (studentList.shift === "No Shift (Has only one Shift)" || shift)
              ) {
                this.props.firebase
                  .facultySubjects(
                    this.state.facAuthID,
                    this.state.fac_college_name
                  )
                  .child(`${current_facultySub_key}/students/${studentListKey}`)
                  .set({
                    stu_enrolno: studentList.enrolment_no,
                    stu_name: studentList.name,
                    attendance: "absent",
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              }

              this.props.firebase
                .facultySubjects(
                  this.state.facAuthID,
                  this.state.fac_college_name
                )
                .child(`${current_facultySub_key}/random_access`)
                .update({
                  access_boolean: false,
                  random_number: 0,
                })
                .catch((error) => {
                  console.log(error);
                });
            });

          let randomNumberEquation;

          var classCardMainFacSection = document.createElement("div");
          var classCardMain = document.createElement("div");
          var classCardMainSideStraps = document.createElement("div");
          var classCardMainSideStrapsDelete = document.createElement("div");
          var classCardMainInfo = document.createElement("div");
          var classCardMainInfoSub = document.createElement("h3");
          var classCardMainInfoDept = document.createElement("p");
          var classCardMainInfoSDShift = document.createElement("p");
          var classCardMainInfoSem = document.createElement("span");
          var classCardMainInfoDiv = document.createElement("span");
          var classCardMainInfoShift = document.createElement("span");

          var classCardMainSideStrapsDeleteBtn = document.createElement("div");
          const classCardMainSideStrapsDeleteBtnIcon = ReactDOMServer.renderToStaticMarkup(
            <FontAwesomeIcon
              icon="trash-alt"
              style={{
                fontSize: `20px`,
              }}
            />
          );

          var classCardMainSideStrapsGenerateBtn = document.createElement(
            "div"
          );
          var classCardMainSideStrapsGenerateBtnRandom = document.createElement(
            "div"
          );
          var classCardMainSideStrapsGenerateBtnRandomNumber = document.createElement(
            "p"
          );
          var classCardMainSideStrapsGenerateBtnRandomAgain = document.createElement(
            "div"
          );
          var classCardMainSideStrapsGenerateBtnRandomNext = document.createElement(
            "div"
          );
          var classCardMainSideStrapsGenerateBtnRandomAgainIcon = document.createElement(
            "p"
          );
          var classCardMainSideStrapsGenerateBtnRandomNextIcon = document.createElement(
            "p"
          );

          const classCardMainSideStrapsGenerateBtnRandomAgainFontAwesomeIcon = ReactDOMServer.renderToStaticMarkup(
            <FontAwesomeIcon
              icon="undo"
              style={{ color: `#ffffff`, fontSize: `15px` }}
            />
          );

          const classCardMainSideStrapsGenerateBtnRandomNextFontAwesomeIcon = ReactDOMServer.renderToStaticMarkup(
            <FontAwesomeIcon
              icon="arrow-right"
              style={{ color: `#ffffff`, fontSize: `16px` }}
            />
          );

          classCardMainSideStrapsDelete.appendChild(
            classCardMainSideStrapsDeleteBtn
          );
          classCardMainSideStrapsDeleteBtn.innerHTML = classCardMainSideStrapsDeleteBtnIcon;
          classCardMainSideStrapsGenerateBtnRandom.appendChild(
            classCardMainSideStrapsGenerateBtnRandomNumber
          );

          classCardMainSideStrapsGenerateBtnRandomNext.appendChild(
            classCardMainSideStrapsGenerateBtnRandomNextIcon
          );
          classCardMainSideStrapsGenerateBtnRandomNextIcon.className =
            "classCardMainSideStrapsGenerateBtnRandomNextIcon";
          classCardMainSideStrapsGenerateBtnRandomNextIcon.innerHTML = classCardMainSideStrapsGenerateBtnRandomNextFontAwesomeIcon;

          classCardMainSideStrapsGenerateBtnRandomAgain.appendChild(
            classCardMainSideStrapsGenerateBtnRandomAgainIcon
          );
          classCardMainSideStrapsGenerateBtnRandomAgainIcon.className =
            "classCardMainSideStrapsGenerateBtnRandomAgainIcon";
          classCardMainSideStrapsGenerateBtnRandomAgainIcon.innerHTML = classCardMainSideStrapsGenerateBtnRandomAgainFontAwesomeIcon;

          classCardMainFacSection.className = "classCardMainFacSection";
          classCardMain.className = "classCardMain";
          classCardMainSideStraps.className = `classCardMainSideStraps`;
          classCardMainSideStrapsDelete.className = `classCardMainSideStrapsDelete`;
          classCardMainSideStrapsDeleteBtn.className = `classCardMainSideStrapsDeleteBtn`;

          classCardMainInfo.className = `classCardMainInfoDiv`;
          classCardMainInfoSub.className = `classCardMainInfoSubParagraph`;
          classCardMainInfoDept.className = `classCardMainInfoDeptParagraph`;
          classCardMainInfoSDShift.className = `classCardMainInfoSDShiftParagraph`;

          classCardMainSideStrapsGenerateBtn.className =
            "classCardMainSideStrapsGenerateBtn";
          classCardMainSideStrapsGenerateBtnRandom.className =
            "classCardMainSideStrapsGenerateBtnRandom";
          classCardMainSideStrapsGenerateBtnRandomAgain.className =
            "classCardMainSideStrapsGenerateBtnRandomAgain";
          classCardMainSideStrapsGenerateBtnRandomNext.className =
            "classCardMainSideStrapsGenerateBtnRandomNext";

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

            randomNumberEquation = Math.floor(1000 + Math.random() * 9000);
            classCardMainSideStrapsGenerateBtnRandomNumber.textContent = randomNumberEquation;
            this.setState({ randomNumber: randomNumberEquation });
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

          classCardMainSideStrapsGenerateBtnRandomAgain.addEventListener(
            "click",
            () => {
              randomNumberEquation = Math.floor(1000 + Math.random() * 9000);
              classCardMainSideStrapsGenerateBtnRandomNumber.textContent = randomNumberEquation;
              this.setState({ randomNumber: randomNumberEquation });
            }
          );

          classCardMain.addEventListener("click", () => {
            if (this.state.classCardMainSideStrapsDeleteToggle) {
              classCardMainSideStrapsDelete.classList.toggle(
                "strapsSlideDelete"
              );
              classCardMainSideStrapsDeleteBtn.classList.toggle(
                "showStrapsBtn"
              );
            }
            if (!this.state.classCardMainSideStrapsDeleteToggle) {
              classCardMainSideStrapsDeleteBtn.classList.remove(
                "showStrapsBtn"
              );

              classCardMainSideStraps.classList.toggle("strapsSlide");
              classCardMainSideStrapsGenerateBtn.classList.toggle(
                "showStrapsBtn"
              );
              classCardMainSideStrapsGenerateBtnRandom.classList.toggle(
                "showStrapsBtn"
              );
            }
          });

          classCardMainSideStrapsGenerateBtnRandomNext.addEventListener(
            "click",
            () => {
              if (
                prompt("Enter your Access code to go ahead") ===
                this.state.fac_access_code
              ) {
                this.currentTime();
                this.setState({ StudentAttendanceCheckToggle: true });
                this.props.firebase
                  .studentLength(
                    this.state.fac_college_name,
                    this.state.facAuthID,
                    current_facultySub_key
                  )
                  .orderByKey()
                  .once("value", (snapshot) => {
                    var subStuLength = snapshot.numChildren();

                    this.setState({ stuLength: subStuLength });
                  });

                this.props.firebase
                  .studentLength(
                    this.state.fac_college_name,
                    this.state.facAuthID,
                    current_facultySub_key
                  )
                  .orderByKey()
                  .on("value", (snapshot) => {
                    var subStuLength = snapshot.numChildren();
                    this.setState({ stuLength: subStuLength });
                    let liveSubStuLength = 0;

                    var subStudents = snapshot.val();
                    for (var substu in subStudents) {
                      if (subStudents[substu].attendance === "present") {
                        liveSubStuLength = liveSubStuLength + 1;
                      }
                    }
                    this.setState({
                      liveSubStuLength: liveSubStuLength,
                    });
                  });

                this.props.firebase
                  .studentLength(
                    this.state.fac_college_name,
                    this.state.facAuthID,
                    current_facultySub_key
                  )
                  .on("child_added", (snapshot) => {
                    var subStuKey = snapshot.key;
                    var subStuInfo = snapshot.val();

                    var studsCardEnrolNo = subStuInfo.stu_enrolno;
                    var studsCardName = subStuInfo.stu_name;
                    var StudentAttendanceCard = document.createElement("div");
                    var StudentAttendanceCardInfo = document.createElement(
                      "div"
                    );
                    var StudentAttendanceCardInfoEnrolNo = document.createElement(
                      "div"
                    );
                    var StudentAttendanceCardInfoName = document.createElement(
                      "div"
                    );
                    var StudentAttendanceCardBtn = document.createElement(
                      "div"
                    );

                    var StudentAttendanceCardBtnIndicator = document.createElement(
                      "div"
                    );
                    var StudentAttendanceCardBtnAddCancel = document.createElement(
                      "div"
                    );

                    const StudentAttendanceCardBtnCancel = ReactDOMServer.renderToStaticMarkup(
                      <FontAwesomeIcon
                        icon="minus"
                        style={{
                          fontSize: `12px`,
                        }}
                      />
                    );

                    const StudentAttendanceCardBtnAdd = ReactDOMServer.renderToStaticMarkup(
                      <FontAwesomeIcon
                        icon="plus"
                        style={{
                          fontSize: `12px`,
                        }}
                      />
                    );

                    StudentAttendanceCard.className = "StudentAttendanceCard";
                    StudentAttendanceCardInfo.className =
                      "StudentAttendanceCardInfo";
                    StudentAttendanceCardInfoEnrolNo.className =
                      "StudentAttendanceCardInfoEnrolNo";
                    StudentAttendanceCardInfoName.className =
                      "StudentAttendanceCardInfoNameHide";
                    StudentAttendanceCardBtn.className =
                      "StudentAttendanceCardBtn";
                    StudentAttendanceCardBtnIndicator.className =
                      "StudentAttendanceCardBtnIndicator";
                    StudentAttendanceCardBtnAddCancel.className =
                      "StudentAttendanceCardBtnAddCancel";

                    this.StudentAttendanceCardPresentList.current.addEventListener(
                      "click",
                      () => {
                        StudentAttendanceCardBtnAddCancel.className =
                          "StudentAttendanceCardBtnAddCancelHide";

                        this.StudentAttendanceCardLast.current.className =
                          "AttendeeBaseMainLeaveChoiceBtnDivHide";
                        this.props.firebase
                          .studentLengthAttendance(
                            this.state.fac_college_name,
                            this.state.facAuthID,
                            current_facultySub_key,
                            subStuKey
                          )
                          .on("value", (snapshot) => {
                            if (snapshot.val().attendance === "absent") {
                              StudentAttendanceCard.className =
                                "StudentAttendanceCardHide";
                            }
                          });
                      }
                    );

                    this.StudentAttendanceCardAbsentList.current.addEventListener(
                      "click",
                      () => {
                        StudentAttendanceCardBtnAddCancel.className =
                          "StudentAttendanceCardBtnAddCancelHide";

                        this.StudentAttendanceCardLast.current.className =
                          "AttendeeBaseMainLeaveChoiceBtnDivHide";
                        this.props.firebase
                          .studentLengthAttendance(
                            this.state.fac_college_name,
                            this.state.facAuthID,
                            current_facultySub_key,
                            subStuKey
                          )
                          .on("value", (snapshot) => {
                            if (snapshot.val().attendance === "present") {
                              StudentAttendanceCard.className =
                                "StudentAttendanceCardHide";
                            }
                          });
                      }
                    );

                    StudentAttendanceCard.appendChild(
                      StudentAttendanceCardInfo
                    );
                    StudentAttendanceCard.appendChild(StudentAttendanceCardBtn);

                    StudentAttendanceCardInfo.appendChild(
                      StudentAttendanceCardInfoEnrolNo
                    );
                    StudentAttendanceCardInfo.appendChild(
                      StudentAttendanceCardInfoName
                    );

                    StudentAttendanceCardBtn.appendChild(
                      StudentAttendanceCardBtnIndicator
                    );

                    StudentAttendanceCardInfo.addEventListener("click", () => {
                      this.setState((prevState) => {
                        return {
                          StudentAttendanceCardInfo: !prevState.StudentAttendanceCardInfo,
                        };
                      });

                      if (this.state.StudentAttendanceCardInfo) {
                        StudentAttendanceCardInfoEnrolNo.className =
                          "StudentAttendanceCardInfoEnrolNoHide";
                        StudentAttendanceCardInfoName.className =
                          "StudentAttendanceCardInfoName";
                      } else {
                        StudentAttendanceCardInfoEnrolNo.className =
                          "StudentAttendanceCardInfoEnrolNo";
                        StudentAttendanceCardInfoName.className =
                          "StudentAttendanceCardInfoNameHide";
                      }
                    });

                    StudentAttendanceCardInfoEnrolNo.append(studsCardEnrolNo);
                    StudentAttendanceCardInfoName.append(studsCardName);

                    this.props.firebase
                      .studentLengthAttendance(
                        this.state.fac_college_name,
                        this.state.facAuthID,
                        current_facultySub_key,
                        subStuKey
                      )
                      .on("value", (snapshot) => {
                        if (snapshot.val().attendance === "present") {
                          StudentAttendanceCardBtnIndicator.className =
                            "StudentAttendanceCardBtnIndicatorOn";

                          StudentAttendanceCardBtnAddCancel.innerHTML = StudentAttendanceCardBtnCancel;

                          StudentAttendanceCardBtnAddCancel.addEventListener(
                            "click",
                            () => {
                              this.props.firebase
                                .studentLengthAttendance(
                                  this.state.fac_college_name,
                                  this.state.facAuthID,
                                  current_facultySub_key,
                                  subStuKey
                                )
                                .update({
                                  attendance: "absent",
                                })
                                .catch((error) => {
                                  console.log(error);
                                });
                            }
                          );
                          StudentAttendanceCardBtn.appendChild(
                            StudentAttendanceCardBtnAddCancel
                          );
                        } else {
                          StudentAttendanceCardBtnIndicator.className =
                            "StudentAttendanceCardBtnIndicator";

                          StudentAttendanceCardBtnAddCancel.innerHTML = StudentAttendanceCardBtnAdd;

                          StudentAttendanceCardBtnAddCancel.addEventListener(
                            "click",
                            () => {
                              this.props.firebase
                                .studentLengthAttendance(
                                  this.state.fac_college_name,
                                  this.state.facAuthID,
                                  current_facultySub_key,
                                  subStuKey
                                )
                                .update({
                                  attendance: "present",
                                })
                                .catch((error) => {
                                  console.log(error);
                                });
                            }
                          );

                          StudentAttendanceCardBtn.appendChild(
                            StudentAttendanceCardBtnAddCancel
                          );
                        }
                      });

                    this.StudentAttendanceCardMain.current.insertBefore(
                      StudentAttendanceCard,
                      this.StudentAttendanceCardLast.current
                    );
                  });

                this.setState({
                  facCardInfoObj: {
                    subject,
                    current_facultySub_key,
                    department,
                    semester,
                    division,
                    shift,
                  },
                });

                this.props.firebase
                  .facultySubjects(
                    this.state.facAuthID,
                    this.state.fac_college_name
                  )
                  .child(current_facultySub_key)
                  .update({
                    random_access: {
                      access_boolean: true,
                      random_number: this.state.randomNumber,
                    },
                  })

                  .catch((error) => {
                    console.log(error);
                  });

                alert(
                  "Please make sure that you do not refresh your page untill you're done taking everyone's attendance, otherwise you'll lose all of your records."
                );
              } else {
                alert("Wrong Access Code! Try Again.");
              }
            }
          );

          classCardMainSideStrapsDeleteBtn.addEventListener("click", () => {
            window.location.reload(true);
            this.props.firebase
              .facultySubjects(
                this.state.facAuthID,
                this.state.fac_college_name
              )
              .child(`${current_facultySub_key}`)
              .remove();
          });

          classCardMainFacSection.appendChild(classCardMain);
          classCardMain.appendChild(classCardMainSideStraps);
          classCardMain.appendChild(classCardMainSideStrapsDelete);
          classCardMain.appendChild(classCardMainInfo);
          classCardMainInfo.appendChild(classCardMainInfoSub);
          classCardMainInfo.appendChild(classCardMainInfoDept);
          classCardMainInfo.appendChild(classCardMainInfoSDShift);
          classCardMainInfoSDShift.appendChild(classCardMainInfoSem);
          classCardMainInfoSDShift.appendChild(classCardMainInfoDiv);
          classCardMainInfoSDShift.appendChild(classCardMainInfoShift);

          classCardMainSideStraps.appendChild(
            classCardMainSideStrapsGenerateBtn
          );
          classCardMainSideStrapsGenerateBtnRandom.appendChild(
            classCardMainSideStrapsGenerateBtnRandomNext
          );
          classCardMainSideStrapsGenerateBtnRandom.appendChild(
            classCardMainSideStrapsGenerateBtnRandomAgain
          );

          classCardMainSideStrapsGenerateBtn.append("Generate a Random PIN");

          classCardMainInfoSub.textContent = `${subject}`;
          classCardMainInfoDept.textContent = department;
          classCardMainInfoSem.textContent = `Sem(${semester}) - `;
          classCardMainInfoDiv.textContent = `Div(${division}) - `;
          classCardMainInfoShift.textContent = `Shift(${shift})`;

          this.classCardMainFacStuSection.current.appendChild(
            classCardMainFacSection
          );
        });
    } else if (this.state.authUser.role === "Student") {
      this.setState({ StudentAttendanceCheckToggle: false });

      this.props.firebase
        .studentSubjects(stu_college_name)
        .orderByKey()
        .on("child_added", (snapshot) => {
          var FacKey = snapshot.key;

          this.props.firebase
            .facultySubjects(FacKey, stu_college_name)
            .on("child_added", (snapshot) => {
              // console.log(snapshot.val());

              if (
                snapshot.val().department === stu_dept &&
                snapshot.val().semester === stu_sem &&
                snapshot.val().division === stu_div &&
                snapshot.val().shift === stu_shift
              ) {
                var cardDeptInfo = snapshot.val().department;
                var StuSubject = snapshot.val().subject;
                var SubFacName = snapshot.val().fname;
                var SubFacKey = snapshot.key;
                // console.log(SubFacKey);

                this.setState({
                  stuCardInfoObj: {
                    StuSubject,
                    SubFacName,
                    cardDeptInfo,
                    SubFacKey,
                    FacKey,
                  },
                });
                const { stuCardInfoObj } = this.state;

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

                classCardMain.addEventListener("click", () => {
                  this.props.firebase
                    .facultySubjects(
                      stuCardInfoObj.FacKey,
                      this.state.fac_college_name
                    )
                    .child(`${stuCardInfoObj.SubFacKey}/random_access`)
                    .once("value", (snapshot) => {
                      const fetchrandomno = snapshot.val();
                      const stufetchrandomno = prompt("Enter your Access code");

                      if (
                        parseInt(stufetchrandomno) ===
                          fetchrandomno.random_number &&
                        fetchrandomno.access_boolean === true
                      ) {
                        this.props.firebase
                          .studentLengthAttendance(
                            this.state.fac_college_name,
                            stuCardInfoObj.FacKey,
                            stuCardInfoObj.SubFacKey,
                            this.state.stu_uid
                          )
                          .once("value", (snapshot) => {
                            var subStudents = snapshot.val();
                            this.setState({
                              StudentAttendanceCheckAgain:
                                subStudents.attendance,
                            });

                            if (
                              this.state.StudentAttendanceCheckAgain ===
                              "absent"
                            ) {
                              this.currentTime();

                              this.props.firebase
                                .studentLength(
                                  this.state.fac_college_name,
                                  stuCardInfoObj.FacKey,
                                  stuCardInfoObj.SubFacKey
                                )
                                .orderByKey()
                                .on("value", (snapshot) => {
                                  var subStuLength = snapshot.numChildren();
                                  this.setState({ stuLength: subStuLength });
                                  let liveSubStuLength = 0;

                                  // console.log(snapshot.val());
                                  var subStudents = snapshot.val();
                                  for (var substu in subStudents) {
                                    if (
                                      subStudents[substu].attendance ===
                                      "present"
                                    ) {
                                      liveSubStuLength = liveSubStuLength + 1;
                                    }
                                  }
                                  this.setState({
                                    liveSubStuLength: liveSubStuLength,
                                  });
                                });

                              this.props.firebase
                                .studentLength(
                                  this.state.fac_college_name,
                                  stuCardInfoObj.FacKey,
                                  stuCardInfoObj.SubFacKey
                                )
                                .orderByKey()
                                .on("child_added", (snapshot) => {
                                  const subStuKey = snapshot.key;
                                  this.setState({ subStuKey: subStuKey });

                                  var subStuInfo = snapshot.val();

                                  var studsCardEnrolNo = subStuInfo.stu_enrolno;
                                  var studsCardName = subStuInfo.stu_name;

                                  var StudentAttendanceCard = document.createElement(
                                    "div"
                                  );
                                  var StudentAttendanceCardInfo = document.createElement(
                                    "div"
                                  );
                                  var StudentAttendanceCardInfoEnrolNo = document.createElement(
                                    "div"
                                  );
                                  var StudentAttendanceCardInfoName = document.createElement(
                                    "div"
                                  );
                                  var StudentAttendanceCardBtn = document.createElement(
                                    "div"
                                  );

                                  var StudentAttendanceCardBtnIndicator = document.createElement(
                                    "div"
                                  );

                                  StudentAttendanceCard.className =
                                    "StudentAttendanceCard";
                                  StudentAttendanceCardInfo.className =
                                    "StudentAttendanceCardInfo";
                                  StudentAttendanceCardInfoEnrolNo.className =
                                    "StudentAttendanceCardInfoEnrolNo";
                                  StudentAttendanceCardInfoName.className =
                                    "StudentAttendanceCardInfoNameHide";
                                  StudentAttendanceCardBtn.className =
                                    "StudentAttendanceCardBtn";
                                  StudentAttendanceCardBtnIndicator.className =
                                    "StudentAttendanceCardBtnIndicator";

                                  StudentAttendanceCard.appendChild(
                                    StudentAttendanceCardInfo
                                  );
                                  StudentAttendanceCard.appendChild(
                                    StudentAttendanceCardBtn
                                  );

                                  StudentAttendanceCardInfo.appendChild(
                                    StudentAttendanceCardInfoEnrolNo
                                  );
                                  StudentAttendanceCardInfo.appendChild(
                                    StudentAttendanceCardInfoName
                                  );

                                  StudentAttendanceCardBtn.appendChild(
                                    StudentAttendanceCardBtnIndicator
                                  );

                                  if (
                                    studsCardEnrolNo === this.state.stu_enrolno
                                  ) {
                                    studsCardEnrolNo = "You";
                                  }

                                  StudentAttendanceCardInfoEnrolNo.append(
                                    studsCardEnrolNo
                                  );
                                  StudentAttendanceCardInfoName.append(
                                    studsCardName
                                  );

                                  StudentAttendanceCard.addEventListener(
                                    "click",
                                    () => {
                                      this.setState((prevState) => {
                                        return {
                                          StudentAttendanceCardInfo: !prevState.StudentAttendanceCardInfo,
                                        };
                                      });

                                      if (
                                        this.state.StudentAttendanceCardInfo
                                      ) {
                                        StudentAttendanceCardInfoEnrolNo.className =
                                          "StudentAttendanceCardInfoEnrolNoHide";
                                        StudentAttendanceCardInfoName.className =
                                          "StudentAttendanceCardInfoName";
                                      } else {
                                        StudentAttendanceCardInfoEnrolNo.className =
                                          "StudentAttendanceCardInfoEnrolNo";
                                        StudentAttendanceCardInfoName.className =
                                          "StudentAttendanceCardInfoNameHide";
                                      }
                                    }
                                  );

                                  this.StudentAttendanceCardMain.current.insertBefore(
                                    StudentAttendanceCard,
                                    this.StudentAttendanceCardLast.current
                                  );

                                  this.props.firebase
                                    .studentLengthAttendance(
                                      this.state.fac_college_name,
                                      stuCardInfoObj.FacKey,
                                      stuCardInfoObj.SubFacKey,
                                      this.state.subStuKey
                                    )
                                    .on("value", (snapshot) => {
                                      if (
                                        snapshot.val().attendance === "present"
                                      ) {
                                        StudentAttendanceCardBtnIndicator.className =
                                          "StudentAttendanceCardBtnIndicatorOn";
                                      } else if (
                                        snapshot.val().attendance === "absent"
                                      ) {
                                        StudentAttendanceCardBtnIndicator.className =
                                          "StudentAttendanceCardBtnIndicator";
                                      }
                                    });
                                });

                              this.setState({
                                stuCardInfoObj: {
                                  SubFacKey: stuCardInfoObj.SubFacKey,
                                  FacKey: stuCardInfoObj.FacKey,
                                },
                              });
                              this.setState({
                                scanningCardToggle: true,
                                isToggle: true,
                                /*To blur the whole background */
                              });
                            } else if (
                              this.state.StudentAttendanceCheckAgain ===
                              "present"
                            ) {
                              alert(
                                "You've already submitted your attendance once."
                              );
                            } else {
                              alert("Something is Wrong!");
                            }
                          });
                      } else {
                        alert("Wrong Access code! Try Again.");
                      }
                    });
                });
              }
            });
        });
    }
  }

  currentTimeSetTimeout = () => {
    setTimeout(this.currentTime, 500);
  };

  checkTime = (i) => {
    if (i < 10) {
      i = "0" + i;
    } // add zero in front of numbers < 10
    return i;
  };

  currentTime = () => {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    h = this.checkTime(h);
    m = this.checkTime(m);
    s = this.checkTime(s);
    var timeStyle = h + ":" + m + ":" + s;
    this.setState({ time: timeStyle });
    this.currentTimeSetTimeout();
  };

  onEditBarDelBtnIcon = () => {
    this.setState({
      classCardMainSideStrapsDeleteToggle: !this.state
        .classCardMainSideStrapsDeleteToggle,
    });
  };

  onEditBarEditBtnIcon = () => {
    alert("Work in Progress!");
  };

  AttendeesExitBtn = () => {
    if (this.state.authUser.role === "Faculty") {
      if (
        prompt(
          "Enter 'Exit' & Press OK to EXIT! (Note: You won't be able to record other students' attendance anymore once you go ahead.",
          "Exit"
        ) === "Exit"
      ) {
        const { facCardInfoObj } = this.state;

        this.props.firebase
          .facultySubjects(this.state.facAuthID, this.state.fac_college_name)
          .child(facCardInfoObj.current_facultySub_key)
          .update({
            random_access: {
              access_boolean: false,
              random_number: 0,
            },
          })
          .catch((error) => {
            console.log(error);
          });

        window.location.reload(true);
        this.props.history.push(ROUTES.CLASSROOM);
      }
    }

    if (this.state.authUser.role === "Student") {
      window.location.reload(true);
      this.props.history.push(ROUTES.CLASSROOM);
    }
  };

  AttendeesDBAddBtn = () => {
    if (this.state.authUser.role === "Faculty") {
      if (
        prompt(
          "Enter 'Y' & Press OK to move forward! (Note: You won't be able to record other students' attendance anymore once you go ahead.",
          "Y"
        ) === "Y"
      ) {
        const { facCardInfoObj } = this.state;

        this.props.firebase
          .studentLength(
            this.state.fac_college_name,
            this.state.facAuthID,
            facCardInfoObj.current_facultySub_key
          )
          .orderByKey()
          .on("child_added", (snapshot) => {
            var subStuKey = snapshot.key;

            this.props.firebase
              .studentLengthAttendance(
                this.state.fac_college_name,
                this.state.facAuthID,
                facCardInfoObj.current_facultySub_key,
                subStuKey
              )
              .on("value", (snapshot) => {
                var stuAttendance = snapshot.val().attendance;
                var stuEnNo = snapshot.val().stu_enrolno;
                var stuName = snapshot.val().stu_name;

                this.props.firebase
                  .facultySubjects(
                    this.state.facAuthID,
                    this.state.fac_college_name
                  )
                  .child(
                    `${facCardInfoObj.current_facultySub_key}/attendees/${this.state.date}/${this.state.randomNumber}`
                  )
                  .push({
                    stuAttendance,
                    stuEnNo,
                    stuName,
                  });
              });
          });

        window.location.reload(true);
      }
    }

    //You can not update attendance to absent in this fun. as it will make absent every students even in the pdf.
  };

  PDFExportPresent = () => {
    if (this.state.authUser.role === "Faculty") {
      if (
        prompt(
          "Enter 'Y' & Press OK to move forward! (Note: You won't be able to record other students' attendance anymore once you go ahead.",
          "Y"
        ) === "Y"
      ) {
        const { facCardInfoObj } = this.state;

        this.props.firebase
          .studentLength(
            this.state.fac_college_name,
            this.state.facAuthID,
            facCardInfoObj.current_facultySub_key
          )
          .orderByKey()
          .on("child_added", (snapshot) => {
            var subStuKey = snapshot.key;

            this.props.firebase
              .studentLengthAttendance(
                this.state.fac_college_name,
                this.state.facAuthID,
                facCardInfoObj.current_facultySub_key,
                subStuKey
              )
              .on("value", (snapshot) => {
                var stuAttendance = snapshot.val().attendance;
                var stuEnNo = snapshot.val().stu_enrolno;
                var stuName = snapshot.val().stu_name;

                this.props.firebase
                  .facultySubjects(
                    this.state.facAuthID,
                    this.state.fac_college_name
                  )
                  .child(
                    `${facCardInfoObj.current_facultySub_key}/attendees/${this.state.date}/${this.state.randomNumber}`
                  )
                  .push({
                    stuAttendance,
                    stuEnNo,
                    stuName,
                  });
              });
          });

        this.pdfExportComponent.save();
        window.location.reload(true);
      }
    }

    //You can not update attendance to absent in this fun. as it will make absent every students even in the pdf.
  };

  PDFExportAbsent = () => {
    if (this.state.authUser.role === "Faculty") {
      if (
        prompt(
          "Enter 'Y' & Press OK to move forward! (Note: You won't be able to record other students' attendance anymore once you go ahead.",
          "Y"
        ) === "Y"
      ) {
        const { facCardInfoObj } = this.state;

        this.props.firebase
          .studentLength(
            this.state.fac_college_name,
            this.state.facAuthID,
            facCardInfoObj.current_facultySub_key
          )
          .orderByKey()
          .on("child_added", (snapshot) => {
            var subStuKey = snapshot.key;

            this.props.firebase
              .studentLengthAttendance(
                this.state.fac_college_name,
                this.state.facAuthID,
                facCardInfoObj.current_facultySub_key,
                subStuKey
              )
              .on("value", (snapshot) => {
                var stuAttendance = snapshot.val().attendance;
                var stuEnNo = snapshot.val().stu_enrolno;
                var stuName = snapshot.val().stu_name;

                this.props.firebase
                  .facultySubjects(
                    this.state.facAuthID,
                    this.state.fac_college_name
                  )
                  .child(
                    `${facCardInfoObj.current_facultySub_key}/attendees/${this.state.date}/${this.state.randomNumber}`
                  )
                  .push({
                    stuAttendance,
                    stuEnNo,
                    stuName,
                  });
              });
          });

        this.pdfExportComponent.save();
        window.location.reload(true);
      }
    }
    //You can not update attendance to absent in this fun. as it will make absent every students even in the pdf.  };
  };

  onIDCardClick = () => {
    alert("Work in Progress!");
  };

  _onDetected = (result) => {
    this.setState({
      resultBarcode: result.codeResult.code,
      onScanAlternativeToggle: false,
      barcodeSuccessFailToggle: false,
    });
  };

  _scanningCardClose = () => {
    this.setState({
      scanningCardToggle: false,
      isToggle: false,
      resultBarcode: 0,
      barcodeSuccessFailToggle: false,
    });
  };
  _onScanAlternative = () => {
    this.setState({
      resultBarcode: 1,
      onScanAlternativeToggle: true,
      barcodeSuccessFailToggle: false,
    });
  };

  _onReScan = () => {
    this.setState({
      resultBarcode: 0,
    });
  };

  _onConfirm = () => {
    if (
      this.state.resultBarcode === this.state.stu_enrolno ||
      this.state.alt_enrolment_no === this.state.stu_enrolno
    ) {
      this.setState({ StudentAttendanceCheckToggle: true });

      const { stuCardInfoObj } = this.state;

      this.props.firebase
        .studentLengthAttendance(
          this.state.fac_college_name,
          stuCardInfoObj.FacKey,
          stuCardInfoObj.SubFacKey,
          this.state.stu_uid
        )
        .update({
          attendance: "present",
        })
        .then(() => {
          this.setState({ scanningCardToggle: false, isToggle: false });
          alert("You've successfully recorded your attendance!");
        });
    } else {
      this.setState({ barcodeSuccessFailToggle: true });
    }
  };

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

  hamburgerToggle = () => {
    this.setState({ isToggleHamburger: !this.state.isToggleHamburger });
  };

  StudentAttendanceCardInfo = () => {
    this.setState({
      StudentAttendanceCardInfo: !this.state.StudentAttendanceCardInfo,
    });
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
      //To add the data of the subject
      const autoFacultySubKey = this.props.firebase
        .facultySubjects(this.state.facAuthID, fac_college_name)
        .push().key;

      this.props.firebase
        .facultySubjects(this.state.authUser.uid, this.state.fac_college_name)
        .child(autoFacultySubKey)
        .set({
          department,
          subject,
          semester,
          division,
          shift,
          fname: fac_name,
        })
        .then(() => {
          this.setState({
            isToggle: !this.state.isToggle,
            isHide: false,
            isHideLast: 0,
            department: "",
            subject: "",
            semester: "",
            division: "",
            shift: "",
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("Please Submit All your fields Properly!");
    }
  };

  onFeedbackClick = () => {
    alert(
      "Send me your feedback on this email address => tirthpatel5885@gmail.com"
    );
  };

  onClickRecordsLi = () => {
    this.props.history.push(ROUTES.RECORDS);
    window.location.reload(true);
  };

  render() {
    const {
      department,
      subject,
      semester,
      division,
      shift,
      alt_enrolment_no,
    } = this.state;
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
                  type="button"
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
              <div
                className="EditBarBgShapeLeft"
                onClick={this.onEditBarEditBtnIcon}
              >
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

              <div
                className={
                  this.state.classCardMainSideStrapsDeleteToggle
                    ? "EditBarBgShapeRight EditBarBgShapeRightActive"
                    : "EditBarBgShapeRight"
                }
                onClick={this.onEditBarDelBtnIcon}
              >
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
            <div className="classListSectionhamburgerNav">
              <div
                onClick={this.hamburgerToggle}
                className={
                  !this.state.isToggleHamburger
                    ? "classListHamburger"
                    : "classListHamburger classListHamburgerOpen"
                }
              >
                <span className="classListHamburgerLineOne"></span>
                <span className="classListHamburgerLineTwo"></span>
                <span className="classListHamburgerLineThree"></span>
              </div>
              <div
                className={
                  !this.state.isToggleHamburger
                    ? "classListNavBarSlider"
                    : "classListNavBarSlider classListNavBarSliderSlide"
                }
              >
                <div
                  onClick={this.hamburgerToggle}
                  className={
                    !this.state.isToggleHamburger
                      ? "classListHamburgerClose"
                      : "classListHamburgerClose classListHamburgerOpen"
                  }
                >
                  <FontAwesomeIcon
                    icon="plus"
                    style={{
                      transform: `rotate(45deg)`,
                      fontSize: `20px`,
                      color: `#8d8d8d`,
                    }}
                  />
                </div>
                <div className="classListNavBarBanner">
                  <div className="classListNavBarBannerImg">
                    <img src={FacultyImg} alt="classListNavBarBannerImg" />
                  </div>
                  <div className="classListNavBarBannerHeader">
                    <p>{this.state.profile_name}</p>
                  </div>
                </div>
                <div className="classListNavBarNavList">
                  <ul>
                    <Link to={ROUTES.HOME} style={{ textDecoration: `none` }}>
                      <li>Classroom</li>
                    </Link>
                    <Link
                      className="classListNavBarNavListLinkProfile"
                      to={ROUTES.PROFILE}
                      style={{ textDecoration: `none` }}
                    >
                      <li>Profile</li>
                    </Link>
                    {this.state.authUser.role === "Faculty" && (
                      <li onClick={this.onClickRecordsLi}>Records</li>
                    )}
                    {this.state.authUser.role === "Student" && (
                      <li onClick={this.onIDCardClick}>ID Card</li>
                    )}
                    <li onClick={this.onFeedbackClick}>Feedback</li>
                    <li onClick={this.props.firebase.doSignOut}>Log Out</li>
                  </ul>
                </div>
              </div>
            </div>
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
          ></div>
        </div>

        {this.state.scanningCardToggle && (
          <div className="barCodeScannerMain">
            <div
              className="cardScanningHamburgerClose"
              onClick={this._scanningCardClose}
            >
              <div className="classListHamburgerLineOneClose"></div>
              <div className="classListHamburgerLineTwoClose"></div>
            </div>
            {this.state.resultBarcode === 0 ? (
              <div className="barCodeScanner">
                <h2>Scan Your ID Card</h2>
                <Scanner onDetected={this._onDetected} />
                <div
                  className="barCodeScannerAlternative"
                  onClick={this._onScanAlternative}
                >
                  Having trouble in Scanning?
                </div>
              </div>
            ) : !this.state.barcodeSuccessFailToggle ? (
              this.state.onScanAlternativeToggle ? (
                <div className="afterResultDetectedDiv barCodeScanner">
                  <input
                    type="number"
                    name="alt_enrolment_no"
                    value={alt_enrolment_no}
                    onChange={this.onChange}
                    className="onScanAlternativeInput"
                    placeholder="Enter your Enrolment No."
                  />
                  <div className="barcodeResultOptions">
                    <div
                      className="barcodeResultOptionsReScan"
                      onClick={this._onReScan}
                    >
                      Scan
                    </div>
                    <div
                      className="barcodeResultOptionsConfirm"
                      onClick={this._onConfirm}
                    >
                      Confirm
                    </div>
                  </div>
                </div>
              ) : (
                <div className="afterResultDetectedDiv barCodeScanner">
                  <div className="barcodeResultOptions">
                    <div
                      className="barcodeResultOptionsReScan"
                      onClick={this._onReScan}
                    >
                      Re-Scan
                    </div>
                    <div
                      className="barcodeResultOptionsConfirm"
                      onClick={this._onConfirm}
                    >
                      Confirm
                    </div>
                  </div>

                  <Result result={this.state.resultBarcode} />
                </div>
              )
            ) : (
              <div className="barcodeFail">
                <div className="barcodeFailGIF">
                  <img
                    src={SomethingWrongGIF}
                    style={{
                      borderRadius: `8px`,
                      width: `100%`,
                      height: `100%`,
                    }}
                    alt="Something Went Wrong GIF"
                  />
                </div>
                <div className="barcodeFailNextBtn" onClick={this._onReScan}>
                  <FontAwesomeIcon icon="undo" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attendees Section */}

        <PDFExport
          //es6 way to give reference
          ref={(component) => (this.pdfExportComponent = component)}
          paperSize="auto"
          margin={40}
          fileName={`Attendance Report`}
        >
          <div
            className={
              this.state.StudentAttendanceCheckToggle
                ? "AttendeeBaseMain"
                : "AttendeeBaseMainHide"
            }
          >
            <div className="AttendeeBaseMainHeader">
              <div className="AttendeeBaseMainHeaderContent">
                <p className="AttendeeBaseMainHeaderName">Attendees</p>
                <p className="AttendeeBaseMainHeaderDateInfo">
                  {this.state.dateStyle} &middot; {this.state.weekdayName}{" "}
                  &middot; {this.state.time}
                </p>
              </div>
              <div className="circleStudentsCount">
                <span
                  // ref={this.LiveSubStudentLength}
                  className="AttendeeBaseMainStudentCountTotalNo"
                >
                  {this.state.liveSubStuLength < 100
                    ? `0${this.state.liveSubStuLength}`
                    : this.state.liveSubStuLength}
                  {/* {this.state.stuLength < 100
                  ? this.state.stuLength < 10
                    ? `00${this.state.stuLength}`
                    : `0${this.state.stuLength}`
                  : this.state.stuLength}{" "}
                /{" "} */}
                </span>

                <span className="AttendeeBaseMainStudentCountAttendeesNo">
                  {" "}
                  /{" "}
                  {this.state.stuLength < 100
                    ? `0${this.state.stuLength}`
                    : this.state.stuLength}
                </span>
              </div>
            </div>

            <div className="AttendeeBaseMainContent">
              <div
                onScroll={this.onScrollStudentCard}
                ref={this.StudentAttendanceCardMain}
                className="StudentAttendanceCardMain"
              >
                {this.state.authUser.role === "Faculty" && (
                  <div
                    className="AttendeeBaseMainLeaveChoiceBtnDiv"
                    ref={this.StudentAttendanceCardLast}
                  >
                    <div
                      ref={this.StudentAttendanceCardPresentList}
                      onClick={this.PDFExportPresent}
                      className="AttendeeBaseMainPresentDownloadBtn"
                      style={{ fontWeight: `800` }}
                    >
                      {/* <FontAwesomeIcon icon="download" /> */}P
                    </div>
                    <div
                      ref={this.StudentAttendanceCardAbsentList}
                      onClick={this.PDFExportAbsent}
                      className="AttendeeBaseMainAbsentDownloadBtn"
                      style={{ fontWeight: `800` }}
                    >
                      {/* <FontAwesomeIcon icon="download" /> */}A
                    </div>
                    <div
                      className="AttendeeBaseMainAddDBBtn"
                      onClick={this.AttendeesDBAddBtn}
                    >
                      <FontAwesomeIcon icon="database" />
                    </div>
                    <div
                      className="AttendeeBaseMainExitBtn"
                      onClick={this.AttendeesExitBtn}
                    >
                      <FontAwesomeIcon icon="sign-out-alt" />
                    </div>
                  </div>
                )}

                {this.state.authUser.role === "Student" && (
                  <div
                    className="AttendeeBaseMainLeaveBtnDiv"
                    ref={this.StudentAttendanceCardLast}
                    onClick={this.AttendeesExitBtn}
                  >
                    <div className="AttendeeBaseMainLeaveBtn">
                      Leave the Classroom
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PDFExport>
      </div>
    );
  }
}

const ClassroomSectionMain = compose(
  withRouter,
  withFirebase
)(ClassroomSection);

export default Classroom;

export { ClassroomSectionMain };
