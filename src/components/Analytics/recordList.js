import React, { Component } from "react";

import "./recordlist.css";

import { IonAlert } from "@ionic/react";

import { compose } from "recompose";
import { withFirebase } from "../Configuration";
import { withRouter } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PDFExport } from "@progress/kendo-react-pdf";

import * as ROUTES from "../../constants/routes";

class recordList extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      fac_college_name: JSON.parse(localStorage.getItem("authUser")).college,
      facAuthID: JSON.parse(localStorage.getItem("authUser")).uid,

      facName: JSON.parse(localStorage.getItem("authUser")).name,
      facDept: "",
      facDiv: "",
      facSub: "",
      facRoom: "",
      facShift: "",
      facSem: "",

      presentStu: 0,
      absentStu: 0,
      totalStu: 0,
      stuEnrollno: 0,
      stuName: "",

      showAlertConfirmationPDF: false,
      showAlertExitDoc: false,
      presentStudentsConfirmation: false,
      absentStudentsConfirmation: false,
      allStudentsConfirmation: true,
    };

    this.recordListSectionMainTableRow = React.createRef();
  }
  componentDidMount() {
    this._isMounted = true;

    if (this._isMounted) {
      var presentStu = 0;
      var absentStu = 0;

      this.props.firebase
        .facultySubjects(this.state.facAuthID, this.state.fac_college_name)
        .child(this.props.subkey)
        .on("value", (snapshot) => {
          if (this._isMounted) {
            this.setState({ facDept: snapshot.val().department.toLowerCase() });
            this.setState({ facDiv: snapshot.val().division });
            this.setState({ facSub: snapshot.val().subject });
            this.setState({ facRoom: snapshot.val().room });
            this.setState({ facShift: snapshot.val().shift });
            this.setState({ facSem: snapshot.val().semester });

            if (snapshot.val().shift === "No Shift (Has only one Shift)") {
              this.setState({ facShift: "No" });
            }
            if (snapshot.val().division === "Not Any") {
              this.setState({ facDiv: "No" });
            }

            if (this._isMounted) {
              this.props.firebase
                .facultySubjects(
                  this.state.facAuthID,
                  this.state.fac_college_name
                )
                .child(
                  `${this.props.subkey}/attendees/${this.props.facdate}/${this.props.facrandom}`
                )
                .on("value", (snapshot) => {
                  this.setState({ totalStu: snapshot.numChildren() });
                });
            }

            var srno = 0;
            this.props.firebase
              .facultySubjects(
                this.state.facAuthID,
                this.state.fac_college_name
              )
              .child(
                `${this.props.subkey}/attendees/${this.props.facdate}/${this.props.facrandom}`
              )
              .orderByChild("stuEnNo")
              .on("child_added", (snapshot) => {
                if (this._isMounted) {
                  var stuAttendance = snapshot.val().stuAttendance;

                  var stuEnNo = snapshot.val().stuEnNo;
                  var stuName = snapshot.val().stuName;

                  if (stuAttendance === "present") {
                    presentStu = presentStu + 1;
                  }
                  if (stuAttendance === "absent") {
                    absentStu = absentStu + 1;
                  }

                  var recordListSectionMainTableRow = document.createElement(
                    "tr"
                  );
                  var recordListSectionMainTableRowSr = document.createElement(
                    "td"
                  );
                  var recordListSectionMainTableRowName = document.createElement(
                    "td"
                  );
                  var recordListSectionMainTableRowEn = document.createElement(
                    "td"
                  );

                  if (stuAttendance === "absent") {
                    recordListSectionMainTableRow.className =
                      "redColorAbsentIndicatorTr";
                    recordListSectionMainTableRowSr.className =
                      "redColorAbsentIndicatorTd";
                    recordListSectionMainTableRowName.className =
                      "redColorAbsentIndicatorTd";
                    recordListSectionMainTableRowEn.className =
                      "redColorAbsentIndicatorTd";
                  }

                  recordListSectionMainTableRow.appendChild(
                    recordListSectionMainTableRowSr
                  );
                  recordListSectionMainTableRow.appendChild(
                    recordListSectionMainTableRowName
                  );
                  recordListSectionMainTableRow.appendChild(
                    recordListSectionMainTableRowEn
                  );

                  recordListSectionMainTableRowSr.append(`${srno + 1}.`);
                  srno = srno + 1;

                  recordListSectionMainTableRowName.append(stuName);
                  recordListSectionMainTableRowEn.append(stuEnNo);

                  this.recordListSectionMainTableRow.current.appendChild(
                    recordListSectionMainTableRow
                  );

                  if (
                    this.state.presentStudentsConfirmation &&
                    stuAttendance === "present"
                  ) {
                    console.log("p");
                    this.recordListSectionMainTableRowPresent.appendChild(
                      recordListSectionMainTableRow
                    );
                  }

                  if (
                    this.state.absentStudentsConfirmation &&
                    stuAttendance === "absent"
                  ) {
                    this.recordListSectionMainTableRowAbsent.appendChild(
                      recordListSectionMainTableRow
                    );
                  }
                }
              });

            this.setState({ presentStu: presentStu });
            this.setState({ absentStu: absentStu });
          }
        });
    }
  }

  recordListSectionMainExitBtn = () => {
    this.setState({ showAlertExitDoc: true });
  };

  exportPDF = () => {
    this.setState({
      allStudentsConfirmation: true,
      showAlertConfirmationPDF: true,
    });
  };

  PDFExportAbsent = () => {
    this.setState({
      absentStudentsConfirmation: true,
      showAlertConfirmationPDF: true,
    });
  };

  PDFExportPresent = () => {
    this.setState({
      presentStudentsConfirmation: true,
      showAlertConfirmationPDF: true,
    });
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <div className="recordListSectionMain">
        <IonAlert
          isOpen={
            this.state.showAlertConfirmationPDF || this.state.showAlertExitDoc
          }
          onDidDismiss={() =>
            this.setState({
              showAlertConfirmationPDF: false,
              showAlertExitDoc: false,
            })
          }
          header={"Confirmation"}
          message={
            this.state.showAlertConfirmationPDF
              ? "Are you sure you want to download the PDF?"
              : "Are you sure you want to exit?"
          }
          buttons={[
            {
              text: "No",
              role: "cancel",
              cssClass: "secondary",
            },
            {
              text: "Yes",
              handler: () => {
                if (this.state.showAlertConfirmationPDF) {
                  var srno = 0;

                  if (this.state.presentStudentsConfirmation) {
                    this.setState({ allStudentsConfirmation: false });

                    this.props.firebase
                      .facultySubjects(
                        this.state.facAuthID,
                        this.state.fac_college_name
                      )
                      .child(
                        `${this.props.subkey}/attendees/${this.props.facdate}/${this.props.facrandom}`
                      )
                      .orderByChild("stuEnNo")
                      .on("child_added", (snapshot) => {
                        if (this._isMounted) {
                          var stuAttendance = snapshot.val().stuAttendance;
                          if (
                            this.state.presentStudentsConfirmation &&
                            stuAttendance === "present"
                          ) {
                            var stuEnNo = snapshot.val().stuEnNo;
                            var stuName = snapshot.val().stuName;

                            var recordListSectionMainTableRow = document.createElement(
                              "tr"
                            );
                            var recordListSectionMainTableRowSr = document.createElement(
                              "td"
                            );
                            var recordListSectionMainTableRowName = document.createElement(
                              "td"
                            );
                            var recordListSectionMainTableRowEn = document.createElement(
                              "td"
                            );

                            if (stuAttendance === "absent") {
                              recordListSectionMainTableRow.className =
                                "redColorAbsentIndicatorTr";
                              recordListSectionMainTableRowSr.className =
                                "redColorAbsentIndicatorTd";
                              recordListSectionMainTableRowName.className =
                                "redColorAbsentIndicatorTd";
                              recordListSectionMainTableRowEn.className =
                                "redColorAbsentIndicatorTd";
                            }

                            recordListSectionMainTableRow.appendChild(
                              recordListSectionMainTableRowSr
                            );
                            recordListSectionMainTableRow.appendChild(
                              recordListSectionMainTableRowName
                            );
                            recordListSectionMainTableRow.appendChild(
                              recordListSectionMainTableRowEn
                            );

                            recordListSectionMainTableRowSr.append(
                              `${srno + 1}.`
                            );
                            srno = srno + 1;

                            recordListSectionMainTableRowName.append(stuName);
                            recordListSectionMainTableRowEn.append(stuEnNo);

                            this.recordListSectionMainTableRowPresent.appendChild(
                              recordListSectionMainTableRow
                            );
                          }
                        }
                      });
                    this.pdfExportComponent.save();
                    window.location.reload(false);
                  } else if (this.state.absentStudentsConfirmation) {
                    this.setState({ allStudentsConfirmation: false });

                    this.props.firebase
                      .facultySubjects(
                        this.state.facAuthID,
                        this.state.fac_college_name
                      )
                      .child(
                        `${this.props.subkey}/attendees/${this.props.facdate}/${this.props.facrandom}`
                      )
                      .orderByChild("stuEnNo")
                      .on("child_added", (snapshot) => {
                        if (this._isMounted) {
                          var stuAttendance = snapshot.val().stuAttendance;
                          if (
                            this.state.absentStudentsConfirmation &&
                            stuAttendance === "absent"
                          ) {
                            var stuEnNo = snapshot.val().stuEnNo;
                            var stuName = snapshot.val().stuName;

                            var recordListSectionMainTableRow = document.createElement(
                              "tr"
                            );
                            var recordListSectionMainTableRowSr = document.createElement(
                              "td"
                            );
                            var recordListSectionMainTableRowName = document.createElement(
                              "td"
                            );
                            var recordListSectionMainTableRowEn = document.createElement(
                              "td"
                            );

                            if (stuAttendance === "absent") {
                              recordListSectionMainTableRow.className =
                                "redColorAbsentIndicatorTr";
                              recordListSectionMainTableRowSr.className =
                                "redColorAbsentIndicatorTd";
                              recordListSectionMainTableRowName.className =
                                "redColorAbsentIndicatorTd";
                              recordListSectionMainTableRowEn.className =
                                "redColorAbsentIndicatorTd";
                            }

                            recordListSectionMainTableRow.appendChild(
                              recordListSectionMainTableRowSr
                            );
                            recordListSectionMainTableRow.appendChild(
                              recordListSectionMainTableRowName
                            );
                            recordListSectionMainTableRow.appendChild(
                              recordListSectionMainTableRowEn
                            );

                            recordListSectionMainTableRowSr.append(
                              `${srno + 1}.`
                            );
                            srno = srno + 1;

                            recordListSectionMainTableRowName.append(stuName);
                            recordListSectionMainTableRowEn.append(stuEnNo);

                            this.recordListSectionMainTableRowAbsent.appendChild(
                              recordListSectionMainTableRow
                            );
                          }
                        }
                      });

                    this.pdfExportComponent.save();
                    window.location.reload(false);
                  } else if (this.state.allStudentsConfirmation) {
                    this.pdfExportComponent.save();
                    window.location.reload(false);
                  }
                } else if (this.state.showAlertExitDoc) {
                  this.props.history.push(ROUTES.ANALYTICS);
                  window.location.reload(true);
                }
              },
            },
          ]}
        />

        <PDFExport
          //es6 way to give reference
          ref={(component) => (this.pdfExportComponent = component)}
          paperSize="auto"
          margin={40}
          fileName={`Attendance Report of ${this.state.facSub} (${
            this.props.facdate.toString().slice(0, 2) +
            "_" +
            this.props.facdate.toString().slice(2, 4) +
            "_" +
            this.props.facdate.toString().slice(4)
          })`}
        >
          <div className="recordListPDFInfoMain" id="divToPrint">
            <div className="recordListPDFInfo">
              <div className="recordListSectionMainInfo">
                <div className="recordListSectionMainInfoDR">
                  <div className="recordListSectionMainInfoDate">
                    <p>Date: </p>
                    <p style={{ marginLeft: `6px` }}>
                      {this.props.facdate.toString().slice(0, 2) +
                        "/" +
                        this.props.facdate.toString().slice(2, 4) +
                        "/" +
                        this.props.facdate.toString().slice(4)}
                    </p>
                  </div>
                  <div className="recordListSectionMainInfoRandom">
                    <p>Random No.: </p>
                    <p style={{ marginLeft: `6px` }}>{this.props.facrandom}</p>
                  </div>
                  <div className="recordListSectionMainInfoRoom">
                    <p>Room: </p>
                    <p style={{ marginLeft: `6px` }}>{this.state.facRoom}</p>
                  </div>
                </div>
                <div className="recordListSectionMainInfoClg">
                  {this.state.fac_college_name}
                </div>
                <div className="recordListSectionMainInfoRest">
                  <div className="recordListSectionMainInfoDSDS">
                    <div className="recordListSectionMainInfoFac">
                      <p>Faculty Name: </p>
                      <p style={{ marginLeft: `6px` }}>{this.state.facName}</p>
                    </div>
                    <div className="recordListSectionMainInfoDept">
                      <p>Department: </p>
                      <p
                        style={{
                          marginLeft: `6px`,
                          textTransform: `capitalize`,
                        }}
                      >
                        {this.state.facDept}
                      </p>
                    </div>
                    <div className="recordListSectionMainInfoSub">
                      <p>Subject: </p>
                      <p style={{ marginLeft: `6px` }}>{this.state.facSub}</p>
                    </div>
                    <div className="recordListSectionMainInfoSemDivShift">
                      <p>Semester/Division/Shift: </p>
                      <p
                        style={{ marginLeft: `6px` }}
                      >{`${this.state.facSem}/${this.state.facDiv}/${this.state.facShift}`}</p>
                    </div>
                  </div>
                  <div className="recordListSectionMainInfoTPA">
                    <div className="recordListSectionMainInfoTotal">
                      <p>Total Students: </p>
                      <p style={{ marginLeft: `6px` }}>{this.state.totalStu}</p>
                    </div>
                    <div className="recordListSectionMainInfoPresent">
                      <p>Present: </p>
                      <p style={{ marginLeft: `6px` }}>
                        {this.state.presentStu}
                      </p>
                    </div>
                    <div className="recordListSectionMainInfoAbsent">
                      <p>Absent:</p>
                      <p style={{ marginLeft: `6px` }}>
                        {this.state.absentStu}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Sr.</th>
                    <th>Name</th>
                    <th>Enrollment No.</th>
                  </tr>
                </thead>

                {this.state.allStudentsConfirmation && (
                  <tbody ref={this.recordListSectionMainTableRow}></tbody>
                )}

                {this.state.presentStudentsConfirmation && (
                  <tbody
                    ref={(present) =>
                      (this.recordListSectionMainTableRowPresent = present)
                    }
                  ></tbody>
                )}

                {this.state.absentStudentsConfirmation && (
                  <tbody
                    ref={(absent) =>
                      (this.recordListSectionMainTableRowAbsent = absent)
                    }
                  ></tbody>
                )}
              </table>
            </div>
          </div>
        </PDFExport>
        <div className="recordListSectionMainEPBtn">
          <div
            // ref={this.StudentAttendanceCardPresentList}
            onClick={this.PDFExportPresent}
            className="recordListSectionMainPresentBtn"
            style={{ fontWeight: `800` }}
          >
            P
          </div>
          <div
            // ref={this.StudentAttendanceCardAbsentList}
            onClick={this.PDFExportAbsent}
            className="recordListSectionMainAbsentBtn"
            style={{ fontWeight: `800` }}
          >
            A
          </div>
          <div
            className="recordListSectionMainPrintBtn"
            onClick={this.exportPDF}
          >
            <FontAwesomeIcon icon="print" />
          </div>
          <div
            className="recordListSectionMainExitBtn"
            onClick={this.recordListSectionMainExitBtn}
          >
            <FontAwesomeIcon icon="sign-out-alt" />
          </div>
        </div>
      </div>
    );
  }
}

const recordListWithFire = compose(withFirebase, withRouter)(recordList);

export default recordListWithFire;
