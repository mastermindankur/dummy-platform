import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const credentialsFilePath = path.join(process.cwd(), 'src', 'lib', 'data', 'access.json');

async function getCredentials() {
    try {
        const fileContent = await fs.readFile(credentialsFilePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Could not read credentials file:", error);
        // Default credentials if file doesn't exist
        return { key: 'admin', value: 'admin' };
    }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    const credentials = await getCredentials();

    if (key === credentials.key && value === credentials.value) {
      return new NextResponse('Login successful', { status: 200 });
    } else {
      return new NextResponse('Invalid credentials', { status: 401 });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
