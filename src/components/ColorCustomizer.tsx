import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Type } from 'lucide-react';

export interface ColorTheme {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  fontFamily: string;
}

interface ColorCustomizerProps {
  selectedTheme: ColorTheme;
  onThemeChange: (theme: ColorTheme) => void;
}

export interface FontOption {
  name: string;
  family: string;
  displayName: string;
}

const fontOptions: FontOption[] = [
  { name: "Clássico", family: "classic", displayName: "Times New Roman" },
  { name: "Moderno", family: "sans", displayName: "Inter" },
  { name: "Elegante", family: "playfair", displayName: "Playfair Display" },
  { name: "Profissional", family: "source-sans", displayName: "Source Sans Pro" },
  { name: "Tradicional", family: "merriweather", displayName: "Merriweather" },
  { name: "Clean", family: "open-sans", displayName: "Open Sans" },
  { name: "Sofisticado", family: "lora", displayName: "Lora" }
];

const colorThemes: { name: string; theme: ColorTheme }[] = [
  {
    name: "Clássico Profissional",
    theme: {
      primary: "0 0% 0%",
      accent: "0 0% 40%",
      background: "0 0% 100%",
      foreground: "0 0% 0%",
      fontFamily: "classic"
    }
  },
  {
    name: "Azul Profissional",
    theme: {
      primary: "214 84% 56%",
      accent: "45 93% 47%",
      background: "0 0% 100%",
      foreground: "216 15% 15%",
      fontFamily: "sans"
    }
  },
  {
    name: "Verde Corporativo",
    theme: {
      primary: "142 76% 36%",
      accent: "45 93% 47%",
      background: "0 0% 100%",
      foreground: "216 15% 15%",
      fontFamily: "source-sans"
    }
  },
  {
    name: "Roxo Moderno",
    theme: {
      primary: "262 83% 58%",
      accent: "45 93% 47%",
      background: "0 0% 100%",
      foreground: "216 15% 15%",
      fontFamily: "open-sans"
    }
  },
  {
    name: "Cinza Elegante",
    theme: {
      primary: "215 28% 17%",
      accent: "45 93% 47%",
      background: "0 0% 100%",
      foreground: "216 15% 15%",
      fontFamily: "playfair"
    }
  },
  {
    name: "Verde Esmeralda",
    theme: {
      primary: "158 64% 52%",
      accent: "45 93% 47%",
      background: "0 0% 100%",
      foreground: "216 15% 15%",
      fontFamily: "lora"
    }
  }
];

export const ColorCustomizer = ({ selectedTheme, onThemeChange }: ColorCustomizerProps) => {
  const handleFontChange = (fontFamily: string) => {
    onThemeChange({
      ...selectedTheme,
      fontFamily
    });
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Color Themes Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-heading-sm">Personalizar Cores</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Escolha um tema de cores para seu currículo
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {colorThemes.map((colorTheme) => (
            <Button
              key={colorTheme.name}
              variant={selectedTheme.primary === colorTheme.theme.primary ? "default" : "outline"}
              className="h-auto p-3 justify-start"
              onClick={() => onThemeChange(colorTheme.theme)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: `hsl(${colorTheme.theme.primary})` }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: `hsl(${colorTheme.theme.accent})` }}
                  />
                </div>
                <span className="text-sm font-medium">{colorTheme.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Font Selection Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-5 h-5 text-primary" />
          <h3 className="text-heading-sm">Escolher Fonte</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Selecione a fonte que melhor representa seu estilo profissional
        </p>
        
        <div className="grid grid-cols-1 gap-2">
          {fontOptions.map((font) => (
            <Button
              key={font.family}
              variant={selectedTheme.fontFamily === font.family ? "default" : "outline"}
              className="h-auto p-3 justify-start"
              onClick={() => handleFontChange(font.family)}
            >
              <div className="flex items-center gap-3 w-full">
                <span 
                  className={`text-lg font-${font.family}`}
                  style={{ fontFamily: font.displayName }}
                >
                  Aa
                </span>
                <div className="text-left">
                  <div className="text-sm font-medium">{font.name}</div>
                  <div className="text-xs text-muted-foreground">{font.displayName}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};