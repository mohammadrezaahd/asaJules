import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import { NextApiRequest, NextApiResponse } from 'next';

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = new NextResponse();
  const apiReq = req as any;
  const apiRes = res as any;

  try {
    await runMiddleware(apiReq, apiRes, upload.single('file'));

    const file = apiReq.file;
    if (!file) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }

    await dbConnect();
    const newMedia = new Media({
      filename: file.filename,
      filepath: `/uploads/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy: token.id,
    });
    await newMedia.save();

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}