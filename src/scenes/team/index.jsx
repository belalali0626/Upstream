import React, { useState } from 'react';
import { Box, Typography, Checkbox, FormControl, ListItemText, MenuItem, InputLabel, Select, useTheme, OutlinedInput } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import * as XLSX from 'xlsx';
import Header from "../../components/Header";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [originalData, setOriginalData] = useState([]); // Store the original data here

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setOriginalData(data); // Save the original data
      setHeaders(data[0]); // Initialize headers for filtering
      setSelectedHeaders([]); // Initially no headers are selected
      generateHeadersAndRows(data, []); // Display no data initially
    };
    reader.readAsBinaryString(file);
  };

  const generateHeadersAndRows = (data, filteredHeaders) => {
    const headerRow = data[0];
    const dataRows = data.slice(1);
    
    const activeHeaders = filteredHeaders.length > 0 ? headerRow.filter(header => filteredHeaders.includes(header)) : headerRow;
    
    const columns = activeHeaders.map((header, index) => ({
      field: header.toLowerCase().replace(/\s+/g, ''),
      headerName: header,
      flex: 1,
      width: 150,
    }));
    
    const rows = dataRows.map((row, rowIndex) => {
      const rowData = { id: rowIndex };
      activeHeaders.forEach((header, index) => {
        rowData[header.toLowerCase().replace(/\s+/g, '')] = row[headerRow.indexOf(header)];
      });
      return rowData;
    });

    setColumns(columns);
    setRows(rows);
  };

  const handleHeaderSelectionChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedHeaders(typeof value === 'string' ? value.split(',') : value);
    generateHeadersAndRows(originalData, typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box m="20px">
      <Header title="Price List" subtitle="Upload your price list" />
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        style={{ display: 'block', margin: '20px 0' }}
      />
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-checkbox-label">Headers</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={selectedHeaders}
          onChange={handleHeaderSelectionChange}
          input={<OutlinedInput label="Headers" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {headers.map((header) => (
            <MenuItem key={header} value={header}>
              <Checkbox checked={selectedHeaders.indexOf(header) > -1} />
              <ListItemText primary={header} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid checkboxSelection rows={rows} columns={columns} />
      </Box>
    </Box>
  );
};

export default Team;
