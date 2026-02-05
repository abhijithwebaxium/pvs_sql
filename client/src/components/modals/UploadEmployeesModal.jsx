import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  Slide,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";
import api from "../../utils/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const UploadEmployeesModal = ({ open, onClose, onEmployeesUploaded }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultType, setResultType] = useState(""); // "error", "warning", "success"
  const [resultMessage, setResultMessage] = useState("");
  const [resultDetails, setResultDetails] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");
    setSuccessMessage("");

    if (selectedFile) {
      // Validate file type
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
      if (!["xlsx", "xls"].includes(fileExtension)) {
        setError("Please upload a valid Excel file (.xlsx or .xls)");
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!loading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (loading) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          // Trim all column names to remove leading/trailing spaces
          const cleanedData = jsonData.map((row) => {
            const cleanedRow = {};
            Object.keys(row).forEach((key) => {
              const trimmedKey = key.trim();
              cleanedRow[trimmedKey] = row[key];
            });
            return cleanedRow;
          });

          resolve(cleanedData);
        } catch (error) {
          reject(new Error("Failed to parse Excel file"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validation
    if (!file) {
      setError("Please select an Excel file to upload");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    // Start smooth progress animation
    let currentProgress = 0;
    const initialInterval = setInterval(() => {
      currentProgress += Math.random() * 3 + 1;
      if (currentProgress < 20) {
        setUploadProgress(Math.floor(currentProgress));
      }
    }, 80);

    try {
      // Parse Excel file
      const employeesData = await parseExcelFile(file);
      clearInterval(initialInterval);
      setUploadProgress(25);

      if (!employeesData || employeesData.length === 0) {
        throw new Error("No employee data found in the Excel file");
      }

      setUploadProgress(40);

      // Helper function to parse employee name - supports BOTH formats
      const parseEmployeeName = (row) => {
        // Check for new format first: "Employee Name"
        const employeeName = getColumnValue(
          row,
          "Employee Name",
          " Employee Name ",
          "employeeName",
          "EmployeeName"
        );

        if (employeeName) {
          // Return the full name as is
          return employeeName.trim();
        }

        // Legacy format: "First Name" + "Last Name"
        const firstName = getColumnValue(row, "First Name", " First Name ", "firstName", "FirstName") || "";
        const lastName = getColumnValue(row, "Last Name", " Last Name ", "lastName", "LastName") || "";

        return `${firstName} ${lastName}`.trim();
      };

      // Helper function to parse date (Excel stores dates as serial numbers)
      const parseDate = (dateValue) => {
        if (!dateValue) return null;

        // Check if it's an Excel serial date (number)
        if (typeof dateValue === "number") {
          // Excel date serial number (days since 1900-01-01, with 1900-01-01 = 1)
          const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
          const msPerDay = 24 * 60 * 60 * 1000;
          const date = new Date(excelEpoch.getTime() + dateValue * msPerDay);
          return date;
        }

        // Try parsing as regular date string
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
      };

      // Helper function to parse number
      const parseNumber = (value) => {
        if (!value && value !== 0) return 0;
        // If it's already a number, return it
        if (typeof value === "number") return value;
        // Remove currency symbols, commas, but keep decimal point and negative sign
        const cleanedValue = value.toString().replace(/[$,\s]/g, "");
        const num = parseFloat(cleanedValue);
        return isNaN(num) ? 0 : num;
      };

      // Helper function to safely get column value (handles spaces in column names)
      const getColumnValue = (row, ...columnNames) => {
        for (const colName of columnNames) {
          if (
            row[colName] !== undefined &&
            row[colName] !== null &&
            row[colName] !== ""
          ) {
            return row[colName];
          }
        }
        return null;
      };

      // Transform data to match API format
      const formattedEmployees = employeesData.map((row, index) => {
        const fullName = parseEmployeeName(row);

        const employeeNumber =
          getColumnValue(
            row,
            "Employee Number",
            " Employee Number ",
            "employeeNumber",
            "EmployeeNumber",
          ) || "";
        const workEmail =
          getColumnValue(
            row,
            "Work Email",
            " Work Email ",
            "workEmail",
            "WorkEmail",
          ) || "";

        // Try multiple variations of the hourly pay rate column name
        const rawHourlyRate =
          getColumnValue(
            row,
            "Hourly Pay Rate",
            " Hourly Pay Rate ", // With spaces
            "hourly pay rate",
            "Hourly pay rate",
            "hourlyPayRate",
            "HourlyPayRate",
            "Hourly Rate",
            "hourly rate",
          ) || 0;

        const parsedHourlyRate = parseNumber(rawHourlyRate);

        const employeeData = {
          employeeId: employeeNumber,
          fullName: fullName,
          // Password will be set by backend (default: abc123xyz)
          ssn: getColumnValue(row, "SSN", " SSN ", "ssn") || "",
          company: getColumnValue(row, "Company", " Company ", "company") || "",
          companyCode:
            getColumnValue(
              row,
              "Company Code",
              " Company Code ",
              "companyCode",
              "CompanyCode",
            ) || "",
          supervisorName:
            getColumnValue(
              row,
              "Supervisor Name",
              " Supervisor Name ",
              "supervisorName",
              "SupervisorName",
            ) || "",
          location:
            getColumnValue(row, "Location", " Location ", "location") || "",
          jobTitle:
            getColumnValue(
              row,
              "Job Title",
              " Job Title ",
              "jobTitle",
              "JobTitle",
            ) || "",
          employeeType:
            getColumnValue(
              row,
              "Employee Type",
              " Employee Type ",
              "employeeType",
              "EmployeeType",
            ) || "",
          salaryType:
            getColumnValue(
              row,
              "Salary or Hourly",
              " Salary or Hourly ",
              "salaryType",
              "SalaryType",
            ) || null,
          annualSalary: parseNumber(
            getColumnValue(
              row,
              "Annual Salary",
              " Annual Salary ",
              "annualSalary",
              "AnnualSalary",
            ) || 0,
          ),
          hourlyPayRate: parsedHourlyRate,
          bonus2024: parseNumber(
            getColumnValue(row, "2024 Bonus", " 2024 Bonus ", "bonus2024") || 0,
          ),
          bonus2025: parseNumber(
            getColumnValue(row, "2025 Bonus", " 2025 Bonus ", "bonus2025") || 0,
          ),
          lastHireDate: parseDate(
            getColumnValue(
              row,
              "Last Hire Date",
              " Last Hire Date ",
              "lastHireDate",
              "LastHireDate",
            ),
          ),

          // Parse Role
          role: (() => {
            const rawRole =
              getColumnValue(row, "Role", " Role ", "role", "Role") || "";
            const normalizedRole = rawRole.toLowerCase().trim();
            if (
              ["employee", "hr", "approver", "admin"].includes(normalizedRole)
            ) {
              return normalizedRole;
            }
            return "employee";
          })(),

          // Set isApprover flag based on role
          isApprover: (() => {
            const rawRole =
              getColumnValue(row, "Role", " Role ", "role", "Role") || "";
            const normalizedRole = rawRole.toLowerCase().trim();
            return normalizedRole === "approver";
          })(),

          address: {
            state:
              getColumnValue(
                row,
                "State/Province",
                " State/Province ",
                "state",
                "State",
              ) || "",
            street: "",
            city: "",
            zipCode: "",
            country: "",
          },
          // Store reporting hierarchy as temporary fields
          reporting1st:
            getColumnValue(
              row,
              "1st Reporting",
              " 1st Reporting ",
              "reporting1st",
              "1stReporting",
            ) || "",
          reporting2nd:
            getColumnValue(
              row,
              "2nd Reporting",
              " 2nd Reporting ",
              "reporting2nd",
              "2ndReporting",
            ) || "",
          reporting3rd:
            getColumnValue(
              row,
              "3rd Reporting",
              " 3rd Reporting ",
              "reporting3rd",
              "3rdReporting",
            ) || "",
          reporting4th:
            getColumnValue(
              row,
              "4th Reporting",
              " 4th Reporting ",
              "reporting4th",
              "4thReporting",
            ) || "",
          reporting5th:
            getColumnValue(
              row,
              "5th Reporting",
              " 5th Reporting ",
              "reporting5th",
              "5thReporting",
            ) || "",
        };

        // Only add email if it exists and is not empty
        if (workEmail && workEmail.trim() !== "") {
          employeeData.email = workEmail.trim();
        }

        return employeeData;
      });

      // Remove duplicates within the Excel file itself (keep only the first occurrence)
      const seenEmployeeIds = new Set();
      const uniqueEmployees = [];
      const skippedDuplicates = [];

      formattedEmployees.forEach((emp, index) => {
        if (!seenEmployeeIds.has(emp.employeeId)) {
          seenEmployeeIds.add(emp.employeeId);
          uniqueEmployees.push(emp);
        } else {
          skippedDuplicates.push({
            rowNumber: index + 2, // +2 because Excel rows start at 1 and we have header
            employeeId: emp.employeeId,
            name: emp.fullName,
          });
        }
      });

      setUploadProgress(60);

      // Send data to API
      const response = await api.post("/v2/employees/bulk", {
        employees: uniqueEmployees,
      });

      setUploadProgress(95);

      const { data } = response;

      // Determine result type
      let type = "success";
      let message = data.message || "Upload successful";

      // Handle partial success (207 Multi-Status) or 200/201
      if (response.status === 207) {
        // Combine duplicates and skippedDuplicates
        const allDuplicates = [
          ...(data.duplicates || []),
          ...(data.skippedDuplicates || []),
        ];

        type = allDuplicates.length > 0 ? "warning" : "success";
      }

      setUploadProgress(100);

      // Show result modal instead of inline alert
      setResultType(type);
      setResultMessage(message);
      setResultDetails(data);
      setShowResultModal(true);

      // Reset form
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
        if (type === "success") {
          onEmployeesUploaded();
        }
      }, 1500);

    } catch (err) {
      clearInterval(initialInterval);
      setResultType("error");
      setResultMessage(err.message || "An error occurred while uploading employees");
      setShowResultModal(true);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/v2/employees/template/download", {
        responseType: "blob",
      });

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = "employee_template.xlsx";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download template. Please try again.");
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFile(null);
      setError("");
      setSuccessMessage("");
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slots={{
          transition: Transition,
        }}
        keepMounted
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Upload Employees from Excel</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              disabled={loading}
              sx={{ '&:hover': { transform: 'none' } }}
            >
              Download Template
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box
              sx={{
                border: "2px dashed",
                borderColor: isDragging ? "success.main" : "primary.main",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                backgroundColor: isDragging ? "action.selected" : "action.hover",
                mb: 2,
                transition: "all 0.2s ease-in-out",
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                id="excel-file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={loading}
              />
              <label htmlFor="excel-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={loading}
                  sx={{ '&:hover': { transform: 'none' } }}
                >
                  {isDragging ? "Drop file here" : "Choose Excel File"}
                </Button>
              </label>
              {file && (
                <Typography
                  variant="body2"
                  sx={{ mt: 2, color: "text.secondary" }}
                >
                  Selected: {file.name}
                </Typography>
              )}
            </Box>

            {loading && (
              <Box sx={{ width: "100%", mb: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography
                  variant="caption"
                  sx={{ mt: 1, display: "block", textAlign: "center" }}
                >
                  Uploading... {Math.floor(uploadProgress)}%
                </Typography>
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                Excel Format Requirements:
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                <strong>Required columns:</strong> Employee Number, Employee Name
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                <strong>Legacy format also supported:</strong> Employee Number, First Name, Last Name
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                <strong>Optional columns:</strong> SSN, Company, Company Code,
                Supervisor Name, Location, 1st Reporting, 2nd Reporting, 3rd
                Reporting, 4th Reporting, 5th Reporting, State/Province, Work
                Email, Last Hire Date, Employee Type, Job Title, Salary or Hourly,
                Annual Salary, Hourly Pay Rate, 2024 Bonus, 2025 Bonus, Role
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading} sx={{ '&:hover': { transform: 'none' } }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !file}
            sx={{ '&:hover': { transform: 'none' } }}
          >
            {loading ? "Uploading..." : "Upload Employees"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Result Modal */}
      <Dialog
        open={showResultModal}
        onClose={() => setShowResultModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Results
        </DialogTitle>
        <DialogContent>
          <Alert
            severity={resultType}
            sx={{ mb: 2 }}
          >
            {resultMessage}
          </Alert>
          {resultDetails?.duplicates && resultDetails.duplicates.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Skipped Entries ({resultDetails.duplicates.length}):
              </Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflowY: "auto",
                  bgcolor: "background.paper",
                  p: 1,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {resultDetails.duplicates.slice(0, 10).map((dup, idx) => (
                  <Typography key={idx} variant="caption" display="block">
                    • {dup.employeeName} ({dup.employeeId}) - {dup.reason}
                  </Typography>
                ))}
                {resultDetails.duplicates.length > 10 && (
                  <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: "italic" }}>
                    ...and {resultDetails.duplicates.length - 10} more
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowResultModal(false)}
            variant="contained"
            sx={{ '&:hover': { transform: 'none' } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadEmployeesModal;
