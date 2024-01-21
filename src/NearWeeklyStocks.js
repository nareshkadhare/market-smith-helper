import '@coreui/coreui/dist/css/coreui.min.css';
import { cilExternalLink, cilReload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CAlert, CButton, div, CForm, CFormInput, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import Papa from "papaparse";
import React, { useState } from "react";
import { CSVLink } from "react-csv";
import './App.css';
import _ from "lodash";

function NearWeeklyStocks() {

  const allowedExtensions = ["csv"];
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [file, setFile] = useState([]);
  const [copy, setCopy] = useState({
    value: '',
    copiedIndustry: "",
  });
  const [selectedCell, setSelectedCell] = useState("");
  const [csvData, setCsvData] = useState("");
  const [watchlistName, setWatchlistName] = useState("Weekly Near Setup");


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
        const csv = Papa.parse(result.data, { header: false });
        const parsedData = csv?.data;
        fileWithItsContent = fileWithItsContent.concat({
          name: result.fileName,
          data: parsedData
        });
        filesContentObj = filesContentObj.concat(parsedData);
      })

      console.log("fileWithItsContent :", filesContentObj);

      // console.log("Final Trades : ", filesContentObj)
      const filteredData = filesContentObj.filter(data => data[0] && isNaN(data[0]) && data[0] !== "Symbol");

      console.log("filteredData : ", filteredData);

      const result = [];
      const greedData = [];
      filteredData.forEach(element => {
        result.push("NSE:" + element[0]);
        greedData.push({
          Symbol: element[0],
          CompanyName: element[1],
          Price: element[2],
        })
      });

      setCsvData(result.join(","))
      setData(greedData);
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
            label={<b>Select Weekly Near Stocks CSV files.</b>}
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
                <CTableHeaderCell scope="col">Stock No</CTableHeaderCell>
                <CTableHeaderCell style={{ textAlign: "left" }} scope="col">Symbol</CTableHeaderCell>
                <CTableHeaderCell style={{ textAlign: "left" }} scope="col">Company Name</CTableHeaderCell>
                <CTableHeaderCell scope="col">Price</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.map((row, idx) =>
                <CTableRow key={idx}>
                  <CTableDataCell>{idx + 1}</CTableDataCell>
                  <CTableDataCell onClick={() => setSelectedCell(row.Symbol)} style={{ textAlign: "left", backgroundColor: selectedCell === row.Symbol ? "#A7F1A8" : "" }} >
                    <strong>{row.Symbol}</strong>
                    {/* <CopyToClipboard text={row.Symbol} onCopy={() => setCopy({ copiedSymbol: row.Symbol })}>
                      <CIcon style={{ marginLeft: 10 }} icon={cilCopy} className={copy.copiedSymbol === row.Symbol ? "text-primary" : "text-secondary"} size="xl" />
                    </CopyToClipboard> */}
                    <a style={{ marginLeft: 10 }} href={'https://in.tradingview.com/chart/ZLWT61X3/?symbol=NSE:' + row.Symbol}
                      target="_blank"
                    >
                      <CIcon icon={cilExternalLink} className="text-primary" size="lg" />
                    </a>
                  </CTableDataCell>
                  <CTableDataCell style={{ textAlign: "left" }}>{row.CompanyName}</CTableDataCell>
                  <CTableDataCell>{row.Price}</CTableDataCell>
                  <CTableDataCell>

                  </CTableDataCell>

                </CTableRow>
              )}

              {
                data && data.length === 0 && <CTableRow>

                  <CTableDataCell colSpan={4}>No records available  </CTableDataCell>
                </CTableRow>
              }
            </CTableBody>
          </CTable>
        </div>

      </div>
    </section >
  );
}

export default NearWeeklyStocks;
