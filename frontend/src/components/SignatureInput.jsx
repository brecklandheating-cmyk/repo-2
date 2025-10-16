import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const SignatureInput = ({ value, onChange }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [mode, setMode] = useState('draw'); // 'draw' or 'upload'
  
  useEffect(() => {
    if (value && !uploadedImage) {
      setUploadedImage(value);
      setMode('upload');
      setHasSignature(true);
    }
  }, [value]);
  
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    setHasSignature(true);
  };
  
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };
  
  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setUploadedImage(null);
    onChange(null);
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setUploadedImage(dataUrl);
        setHasSignature(true);
        onChange(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          variant={mode === 'draw' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setMode('draw');
            clearSignature();
          }}
          data-testid="draw-signature-btn"
        >
          Draw Signature
        </Button>
        <Button
          type="button"
          variant={mode === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('upload')}
          data-testid="upload-signature-btn"
        >
          Upload Signature
        </Button>
      </div>
      
      {mode === 'draw' ? (
        <Card className="p-4">
          <div className="space-y-2">
            <Label>Draw your signature below (supports touch/stylus)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full cursor-crosshair bg-white touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                data-testid="signature-canvas"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSignature}
                disabled={!hasSignature}
                data-testid="clear-signature-btn"
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="space-y-2">
            <Label htmlFor="signature-upload">Upload signature image</Label>
            <input
              id="signature-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              data-testid="signature-file-input"
            />
            {uploadedImage && (
              <div className="mt-4">
                <img
                  src={uploadedImage}
                  alt="Signature"
                  className="max-w-full h-auto border border-gray-300 rounded"
                  style={{ maxHeight: '200px' }}
                  data-testid="uploaded-signature-preview"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSignature}
                  className="mt-2"
                  data-testid="clear-uploaded-signature-btn"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SignatureInput;