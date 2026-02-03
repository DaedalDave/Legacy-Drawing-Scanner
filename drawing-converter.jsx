import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, ZoomIn, ZoomOut, RotateCw, AlertCircle, Check, Edit3, Image as ImageIcon, FileText, Settings } from 'lucide-react';

// Technical Drawing Converter App
export default function DrawingConverter() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [dimensions, setDimensions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [processingStage, setProcessingStage] = useState('');
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Simulated OCR and processing functions
  const preprocessImage = async (imageData) => {
    setProcessingStage('Preprocessing: Cleaning and enhancing image...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate image preprocessing (deskewing, denoising, contrast enhancement)
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
    
    // Simulate OCR with confidence scores
    return regions;
  };

  const processDrawing = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setDimensions([]);
    
    try {
      // Step 1: Preprocess
      const preprocessed = await preprocessImage(image);
      
      // Step 2: Detect text regions
      const regions = await detectTextRegions(preprocessed);
      
      // Step 3: Perform OCR
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
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
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
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setProcessedImage(null);
        setDimensions([]);
        setProcessingStage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDimensionClick = (dim) => {
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
      canvas.height = img.height + 80; // Add space for watermark
      
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

  useEffect(() => {
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      color: '#f1f5f9',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Geometric pattern background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.03) 0px, transparent 1px, transparent 40px, rgba(148, 163, 184, 0.03) 41px),
          repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.03) 0px, transparent 1px, transparent 40px, rgba(148, 163, 184, 0.03) 41px)
        `,
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <header style={{
          marginBottom: '48px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            padding: '8px 20px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px'
          }}>
            <FileText size={28} color="#3b82f6" />
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              margin: 0,
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              Technical Drawing Converter
            </h1>
          </div>
          <p style={{
            fontSize: '16px',
            color: '#94a3b8',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Automated conversion of imperial engineering drawings to metric dimensions with intelligent OCR and quality verification
          </p>
        </header>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: image ? '350px 1fr' : '1fr',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Control Panel */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#e2e8f0'
            }}>
              <Settings size={20} />
              Controls
            </h2>

            {/* Upload Section */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                width: '100%',
                padding: '32px 16px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '2px dashed rgba(59, 130, 246, 0.5)',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                ':hover': {
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  borderColor: 'rgba(59, 130, 246, 0.8)'
                }
              }}>
                <Upload size={40} color="#3b82f6" style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '8px' }}>
                  Upload Engineering Drawing
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  JPG, PNG, or PDF
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Process Button */}
            {image && !isProcessing && (
              <button
                onClick={processDrawing}
                style={{
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
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <RotateCw size={18} />
                  Process Drawing
                </span>
              </button>
            )}

            {/* Processing Status */}
            {isProcessing && (
              <div style={{
                padding: '16px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(59, 130, 246, 0.3)',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: '500' }}>
                    Processing...
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
                  {processingStage}
                </div>
              </div>
            )}

            {/* Export Button */}
            {processedImage && !isProcessing && (
              <button
                onClick={exportDrawing}
                style={{
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
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Download size={18} />
                  Export Drawing
                </span>
              </button>
            )}

            {/* Zoom Controls */}
            {processedImage && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <div style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '12px', fontWeight: '500' }}>
                  Zoom: {Math.round(zoom * 100)}%
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ZoomOut size={18} />
                  </button>
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ZoomIn size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Dimensions List */}
            {dimensions.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: '#e2e8f0'
                }}>
                  Detected Dimensions ({dimensions.length})
                </h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {dimensions.map((dim) => (
                    <div
                      key={dim.id}
                      onClick={() => handleDimensionClick(dim)}
                      style={{
                        padding: '12px',
                        background: dim.confidence < 85 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        border: `1px solid ${dim.confidence < 85 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                        borderRadius: '8px',
                        marginBottom: '8px',
                        cursor: dim.confidence < 85 ? 'pointer' : 'default',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#94a3b8', fontFamily: '"IBM Plex Mono", monospace' }}>
                          {dim.imperial}{dim.unit} → {dim.metric}mm
                        </span>
                        {dim.confidence < 85 ? (
                          <AlertCircle size={16} color="#ef4444" />
                        ) : (
                          <Check size={16} color="#22c55e" />
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Confidence: {dim.confidence}%
                        {dim.confidence < 85 && ' - Click to edit'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Canvas Area */}
          {image && (
            <div style={{
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
            }}>
              <div style={{ position: 'relative' }}>
                <img
                  ref={imageRef}
                  src={processedImage || image}
                  alt="Drawing"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!image && (
            <div style={{
              background: 'rgba(30, 41, 59, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '16px',
              padding: '80px 40px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
            }}>
              <ImageIcon size={80} color="#475569" style={{ marginBottom: '24px' }} />
              <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#cbd5e1' }}>
                No Drawing Loaded
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>
                Upload a technical drawing to begin the conversion process. The system will detect imperial dimensions and overlay metric conversions with confidence indicators.
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        {dimensions.length > 0 && (
          <div style={{
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
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', background: '#3b82f6', borderRadius: '4px' }} />
              <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Imperial (Original)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', background: '#22c55e', borderRadius: '4px' }} />
              <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Metric (High Confidence)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', background: '#ef4444', borderRadius: '4px' }} />
              <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Metric (Low Confidence - Click to Edit)</span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedDimension && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setSelectedDimension(null)}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#e2e8f0'
            }}>
              <Edit3 size={24} color="#3b82f6" />
              Edit Dimension
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
                Imperial Value (inches)
              </label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: '16px',
                  fontFamily: '"IBM Plex Mono", monospace'
                }}
                autoFocus
              />
            </div>

            <div style={{
              padding: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
                Converted Value:
              </div>
              <div style={{ fontSize: '18px', color: '#3b82f6', fontFamily: '"IBM Plex Mono", monospace', fontWeight: '600' }}>
                {editValue ? (parseFloat(editValue) * 25.4).toFixed(2) : '0.00'} mm
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setSelectedDimension(null)}
                style={{
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
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveEditedDimension}
                style={{
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
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
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
      `}</style>
    </div>
  );
}