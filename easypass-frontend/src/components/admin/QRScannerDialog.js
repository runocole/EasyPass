import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Box, Button, Typography, IconButton, TextField, Alert,
  Tabs, Tab, Divider, CircularProgress
} from '@mui/material';
import { 
  Close as CloseIcon,
  Upload as UploadIcon,
  CameraAlt as CameraIcon,
  EditNote as EditIcon
} from '@mui/icons-material';
import { Html5Qrcode } from 'html5-qrcode';

const QRScannerDialog = ({ 
  open, 
  onClose, 
  onScanSuccess,
  isCheckout = false, //prop to determine operation type 
  availableStudents = [] 
}) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [students, setStudents] = useState(availableStudents);
  
  const fileInputRef = useRef(null);
  const cameraContainerRef = useRef(null);
  const html5QrcodeRef = useRef(null);
  
  // Initialize camera scanner
  useEffect(() => {
    if (activeTab === 'camera' && open && !scannerInitialized) {
      try {
        // Initialize camera with a delay
        const timeoutId = setTimeout(() => {
          const cameraContainer = document.getElementById('qr-reader');
          if (!cameraContainer) {
            setError("Camera container not found");
            return;
          }
          
          const scanner = new Html5Qrcode("qr-reader");
          html5QrcodeRef.current = scanner;
          
          scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => handleQrCodeData(decodedText),
            (errorMessage) => {
              // Only log important errors
              if (!errorMessage.includes("No QR code found")) {
                console.log(errorMessage);
              }
            }
          ).then(() => {
            setScannerInitialized(true);
            setError(null);
          }).catch(err => {
            console.error("Camera error:", err);
            setError("Camera access failed. Please use another method.");
          });
        }, 800);
        
        return () => clearTimeout(timeoutId);
      } catch (err) {
        console.error("Scanner error:", err);
        setError("Failed to initialize camera scanner.");
      }
    }
    
    // Clean up camera
    return () => {
      if (html5QrcodeRef.current && scannerInitialized) {
        html5QrcodeRef.current.stop().catch(() => {});
        setScannerInitialized(false);
      }
    };
  }, [activeTab, open, scannerInitialized]);
  
  // Process QR code data
  const handleQrCodeData = (decodedText) => {
    setLoading(true);
    
    try {
      console.log("Raw QR data:", decodedText);
      
      // Try parsing as JSON
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
      } catch (e) {
        // Not valid JSON, use as plain text
        qrData = { matricNumber: decodedText.trim() };
      }
      
      // Extract student info - check various possible field names
      const username = qrData.matricNumber || qrData.username || qrData.studentId || qrData.id;
      const examCode = qrData.exam || qrData.examCode || qrData.course_code;
      const tagNumber = qrData.tag_number || qrData.tagNumber;
      
      if (!username && !tagNumber) {
        setError("Couldn't find student ID or tag number in QR code");
        setLoading(false);
        return;
      }
      
      // Create data object based on available fields
      const studentData = {
        username: username,
        exam_code: examCode || "CSC101", // Default exam code if none found
        tag_number: tagNumber
      };
      
      if (qrData.position) {
        studentData.position = qrData.position;
      }
      
      console.log(`Extracted ${isCheckout ? 'check-out' : 'check-in'} data:`, studentData);
      
      // Pass the operation type along with the data
      onScanSuccess(studentData, isCheckout);
      setLoading(false);
      
      // Stop scanner and close dialog
      if (html5QrcodeRef.current && scannerInitialized) {
        html5QrcodeRef.current.stop().catch(() => {});
      }
      onClose();
      
    } catch (err) {
      console.error(`Error processing QR data for ${isCheckout ? 'check-out' : 'check-in'}:`, err);
      setError("Failed to process QR code. Please try again or use manual entry.");
      setLoading(false);
    }
  };
  
  // Handle file upload
  const handleFileUpload = (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const imageFile = event.target.files[0];
    setLoading(true);
    setError(null);
    
    try {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        // Create an image to get dimensions
        const image = new Image();
        image.onload = () => {
          // Create a canvas to draw the image
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0, image.width, image.height);
          
          // Try to extract the QR code
          const scanner = new Html5Qrcode("qr-reader-file");
          
          scanner.scanFile(imageFile, true)
            .then(decodedText => {
              handleQrCodeData(decodedText);
              scanner.clear();
            })
            .catch(err => {
              console.error("QR scanning error:", err);
              setError("Couldn't detect a valid QR code in the image.");
              setLoading(false);
              scanner.clear();
            });
        };
        
        image.onerror = () => {
          setError("Invalid image file. Please try another image.");
          setLoading(false);
        };
        
        image.src = fileReader.result;
      };
      
      fileReader.onerror = () => {
        setError("Failed to read file. Please try again.");
        setLoading(false);
      };
      
      fileReader.readAsDataURL(imageFile);
      
    } catch (err) {
      console.error("File processing error:", err);
      setError("Error processing image file.");
      setLoading(false);
    }
  };
  
  // Handle manual submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    
    if (!manualInput.trim()) {
      setError("Please enter a student ID or QR code data");
      return;
    }
    
    try {
      let studentData;
      
      // Try parsing as JSON first
      try {
        const parsedData = JSON.parse(manualInput);
        const username = parsedData.matricNumber || parsedData.username || parsedData.studentId;
        const examCode = parsedData.exam || parsedData.examCode || parsedData.course_code;
        const tagNumber = parsedData.tag_number || parsedData.tagNumber;
        
        if (!username && !tagNumber) {
          setError("No student ID or tag number found in JSON data");
          return;
        }
        
        studentData = {
          username: username,
          exam_code: examCode || "CSC101",
          tag_number: tagNumber
        };
        
        if (parsedData.position) {
          studentData.position = parsedData.position;
        }
      } catch (e) {
        // Not valid JSON, use as plain text
        studentData = {
          username: manualInput.trim(),
          exam_code: "CSC101" // Default exam code
        };
      }
      
      // Submit data
      onScanSuccess(studentData, isCheckout);
      setManualInput('');
      onClose();
      
    } catch (err) {
      console.error("Error processing manual input:", err);
      setError("Invalid input format. Please enter a valid student ID.");
    }
  };
  
  // Handle test data
  const handleUseTestData = () => {
    const testData = {
      username: "STUDENT123", // Replace with an actual student if known
      exam_code: "CSC101",
      tag_number: "T1-0001" // Add a test tag number
    };
    
    onScanSuccess(testData, isCheckout);
    onClose();
  };
  
  // Clean up when dialog closes
  const handleClose = () => {
    setError(null);
    setManualInput('');
    setLoading(false);
    
    // Stop scanner if active
    if (html5QrcodeRef.current && scannerInitialized) {
      html5QrcodeRef.current.stop().catch(() => {});
      setScannerInitialized(false);
    }
    
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        {isCheckout ? "Check Out Student" : "Check In Student"}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Tabs 
          value={activeTab}
          onChange={(e, newValue) => {
            // Stop scanner before switching tabs
            if (activeTab === 'camera' && html5QrcodeRef.current && scannerInitialized) {
              html5QrcodeRef.current.stop().catch(() => {});
              setScannerInitialized(false);
            }
            setActiveTab(newValue);
          }}
          centered
          sx={{ mb: 3 }}
        >
          <Tab icon={<EditIcon />} label="Manual" value="manual" />
          <Tab icon={<UploadIcon />} label="Upload" value="upload" />
          <Tab icon={<CameraIcon />} label="Camera" value="camera" />
        </Tabs>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        {activeTab === 'manual' && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Enter Student Information for {isCheckout ? "Check-Out" : "Check-In"}
            </Typography>
            
            <form onSubmit={handleManualSubmit}>
              <TextField
                label={`Student ID, Tag Number or QR Data for ${isCheckout ? "Check-Out" : "Check-In"}`}
                multiline
                rows={3}
                fullWidth
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter student ID, tag number or JSON data"
                variant="outlined"
                sx={{ mb: 2 }}
                disabled={loading}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !manualInput.trim()}
                sx={{ mb: 2 }}
              >
                Submit
              </Button>
            </form>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Example Formats:
            </Typography>
            
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" component="pre" sx={{ m: 0 }}>
                {`// Option 1: Just the student ID or tag number
STUDENT123
T1-0001

// Option 2: JSON format
{
  "username": "STUDENT123",
  "exam_code": "CSC101",
  "tag_number": "T1-0001"
}`}
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={handleUseTestData}
              sx={{ mt: 1 }}
            >
              Use Test Data
            </Button>
          </Box>
        )}
        
        {activeTab === 'upload' && (
          <Box sx={{ textAlign: 'center' }}>
            <div id="qr-reader-file" style={{ display: 'none' }}></div>
            
            <input
              accept="image/*"
              id="qr-upload-input"
              type="file"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
              disabled={loading}
            />
            
            <label htmlFor="qr-upload-input">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
                disabled={loading}
                sx={{ mb: 2, px: 3, py: 1.2 }}
              >
                Select QR Code Image
              </Button>
            </label>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload an image containing a student QR code for {isCheckout ? "check-out" : "check-in"}
            </Typography>
            
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 4,
                mt: 3,
                mb: 2,
                bgcolor: 'rgba(0,0,0,0.02)',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Typography color="text.secondary">
                Click or drag an image here
              </Typography>
            </Box>
          </Box>
        )}
        
        {activeTab === 'camera' && (
          <Box sx={{ textAlign: 'center' }}>
            <div
              id="qr-reader"
              style={{
                width: '100%',
                minHeight: 300,
                border: '1px solid #eee',
                borderRadius: 8,
                overflow: 'hidden',
                position: 'relative'
              }}
              ref={cameraContainerRef}
            ></div>
            
            {!scannerInitialized && !error && (
              <Box sx={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                textAlign: 'center'
              }}>
                <CircularProgress size={40} />
                <Typography sx={{ mt: 2 }}>Starting camera...</Typography>
              </Box>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Position the QR code within the camera view for {isCheckout ? "check-out" : "check-in"}
            </Typography>
            
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                if (html5QrcodeRef.current) {
                  html5QrcodeRef.current.stop().catch(() => {});
                  setScannerInitialized(false);
                }
                
                try {
                  const scanner = new Html5Qrcode("qr-reader");
                  html5QrcodeRef.current = scanner;
                  
                  scanner.start(
                    { facingMode: "environment" }, 
                    { fps: 10, qrbox: 250 },
                    (decodedText) => handleQrCodeData(decodedText),
                    (errorMessage) => console.log("QR Error", errorMessage)
                  )
                  .then(() => {
                    setScannerInitialized(true);
                    setError(null);
                  })
                  .catch(err => {
                    console.error("Camera error:", err);
                    setError("Camera access denied. Please check permissions and try again.");
                  });
                } catch (err) {
                  console.error("Scanner error:", err);
                  setError("Failed to initialize scanner: " + err.message);
                }
              }}
              sx={{ mt: 2 }}
            >
              Retry Camera Access
            </Button>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        {activeTab === 'manual' && (
          <Button 
            color="primary"
            variant="contained"
            onClick={handleUseTestData}
          >
            Use Test Data
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QRScannerDialog;