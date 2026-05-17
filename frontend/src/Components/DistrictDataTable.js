import React from "react";
import { Table, ProgressBar } from "react-bootstrap";

// 1. Pre-define all 25 districts of Sri Lanka
const ALL_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", 
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", 
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", 
  "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", 
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const DistrictDataTable = ({ locations }) => {
  const summary = {};
  let maxCultivation = 0; // Start at 0

  // 2. Initialize the summary object with ALL districts set to 0
  ALL_DISTRICTS.forEach(district => {
    // We use lowercase keys to easily match with user input later
    summary[district.toLowerCase()] = {
      name: district,
      Cultivation: 0,
      Harvest: 0
    };
  });

  // 3. Process the actual data from the database
  if (locations && locations.length > 0) {
    locations.forEach((item) => {
      const rawLocation = item.district || item.locationText || "";
      const cleanLocation = rawLocation.replace(/district/i, "").trim().toLowerCase();

      // If the cleaned location matches one of our 25 districts, add the data
      if (summary[cleanLocation]) {
        const units = parseFloat(item.units) || 0;
        summary[cleanLocation].Cultivation += units;
        summary[cleanLocation].Harvest += units * 0.85; 

        if (summary[cleanLocation].Cultivation > maxCultivation) {
          maxCultivation = summary[cleanLocation].Cultivation;
        }
      }
    });
  }

  // 4. Convert to array and sort
  // Sort primarily by highest cultivation. If cultivation is equal (e.g., both are 0), sort alphabetically.
  const tableData = Object.values(summary).sort((a, b) => {
    if (b.Cultivation !== a.Cultivation) {
      return b.Cultivation - a.Cultivation;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-100" style={{ maxHeight: "500px", overflowY: "auto" }}>
      <Table responsive hover className="align-middle mb-0">
        <thead style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 1 }}>
          <tr>
            <th className="text-muted text-uppercase" style={{ fontSize: "12px", borderTop: "none" }}>District</th>
            <th className="text-muted text-uppercase" style={{ fontSize: "12px", borderTop: "none", width: "35%" }}>Cultivated Area</th>
            <th className="text-muted text-uppercase" style={{ fontSize: "12px", borderTop: "none", width: "35%" }}>Expected Harvest</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => {
            // Calculate percentage fills. If maxCultivation is 0, avoid dividing by zero.
            const cultPercent = maxCultivation > 0 ? (row.Cultivation / maxCultivation) * 100 : 0;
            const harvPercent = cultPercent; // Assuming harvest is proportional 

            // If the value is 0, bar width is 0. If > 0, set a minimum of 2% so small numbers are still visible.
            const barWidthCult = row.Cultivation > 0 ? Math.max(cultPercent, 2) : 0;
            const barWidthHarv = row.Harvest > 0 ? Math.max(harvPercent, 2) : 0;

            return (
              <tr key={row.name}>
                <td className={`fw-bold ${row.Cultivation > 0 ? "text-dark" : "text-muted"}`}>
                  {row.name}
                </td>
                
                {/* Cultivation Column */}
                <td>
                  <div className="d-flex justify-content-between mb-1">
                    <span className={`fw-semibold ${row.Cultivation > 0 ? "text-dark" : "text-muted"}`} style={{ fontSize: "14px" }}>
                      {row.Cultivation.toFixed(1)} <span className="text-muted fw-normal" style={{ fontSize: "12px" }}>kg</span>
                    </span>
                  </div>
                  <ProgressBar 
                    variant="success" 
                    now={barWidthCult} 
                    style={{ height: "6px", backgroundColor: "#e9ecef" }} 
                  />
                </td>

                {/* Harvest Column */}
                <td>
                  <div className="d-flex justify-content-between mb-1">
                    <span className={`fw-semibold ${row.Harvest > 0 ? "text-dark" : "text-muted"}`} style={{ fontSize: "14px" }}>
                      {row.Harvest.toFixed(1)} <span className="text-muted fw-normal" style={{ fontSize: "12px" }}>kg</span>
                    </span>
                  </div>
                  <ProgressBar 
                    variant="danger" 
                    now={barWidthHarv} 
                    style={{ height: "6px", backgroundColor: "#e9ecef" }} 
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default DistrictDataTable;