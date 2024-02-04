import '@coreui/coreui/dist/css/coreui.min.css';
import { cilExternalLink, cilReload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CAlert, CButton, CForm, CFormInput, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import Papa from "papaparse";
import React, { useState } from "react";
import { CSVLink } from "react-csv";
import './App.css';

function NearPivotPointStocks() {

  const allowedExtensions = ["csv"];
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [file, setFile] = useState([]);

  const [selectedCell, setSelectedCell] = useState("");
  const [csvData, setCsvData] = useState("");
  const [watchlistName, setWatchlistName] = useState("Near-Pivot-Point");

  const BUYER_DEMAND = ["A+", "A", "A-", "B+"];

  const handleFileChange = (e) => {
    setError("");
    const selectedFiles = e.target.files;
    if (e.target.files.length) {

      //For every selected file check error and add to final file list
      const files = new Array();

      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const fileExtension = file?.type.split("/")[1];
        if (!allowedExtensions.includes(fileExtension)) {
          setError("Please input a csv file");
          return;
        }
        files.push(file)
      }

      //set file list
      setFile(files);
    }
  };

  const handleParse = () => {
    if (!file) return setError("Enter a valid file");

    const handleFileChosen = async (file) => {
      return new Promise((resolve, reject) => {
        let fileReader = new FileReader();

        fileReader.onload = () => {
          resolve(
            {
              fileName: file.name,
              data: fileReader.result
            }
          );
        };
        fileReader.onerror = reject;
        fileReader.readAsText(file);
      });
    }


    const readAllFiles = async (AllFiles) => {
      const allFileData = await Promise.all(AllFiles.map(async (file) => {
        const fileContents = await handleFileChosen(file);
        return fileContents;
      }));

      console.log("allFileData :", allFileData);

      let filesContentObj = [];
      let fileWithItsContent = [];

      allFileData.forEach(result => {
        const csv = Papa.parse(result.data, { header: true });
        const parsedData = csv?.data;
        fileWithItsContent = fileWithItsContent.concat({
          name: result.fileName,
          data: parsedData
        });
        filesContentObj = filesContentObj.concat(parsedData);
      })

      console.log("fileWithItsContent :", filesContentObj);

      // console.log("Final Trades : ", filesContentObj)
      const filteredData = filesContentObj.filter(data => data && isNaN(data.Symbol)

        && data.Master_Score >= 60
        && BUYER_DEMAND.includes(data.AD_Rating)
        && parseFloat(data.Price_Percentage_chg) <= 2.00 && parseFloat(data.Price_Percentage_chg) >= -2.00
        && data.EPS_Rating >= 40
      );

      const csvData = [];
      filteredData.forEach(element => {
        csvData.push("NSE:" + element.Symbol);
      });

      setCsvData(csvData.join(","))
      setData(filteredData);
      return allFileData;
    }

    readAllFiles(file);
  };


  return (
    <section>
      <div className='mt-4'>
        <div className="mb-3">
          <CFormInput onChange={handleFileChange}
            id="csvInput"
            name="file"
            type="File"
            label={<b>Select Near Pivot Point Stocks CSV files.</b>}
            multiple
          />
        </div>
        <div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <CButton onClick={handleParse} color="primary" size="sm" style={{ fontWeight: "bold" }}> Get Stocks</CButton>
              <CButton onClick={() => window.location.reload()} color="primary" size="sm" style={{ marginLeft: 10, fontWeight: "bold" }}>
                <CIcon icon={cilReload} className="text-secondary" size="sm" /> Reload
              </CButton>
            </div>

            <div>
              {
                csvData &&

                <CForm style={{ display: "flex" }}>
                  <CFormInput
                    type="text"
                    id="WatchlistNameFormControlInput"

                    placeholder="Enter Watchlist"
                    value={watchlistName}
                    onChange={(e) => {
                      setWatchlistName(e.target.value);
                    }}
                    style={{ marginRight: 10, fontWeight: "bold" }}
                  />
                  <CSVLink filename={watchlistName} className='btn btn-primary btn-sm' style={{ fontWeight: "bold" }} data={csvData}>
                    Download

                  </CSVLink>
                </CForm>
              }
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <div>

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

      </div>
    </section >
  );
}

export default NearPivotPointStocks;
