'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { editPhoto } from '@/ai/flows/edit-photo-flow';

// Helper to convert file to data URI
function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


export function PhotoEditor() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditedImage(null); // Clear previous result
      const dataUri = await fileToDataUri(file);
      setSourceImage(dataUri);
    }
  };

  const handleGenerateClick = async () => {
    if (!sourceImage) {
      toast({
        variant: 'destructive',
        title: 'No Image Selected',
        description: 'Please upload an image to edit.',
      });
      return;
    }
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'No Prompt Provided',
        description: 'Please enter a prompt to describe your edits.',
      });
      return;
    }

    setIsGenerating(true);
    setEditedImage(null);

    try {
      const result = await editPhoto({
        photoDataUri: sourceImage,
        prompt: prompt,
      });
      setEditedImage(result.editedPhotoDataUri);
    } catch (error: any) {
      console.error('AI photo editing failed:', error);
      toast({
        variant: 'destructive',
        title: 'Editing Failed',
        description: error.message || 'The AI model could not edit the image. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Photo Editor</CardTitle>
        <CardDescription>Upload an image and use a text prompt to edit it with AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="photo-upload">Upload Image</Label>
            <Input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {(sourceImage || editedImage || isGenerating) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Original</Label>
                    <div className="aspect-square w-full rounded-md border flex items-center justify-center bg-secondary">
                        {sourceImage ? (
                            <Image src={sourceImage} alt="Original" width={400} height={400} className="rounded-md object-contain max-h-full" />
                        ) : (
                           <p className="text-muted-foreground">No image uploaded</p>
                        )}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Edited</Label>
                    <div className="aspect-square w-full rounded-md border flex items-center justify-center bg-secondary">
                        {isGenerating && <Loader2 className="h-8 w-8 animate-spin" />}
                        {!isGenerating && editedImage && (
                             <Image src={editedImage} alt="Edited" width={400} height={400} className="rounded-md object-contain max-h-full" />
                        )}
                        {!isGenerating && !editedImage && <p className="text-muted-foreground">AI result will appear here</p>}
                    </div>
                </div>
            </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="edit-prompt">Editing Prompt</Label>
          <Textarea 
            id="edit-prompt"
            placeholder="e.g., 'make the background a futuristic city at night', 'turn this into a watercolor painting'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={!sourceImage || isGenerating}
          />
        </div>

        <Button onClick={handleGenerateClick} disabled={!sourceImage || isGenerating} className="w-full">
          {isGenerating ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
          ) : (
            <><Wand2 className="mr-2 h-4 w-4" /> Generate Edited Image</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
