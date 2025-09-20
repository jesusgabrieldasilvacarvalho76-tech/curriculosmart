import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, User } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoChange: (file: File | null) => void;
  currentPhoto?: string;
}

export const PhotoUpload = ({ onPhotoChange, currentPhoto }: PhotoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('A foto deve ter no máximo 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onPhotoChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPreview(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
      <div className="text-center">
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview da foto"
              className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-primary/20"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
              onClick={removePhoto}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="w-32 h-32 bg-muted rounded-full mx-auto flex items-center justify-center">
            <User className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        
        <div className="mt-4 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {preview ? 'Alterar Foto' : 'Adicionar Foto'}
          </Button>
          <p className="text-sm text-muted-foreground">
            JPG, PNG ou WEBP. Máximo 5MB.
          </p>
        </div>
      </div>
    </Card>
  );
};