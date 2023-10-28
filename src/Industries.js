import './App.css';
import '@coreui/coreui/dist/css/coreui.min.css';
import { CAlert, CButton, CFormInput, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import Papa from "papaparse";
import React, { useState } from "react";
import { CContainer } from '@coreui/react';
import { cilCopy, cilExternalLink, cilReload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

function Industries() {

  const allowedExtensions = ["csv"];
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [file, setFile] = useState("");
  const [copy, setCopy] = useState({
    value: '',
    copiedIndustry: "",
  });

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


    const CHANGE_PERCENT_IN_GROUP_RANK = 75;
    const NUMBER_OF_STOCKS = 6;

    if (!file) return setError("Enter a valid file");
    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv?.data;
      // console.log("parsedData", parsedData)
      const filteredData = parsedData.filter(data => data.NumberOfStocks > NUMBER_OF_STOCKS &&
        data.MarketCapital.length === 11 &&
        ((((data.IndustryGroupRankCurrent * 100) / data.IndustryGroupRankLast3MonthAgo) < CHANGE_PERCENT_IN_GROUP_RANK) ||
          (((data.IndustryGroupRankCurrent * 100) / data.IndustryGroupRankLastWeek) < CHANGE_PERCENT_IN_GROUP_RANK)) &&
        data.IndustryGroupRankLastWeek - data.IndustryGroupRankCurrent > 0
        && (100 - ((data.IndustryGroupRankCurrent * 100) / data.IndustryGroupRankLastWeek)) >= 10
      ).sort(compare);

      // console.log("filteredData", filteredData)

      setData(filteredData);
    };
    reader.readAsText(file);
  };


  return (
    <section>
      <CContainer className='mt-4' >
        <div className="mb-3">
          <CFormInput onChange={handleFileChange}
            id="csvInput"
            name="file"
            type="File"
            label={<b>Select Industry GroupList CSV file.</b>}
          />
        </div>
        <div>
          <CButton onClick={handleParse} color="primary" size="sm"> Get Industries</CButton>
          <CButton onClick={() => window.location.reload()} color="primary" size="sm" style={{ marginLeft: 10 }}>
            <CIcon icon={cilReload} className="text-secondary" size="sm" /> Reload


          </CButton>
        </div>
      </CContainer>

      <div style={{ marginTop: "3rem" }}>
        <CContainer>

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
                <CTableHeaderCell style={{ textAlign: "left" }} scope="col">Group Name</CTableHeaderCell>
                <CTableHeaderCell scope="col">Number Of Stocks</CTableHeaderCell>
                <CTableHeaderCell scope="col">Current Rank</CTableHeaderCell>
                <CTableHeaderCell scope="col">Last Week Rank</CTableHeaderCell>
                <CTableHeaderCell scope="col">3 Month Ago Rank</CTableHeaderCell>
                <CTableHeaderCell scope="col">W Change % </CTableHeaderCell>
                <CTableHeaderCell scope="col">3M Change % </CTableHeaderCell>
                <CTableHeaderCell scope="col">Market Cap</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.map((row, idx) =>
                <CTableRow key={idx}>
                  <CTableDataCell>{idx + 1}</CTableDataCell>
                  <CTableDataCell
                    onClick={() => setSelectedCell(row.IndustryGroupName)} style={{ textAlign: "left", backgroundColor: selectedCell === row.IndustryGroupName ? "#A7F1A8" : "" }}
                  >
                    <strong>{row.IndustryGroupName}</strong>

                    {/* <CopyToClipboard text={row.IndustryGroupName} onCopy={() => setCopy({ copiedIndustry: row.IndustryGroupName })}>
                      <CIcon style={{ marginLeft: 10 }} icon={cilCopy} className={copy.copiedIndustry === row.IndustryGroupName ? "text-primary" : "text-secondary"} size="xl" />
                    </CopyToClipboard> */}

                    <a style={{ marginLeft: 10 }} href={'https://marketsmithindia.com/mstool/eval/list/' + row.Symbol + '/evaluation.jsp'}
                      target="_blank"
                    >
                      <CIcon icon={cilExternalLink} className="text-primary" size="lg" />
                    </a>



                  </CTableDataCell>
                  <CTableDataCell>{row.NumberOfStocks}</CTableDataCell>
                  <CTableDataCell>{row.IndustryGroupRankCurrent}</CTableDataCell>
                  <CTableDataCell>{row.IndustryGroupRankLastWeek}</CTableDataCell>
                  <CTableDataCell>{row.IndustryGroupRankLast3MonthAgo}</CTableDataCell>
                  <CTableDataCell>{(100 - ((row.IndustryGroupRankCurrent * 100) / row.IndustryGroupRankLastWeek)).toFixed(2) + " %"}</CTableDataCell>
                  <CTableDataCell>{(100 - ((row.IndustryGroupRankCurrent * 100) / row.IndustryGroupRankLast3MonthAgo)).toFixed(2) + " %"}</CTableDataCell>
                  <CTableDataCell>{row.MarketCapital}</CTableDataCell>

                </CTableRow>
              )}

              {
                data && data.length === 0 && <CTableRow>

                  <CTableDataCell colSpan={9}>No records available  </CTableDataCell>
                </CTableRow>
              }
            </CTableBody>
          </CTable>
        </CContainer>

      </div>
    </section>
  );
}

export default Industries;
