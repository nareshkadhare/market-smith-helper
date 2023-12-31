import '@coreui/coreui/dist/css/coreui.min.css';
import { cilExternalLink, cilReload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CAlert, CButton, CFormInput, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import Papa from "papaparse";
import React, { useState } from "react";
import './App.css';

function Industries() {

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


    const CHANGE_PERCENT_IN_GROUP_RANK = 90;
    const NUMBER_OF_STOCKS = 6;
    const CAPITALIZATION_LENGTH = 11;

    if (!file) return setError("Enter a valid file");
    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv?.data;
      // console.log("parsedData", parsedData)

      const filteredData = parsedData.filter(data =>
        //industy has min 6 stocks
        data.NumberOfStocks >= NUMBER_OF_STOCKS &&

        //has 1 lakh CR capital
        data.MarketCapital.length >= CAPITALIZATION_LENGTH &&

        (
          // 3 Months Comparision 
          (((data.IndustryGroupRankCurrent * 100) / data.IndustryGroupRankLast3MonthAgo) <= CHANGE_PERCENT_IN_GROUP_RANK
            && data.IndustryGroupRankCurrent <= 45) ||

          //Weekly Comparision
          (((data.IndustryGroupRankCurrent * 100) / data.IndustryGroupRankLastWeek) <= CHANGE_PERCENT_IN_GROUP_RANK)
        )
      ).sort(compare);

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
            label={<b>Select Industry GroupList CSV file.</b>}
          />
        </div>
        <div>
          <CButton onClick={handleParse} color="primary" size="sm"> Get Industries</CButton>
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


      </div>
    </section>
  );
}

export default Industries;
