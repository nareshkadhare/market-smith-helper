import '@coreui/coreui/dist/css/coreui.min.css';
import { cilExternalLink, cilReload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CAlert, CButton, CFormInput, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import Papa from "papaparse";
import React, { useState } from "react";
import './App.css';

function GrowthStocks() {

  const allowedExtensions = ["csv"];
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [file, setFile] = useState("");

  const [selectedCell, setSelectedCell] = useState("");

  const handleFileChange = (e) => {
    setError("");
    if (e.target.files.length) {
      const inputFile = e.target.files[0];
      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a csv file");
        return;
      }
      setFile(inputFile);
    }
  };

  const handleParse = () => {

    function compare(a, b) {

      const bValue = (100 - ((a.IndustryGroupRankCurrent * 100) / a.IndustryGroupRankLastWeek));
      const aValue = (100 - ((b.IndustryGroupRankCurrent * 100) / b.IndustryGroupRankLastWeek));

      if (aValue < bValue) {
        return -1;
      }
      if (aValue > bValue) {
        return 1;
      }
      return 0;
    }

    if (!file) return setError("Enter a valid file");
    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv?.data;
      console.log("parsedData", parsedData)

      const filteredData = parsedData.filter(data =>
        //industy has min 6 stocks
        data.EPS_Rating >= 80 &&
        data.Master_Score >= 60 &&
        data.RS_Rating >= 80 &&
        data.Group_Rank <= 40
      );

      // console.log("filteredData", filteredData)
      setData(filteredData);
    };
    reader.readAsText(file);
  };


  return (
    <section>
      <div className='mt-4'>
        <div className="mb-3">
          <CFormInput onChange={handleFileChange}
            id="csvInput"
            name="file"
            type="File"
            label={<b>Select Growth Stock CSV file.</b>}
          />
        </div>
        <div>
          <CButton onClick={handleParse} color="primary" size="sm"> Get Stocks</CButton>
          <CButton onClick={() => window.location.reload()} color="primary" size="sm" style={{ marginLeft: 10 }}>
            <CIcon icon={cilReload} className="text-secondary" size="sm" /> Reload
          </CButton>
        </div>
      </div>

      <div style={{ marginTop: "3rem" }}>
        {
          error &&
          <CAlert color="danger">
            {error}
          </CAlert>
        }
        <CTable style={{ textAlign: "center" }} striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr No</CTableHeaderCell>
              <CTableHeaderCell style={{ textAlign: "left" }} scope="col">Company Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Symbol</CTableHeaderCell>
              <CTableHeaderCell scope="col">Curent Price</CTableHeaderCell>
              <CTableHeaderCell scope="col">Master_Score</CTableHeaderCell>
              <CTableHeaderCell scope="col">EPS Rating</CTableHeaderCell>
              <CTableHeaderCell scope="col">Group Rank</CTableHeaderCell>
              <CTableHeaderCell scope="col">RS Rating</CTableHeaderCell>

              <CTableHeaderCell scope="col">AD Rating</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {data.map((row, idx) =>
              <CTableRow key={idx}>
                <CTableDataCell>{idx + 1}</CTableDataCell>
                <CTableDataCell style={{ textAlign: "left" }}>{row.CompanyName}</CTableDataCell>
                <CTableDataCell
                  onClick={() => setSelectedCell(row.Symbol)} style={{ backgroundColor: selectedCell === row.Symbol ? "#A7F1A8" : "" }}
                >
                  <strong>{row.Symbol}  </strong>
                  <a href={'https://marketsmithindia.com/mstool/eval/list/' + row.Symbol + '/evaluation.jsp'}
                    target="_blank"
                  >
                    <CIcon icon={cilExternalLink} className="text-primary" size="md" />
                  </a>
                </CTableDataCell>
                <CTableDataCell>{row.Cur_Price}</CTableDataCell>
                <CTableDataCell>{row.Master_Score}</CTableDataCell>
                <CTableDataCell>{row.EPS_Rating}</CTableDataCell>
                <CTableDataCell>{row.Group_Rank}</CTableDataCell>
                <CTableDataCell>{row.RS_Rating}</CTableDataCell>
                <CTableDataCell>{row.AD_Rating}</CTableDataCell>

              </CTableRow>
            )}

            {
              data && data.length === 0 && <CTableRow>

                <CTableDataCell colSpan={9}>No records available  </CTableDataCell>
              </CTableRow>
            }
          </CTableBody>
        </CTable>


      </div>
    </section>
  );
}

export default GrowthStocks;
