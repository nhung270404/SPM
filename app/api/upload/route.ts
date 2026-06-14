import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a unique filename
        const originalName = file.name;
        const extension = path.extname(originalName);
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const fileName = `${uniqueId}${extension}`;
        
        // Define path to save file
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, fileName);

        // Write file
        await writeFile(filePath, buffer);
        
        // Return public URL
        const fileUrl = `/uploads/${fileName}`;

        return NextResponse.json({ 
            url: fileUrl, 
            name: originalName,
            size: file.size
        });
    } catch (error: unknown) {
        console.error('Upload error:', error);

        const message =
            error instanceof Error ? error.message : 'Internal Server Error';

        return NextResponse.json(
            {
                error: 'Internal Server Error',
                details: message,
            },
            { status: 500 }
        );
    }
}
