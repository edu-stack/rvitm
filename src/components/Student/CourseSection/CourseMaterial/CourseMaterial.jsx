import "./CourseMaterial.css";
import MaterialLinks from "./MaterialLinks";
import CourseTopNavbar from "../CourseTopNavbar";

const Material = MaterialLinks.map((data, index) => (
  <tr key={data.Subject} className={index % 2 === 0 ? '' : 'odd-row'}>
    <td>{data.Subject}</td>
    <td>
      <a style={{ textDecoration: 'none', color: 'black' }}>{data.StaffName}</a>
    </td>
    <td>
      <a href={data.GoogleSite} target="_blank" rel="noopener noreferrer">{data.abbriviation}</a>
    </td>
  </tr>
));

export default function CourseMaterial() {
  return (
    <>
      <CourseTopNavbar text={'Course Section'} />
      <h5 style={{ textAlign: "center", margin: "20px" }}>
        Course Material
      </h5>
      <div className="tt-container" style={{ marginBottom: '100px', margin: '10px' }}>
        <div className="CourseMaterial">
          <table className="responsive-table">
            <thead className="sticky-header">
              <tr>
                <th className="table-header" style={{ fontSize: '12px', backgroundColor: "#2f2f2f", color: 'white' }}>Subject</th>
                <th className="table-header" style={{ fontSize: '12px', backgroundColor: "#2f2f2f", color: 'white' }}>Faculty</th>
                <th className="table-header" style={{ fontSize: '12px', backgroundColor: "#2f2f2f", color: 'white' }}>Google Site</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '12px' }}>{Material}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
