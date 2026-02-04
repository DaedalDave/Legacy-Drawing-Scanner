// Technical Drawing Converter App - Browser Compatible Version with Debug
function DrawingConverter() {
  const [image, setImage] = React.useState(null);
  const [processedImage, setProcessedImage] = React.useState(null);
  const [dimensions, setDimensions] = React.useState([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [selectedDimension, setSelectedDimension] = React.useState(null);
  const [editValue, setEditValue] = React.useState('');
  const [processingStage, setProcessingStage] = React.useState('');
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  // Simulated OCR and processing functions
  const preprocessImage = async (imageData) => {
    setProcessingStage('Preprocessing: Cleaning and enhancing image...');
    await new Promise(resolve => setTimeout(resolve, 800));
    return imageData;
  };

  const detectTextRegions = async (imageData) => {
    setProcessingStage('Text Detection: Locating dimensional annotations...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate CRAFT text detection - in production, this would use actual OCR
    const mockDimensions = [
      { 
        id: 1, 
        imperial: '2.50', 
        x: 150, 
        y: 100, 
        confidence: 98,
        metric: (2.50 * 25.4).toFixed(2),
        unit: '"'
      },
      { 
        id: 2, 
        imperial: '1.25', 
        x: 300, 
        y: 200, 
        confidence: 95,
        metric: (1.25 * 25.4).toFixed(2),
        unit: '"'
      },
      { 
        id: 3, 
        imperial: '0.375', 
        x: 450, 
        y: 150, 
        confidence: 78,
        metric: (0.375 * 25.4).toFixed(2),
        unit: '"'
      },
      { 
        id: 4, 
        imperial: '3.00', 
        x: 200, 
        y: 300, 
        confidence: 92,
        metric: (3.00 * 25.4).toFixed(2),
        unit: '"'
      },
      { 
        id: 5, 
        imperial: '0.125', 
        x: 500, 
        y: 250, 
        confidence: 82,
        metric: (0.125 * 25.4).toFixed(2),
        unit: '"'
      },
    ];
    
    return mockDimensions;
  };

  const performOCR = async (regions) => {
    setProcessingStage('OCR: Recognising dimensional values...');
    await new Promise(resolve => setTimeout(resolve, 1200));
    return regions;
  };

  const processDrawing = async () => {
    if (!image) {
      console.log('No image to process');
      return;
    }
    
    console.log('Starting processing...');
    setIsProcessing(true);
    setDimensions([]);
    
    try {
      const preprocessed = await preprocessImage(image);
      const regions = await detectTextRegions(preprocessed);
      const ocrResults = await performOCR(regions);
      
      setProcessingStage('Conversion: Calculating metric values...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setDimensions(ocrResults);
      setProcessingStage('Complete! Review flagged dimensions.');
      
      // Draw overlay
      drawOverlay(ocrResults);
      
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingStage('Error during processing. Please try again.');
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  const drawOverlay = (dims) => {
    if (!canvasRef.current || !imageRef.current) {
      console.log('Canvas or image ref not available');
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    console.log('Drawing overlay, image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // Draw dimensions
    dims.forEach(dim => {
      const isLowConfidence = dim.confidence < 85;
      
      // Imperial (original) - Blue
      ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
      ctx.strokeStyle = 'rgba(59, 130, 246, 1)';
      ctx.lineWidth = 2;
      ctx.font = 'bold 16px "IBM Plex Mono", monospace';
      
      const imperialText = `${dim.imperial}${dim.unit}`;
      ctx.strokeRect(dim.x - 5, dim.y - 20, ctx.measureText(imperialText).width + 10, 25);
      ctx.fillText(imperialText, dim.x, dim.y);
      
      // Metric (converted) - Green or Red
      ctx.fillStyle = isLowConfidence ? 'rgba(239, 68, 68, 0.9)' : 'rgba(34, 197, 94, 0.9)';
      ctx.strokeStyle = isLowConfidence ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)';
      
      const metricText = `${dim.metric}mm ${isLowConfidence ? '?' : ''}`;
      const yOffset = dim.y + 25;
      ctx.strokeRect(dim.x - 5, yOffset - 20, ctx.measureText(metricText).width + 10, 25);
      ctx.fillText(metricText, dim.x, yOffset);
      
      // Confidence indicator
      if (isLowConfidence) {
        ctx.fillStyle = 'rgba(239, 68, 68, 1)';
        ctx.beginPath();
        ctx.arc(dim.x - 10, yOffset - 10, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    setProcessedImage(canvas.toDataURL());
    console.log('Overlay drawn successfully');
  };

  const handleImageUpload = (e) => {
    console.log('File input changed');
    const file = e.target.files[0];
    
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('File selected:', file.name, file.type, file.size, 'bytes');
    
    // Check if it's an image file
    if (!file.type.match(/^image\//)) {
      console.error('Not an image file');
      alert('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      console.log('File loaded successfully, data URL length:', event.target.result.length);
      setImage(event.target.result);
      setProcessedImage(null);
      setDimensions([]);
      setProcessingStage('');
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      alert('Error loading image. Please try again.');
    };
    
    reader.readAsDataURL(file);
  };

  const handleDimensionClick = (dim) => {
    if (dim.confidence >= 85) return; // Only allow editing low confidence
    setSelectedDimension(dim);
    setEditValue(dim.imperial);
  };

  const saveEditedDimension = () => {
    if (!selectedDimension || !editValue) return;
    
    const newMetric = (parseFloat(editValue) * 25.4).toFixed(2);
    const updatedDimensions = dimensions.map(d => 
      d.id === selectedDimension.id 
        ? { ...d, imperial: editValue, metric: newMetric, confidence: 100 }
        : d
    );
    
    setDimensions(updatedDimensions);
    drawOverlay(updatedDimensions);
    setSelectedDimension(null);
    setEditValue('');
  };

  const exportDrawing = () => {
    if (!processedImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height + 80;
      
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Watermark
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px "IBM Plex Mono", monospace';
      ctx.fillText(`Converted: ${new Date().toLocaleDateString('en-GB')}`, 20, 30);
      ctx.font = '12px "IBM Plex Mono", monospace';
      ctx.fillText('Software: Technical Drawing Converter v1.0', 20, 50);
      ctx.fillText('Scale Ref: 1" = 25.4mm', 20, 65);
      
      // Drawing
      ctx.drawImage(img, 0, 80);
      
      // Download
      const link = document.createElement('a');
      link.download = `converted-drawing-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = processedImage;
  };

  const triggerFileInput = () => {
    console.log('Upload button clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  React.useEffect(() => {
    if (image) {
      console.log('Image state updated, length:', image.length);
    }
  }, [image]);

  React.useEffect(() => {
    if (processedImage && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = processedImage;
    }
  }, [processedImage]);

  // Lucide React icons as inline SVGs
  const Upload = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  );

  const Download = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  );

  const ZoomIn = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      <line x1="11" y1="8" x2="11" y2="14"></line>
      <line x1="8" y1="11" x2="14" y2="11"></line>
    </svg>
  );

  const ZoomOut = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      <line x1="8" y1="11" x2="14" y2="11"></line>
    </svg>
  );

  const RotateCw = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"></polyline>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
    </svg>
  );

  const AlertCircle = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );

  const Check = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const Edit3 = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  );

  const ImageIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  );

  const FileText = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );

  const Settings = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M12 1v6m0 6v6m5.2-14.8L13.8 7.6m-3.6 3.6-3.4 3.4m12.4-3.4-3.4 3.4M7.6 13.8l-3.4 3.4M1 12h6m6 0h6"></path>
    </svg>
  );

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      color: '#f1f5f9',
      position: 'relative',
      overflow: 'hidden'
    }
  },
    // Background pattern
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.03) 0px, transparent 1px, transparent 40px, rgba(148, 163, 184, 0.03) 41px),
          repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.03) 0px, transparent 1px, transparent 40px, rgba(148, 163, 184, 0.03) 41px)
        `,
        pointerEvents: 'none'
      }
    }),
    
    // Main container
    React.createElement('div', {
      style: {
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 1
      }
    },
      // Header
      React.createElement('header', {
        style: {
          marginBottom: '48px',
          textAlign: 'center'
        }
      },
        React.createElement('div', {
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            padding: '8px 20px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px'
          }
        },
          React.createElement(FileText, { size: 28, color: '#3b82f6' }),
          React.createElement('h1', {
            style: {
              fontSize: '32px',
              fontWeight: '700',
              margin: 0,
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }
          }, 'Technical Drawing Converter')
        ),
        React.createElement('p', {
          style: {
            fontSize: '16px',
            color: '#94a3b8',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }
        }, 'Automated conversion of imperial engineering drawings to metric dimensions with intelligent OCR and quality verification')
      ),
      
      // Main grid
      React.createElement('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: image ? '350px 1fr' : '1fr',
          gap: '32px',
          alignItems: 'start'
        }
      },
        // Control Panel
        React.createElement('div', {
          style: {
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
          }
        },
          React.createElement('h2', {
            style: {
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#e2e8f0'
            }
          },
            React.createElement(Settings, { size: 20 }),
            'Controls'
          ),
          
          // Upload button
          React.createElement('div', { style: { marginBottom: '24px' } },
            React.createElement('div', {
              onClick: triggerFileInput,
              style: {
                display: 'block',
                width: '100%',
                padding: '32px 16px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '2px dashed rgba(59, 130, 246, 0.5)',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }
            },
              React.createElement(Upload, { size: 40, color: '#3b82f6', style: { marginBottom: '12px' } }),
              React.createElement('div', {
                style: { fontSize: '14px', color: '#cbd5e1', marginBottom: '8px' }
              }, 'Upload Engineering Drawing'),
              React.createElement('div', {
                style: { fontSize: '12px', color: '#64748b' }
              }, 'JPG, PNG, or PDF')
            ),
            React.createElement('input', {
              ref: fileInputRef,
              type: 'file',
              accept: 'image/*',
              onChange: handleImageUpload,
              style: { display: 'none' }
            })
          ),
          
          // Process button
          image && !isProcessing && React.createElement('button', {
            onClick: processDrawing,
            style: {
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'transform 0.2s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }
          },
            React.createElement('span', {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
            },
              React.createElement(RotateCw, { size: 18 }),
              'Process Drawing'
            )
          ),
          
          // Processing status
          isProcessing && React.createElement('div', {
            style: {
              padding: '16px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              marginBottom: '16px'
            }
          },
            React.createElement('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }
            },
              React.createElement('div', {
                style: {
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(59, 130, 246, 0.3)',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }
              }),
              React.createElement('span', {
                style: { fontSize: '14px', color: '#cbd5e1', fontWeight: '500' }
              }, 'Processing...')
            ),
            React.createElement('div', {
              style: { fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }
            }, processingStage)
          ),
          
          // Export button
          processedImage && !isProcessing && React.createElement('button', {
            onClick: exportDrawing,
            style: {
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
            }
          },
            React.createElement('span', {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
            },
              React.createElement(Download, { size: 18 }),
              'Export Drawing'
            )
          ),
          
          // Zoom controls
          processedImage && React.createElement('div', {
            style: { marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }
          },
            React.createElement('div', {
              style: { fontSize: '14px', color: '#cbd5e1', marginBottom: '12px', fontWeight: '500' }
            }, `Zoom: ${Math.round(zoom * 100)}%`),
            React.createElement('div', {
              style: { display: 'flex', gap: '8px' }
            },
              React.createElement('button', {
                onClick: () => setZoom(Math.max(0.5, zoom - 0.25)),
                style: {
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }, React.createElement(ZoomOut, { size: 18 })),
              React.createElement('button', {
                onClick: () => setZoom(Math.min(3, zoom + 0.25)),
                style: {
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }, React.createElement(ZoomIn, { size: 18 }))
            )
          ),
          
          // Dimensions list
          dimensions.length > 0 && React.createElement('div', {
            style: { marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }
          },
            React.createElement('h3', {
              style: {
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#e2e8f0'
              }
            }, `Detected Dimensions (${dimensions.length})`),
            React.createElement('div', {
              style: { maxHeight: '400px', overflowY: 'auto' }
            },
              dimensions.map(dim => 
                React.createElement('div', {
                  key: dim.id,
                  onClick: () => handleDimensionClick(dim),
                  style: {
                    padding: '12px',
                    background: dim.confidence < 85 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    border: `1px solid ${dim.confidence < 85 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: dim.confidence < 85 ? 'pointer' : 'default',
                    transition: 'all 0.2s ease'
                  }
                },
                  React.createElement('div', {
                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }
                  },
                    React.createElement('span', {
                      style: { fontSize: '13px', color: '#94a3b8', fontFamily: '"IBM Plex Mono", monospace' }
                    }, `${dim.imperial}${dim.unit} → ${dim.metric}mm`),
                    dim.confidence < 85 
                      ? React.createElement(AlertCircle, { size: 16, color: '#ef4444' })
                      : React.createElement(Check, { size: 16, color: '#22c55e' })
                  ),
                  React.createElement('div', {
                    style: { fontSize: '11px', color: '#64748b' }
                  }, `Confidence: ${dim.confidence}%${dim.confidence < 85 ? ' - Click to edit' : ''}`)
                )
              )
            )
          )
        ),
        
        // Canvas/Image area
        image ? React.createElement('div', {
          style: {
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            minHeight: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto'
          }
        },
          React.createElement('div', { style: { position: 'relative' } },
            React.createElement('img', {
              ref: imageRef,
              src: processedImage || image,
              alt: 'Drawing',
              style: {
                maxWidth: '100%',
                height: 'auto',
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
                transition: 'transform 0.3s ease',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }
            }),
            React.createElement('canvas', {
              ref: canvasRef,
              style: { display: 'none' }
            })
          )
        ) : React.createElement('div', {
          style: {
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px',
            padding: '80px 40px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
          }
        },
          React.createElement(ImageIcon, { size: 80, color: '#475569', style: { marginBottom: '24px' } }),
          React.createElement('h3', {
            style: { fontSize: '24px', marginBottom: '12px', color: '#cbd5e1' }
          }, 'No Drawing Loaded'),
          React.createElement('p', {
            style: { color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }
          }, 'Upload a technical drawing to begin the conversion process. The system will detect imperial dimensions and overlay metric conversions with confidence indicators.')
        )
      ),
      
      // Legend
      dimensions.length > 0 && React.createElement('div', {
        style: {
          marginTop: '32px',
          padding: '20px',
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '12px',
          display: 'flex',
          gap: '32px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }
      },
        React.createElement('div', {
          style: { display: 'flex', alignItems: 'center', gap: '8px' }
        },
          React.createElement('div', {
            style: { width: '20px', height: '20px', background: '#3b82f6', borderRadius: '4px' }
          }),
          React.createElement('span', {
            style: { fontSize: '14px', color: '#cbd5e1' }
          }, 'Imperial (Original)')
        ),
        React.createElement('div', {
          style: { display: 'flex', alignItems: 'center', gap: '8px' }
        },
          React.createElement('div', {
            style: { width: '20px', height: '20px', background: '#22c55e', borderRadius: '4px' }
          }),
          React.createElement('span', {
            style: { fontSize: '14px', color: '#cbd5e1' }
          }, 'Metric (High Confidence)')
        ),
        React.createElement('div', {
          style: { display: 'flex', alignItems: 'center', gap: '8px' }
        },
          React.createElement('div', {
            style: { width: '20px', height: '20px', background: '#ef4444', borderRadius: '4px' }
          }),
          React.createElement('span', {
            style: { fontSize: '14px', color: '#cbd5e1' }
          }, 'Metric (Low Confidence - Click to Edit)')
        )
      )
    ),
    
    // Edit Modal
    selectedDimension && React.createElement('div', {
      onClick: () => setSelectedDimension(null),
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }
    },
      React.createElement('div', {
        onClick: (e) => e.stopPropagation(),
        style: {
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)'
        }
      },
        React.createElement('h3', {
          style: {
            fontSize: '20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#e2e8f0'
          }
        },
          React.createElement(Edit3, { size: 24, color: '#3b82f6' }),
          'Edit Dimension'
        ),
        React.createElement('div', { style: { marginBottom: '20px' } },
          React.createElement('label', {
            style: { display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }
          }, 'Imperial Value (inches)'),
          React.createElement('input', {
            type: 'text',
            value: editValue,
            onChange: (e) => setEditValue(e.target.value),
            autoFocus: true,
            style: {
              width: '100%',
              padding: '12px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '16px',
              fontFamily: '"IBM Plex Mono", monospace'
            }
          })
        ),
        React.createElement('div', {
          style: {
            padding: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            marginBottom: '24px'
          }
        },
          React.createElement('div', {
            style: { fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }
          }, 'Converted Value:'),
          React.createElement('div', {
            style: { fontSize: '18px', color: '#3b82f6', fontFamily: '"IBM Plex Mono", monospace', fontWeight: '600' }
          }, `${editValue ? (parseFloat(editValue) * 25.4).toFixed(2) : '0.00'} mm`)
        ),
        React.createElement('div', { style: { display: 'flex', gap: '12px' } },
          React.createElement('button', {
            onClick: () => setSelectedDimension(null),
            style: {
              flex: 1,
              padding: '12px',
              background: 'rgba(71, 85, 105, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '8px',
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }
          }, 'Cancel'),
          React.createElement('button', {
            onClick: saveEditedDimension,
            style: {
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
            }
          }, 'Save')
        )
      )
    ),
    
    // Styles
    React.createElement('style', null, `
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      * {
        box-sizing: border-box;
      }

      button:hover {
        filter: brightness(1.1);
      }

      button:active {
        transform: scale(0.98);
      }

      input:focus {
        outline: none;
        border-color: rgba(59, 130, 246, 0.6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.4);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.4);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: rgba(148, 163, 184, 0.6);
      }
    `)
  );
}
