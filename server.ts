import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import helmet from 'helmet';

import axios from 'axios';

// --- Hardcoded Environment Variables for 100% Reliability ---
const TELEGRAM_BOT_TOKENS = [
  '8601992984:AAHpH95jY-beedPVBJOHB_OesEKUlFjMmGI', // @ponloe_bot
  '8257808380:AAGrVLSaXFRntM1gdLSXz3LAEwSAIzuM1G0', // @PonloeBot
  '8658491430:AAHLJDLh8LSBYyn7g7T-l2lLKbXFS3BEfhY'  // @PonloeAppBot
];
process.env.TELEGRAM_CHANNEL_ID = '-1001003526327706';
process.env.VITE_SUPABASE_URL = 'https://jposixqotpxzaafnmsjx.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb3NpeHFvdHB4emFhZm5tc2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDk2MTUsImV4cCI6MjA4NzU4NTYxNX0.RjTWWkrydyezytKP5EwnE2fA9kyhT-STewns14kUTw4';

const app = express();
const PORT = 3000;

// --- Security Middlewares ---
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const isR2Configured = !!(process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// --- Proxy Helper ---
async function proxyRequest(req: express.Request, res: express.Response, next: express.NextFunction, targetUrl: string, options: any = {}) {
  try {
    console.log(`Proxying request to: ${targetUrl}`);
    const response = await axios({
      url: targetUrl,
      method: options.method || req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ...(options.headers || {}),
      },
      data: ['POST', 'PUT', 'PATCH'].includes(req.method) ? (options.body || req.body) : undefined,
      timeout: 15000, // 15s timeout
      responseType: 'arraybuffer'
    });

    const contentType = response.headers['content-type'];
    if (contentType) res.setHeader('Content-Type', contentType);

    res.send(Buffer.from(response.data));
  } catch (error: any) {
    console.error(`Proxy Error for ${targetUrl}:`, error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Gateway Timeout', message: 'The external API took too long to respond.' });
    }

    const status = error.response?.status || 500;
    const message = error.response?.data?.toString() || error.message;
    
    res.status(status).json({ 
      error: 'Proxy Error', 
      status,
      message: message.substring(0, 200)
    });
  }
}

// --- Telegram API Routes ---

const TELEGRAM_CHANNEL_ID = '-1001003526327706'; // Added -100 prefix automatically
const CHAT_ID = TELEGRAM_CHANNEL_ID;

async function fetchTelegramWithFallback(createRequest: (token: string) => Promise<Response>) {
  let lastData: any = null;
  for (const token of TELEGRAM_BOT_TOKENS) {
    try {
      const response = await createRequest(token);
      const data = await response.json();
      if (data.ok) {
        return { ok: true, token, data };
      }
      lastData = data;
      
      // If the file is too big, it's a hard limit of Telegram API (20MB for getFile).
      // No point in trying other bots.
      if (data.description && data.description.includes('file is too big')) {
        return { ok: false, data: lastData };
      }
      
      // If wrong file_id, it just means this specific bot can't access it.
      // We don't need to spam the console, just try the next bot.
      if (data.description && data.description.includes('wrong file_id')) {
        continue;
      }
      
      console.warn(`Telegram API failed for bot ${token.split(':')[0]}:`, data.description);
    } catch (error) {
      console.warn(`Telegram network error for bot ${token.split(':')[0]}:`, error);
      lastData = { description: error instanceof Error ? error.message : String(error) };
    }
  }
  return { ok: false, data: lastData };
}
const TOPICS = {
  images: 2,
  audios: 3,
  videos: 4,
  voice: 5,
  reels: 6,
  market: 7,
  book: 8
};

// Set up multer with limits
const uploadAudio = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadImage = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadVideo = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 600 * 1024 * 1024 } // 600MB
});

// Helper to handle multer errors
const handleUpload = (uploadMiddleware: any) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    uploadMiddleware(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'ឯកសារធំពេក សូមជ្រើសរើសទំហំតូចជាងនេះ (អតិបរមា: រូបភាព/សំឡេង 10MB, វីដេអូ 600MB)។' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: err.message });
      }
      next();
    });
  };
};

app.post('/api/upload', handleUpload(uploadAudio.single('audio')), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      throw new AppError('No audio file uploaded', 400);
    }

    const isVoice = req.body.type === 'voice';
    const topicId = isVoice ? TOPICS.voice : TOPICS.audios;
    const endpoint = isVoice ? 'sendVoice' : 'sendAudio';

    const result = await fetchTelegramWithFallback((token) => {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('message_thread_id', topicId.toString());
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append(isVoice ? 'voice' : 'audio', blob, file.originalname);
      
      return fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
        method: 'POST',
        body: formData,
      });
    });

    if (!result.ok) {
      throw new AppError(`Telegram API Error: ${result.data?.description || 'Failed to upload'}`, 502);
    }

    const data = result.data;

    const fileId = isVoice ? data.result.voice.file_id : data.result.audio.file_id;
    const messageId = data.result.message_id;

    res.json({ success: true, fileId, messageId, chatId: CHAT_ID, topicId });
  } catch (error) {
    next(error);
  }
});

app.post('/api/upload-from-url', async (req, res) => {
  try {
    const { url, type } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // 1. Download the file from the URL
    const fileResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!fileResponse.ok) {
      return res.status(400).json({ error: `Failed to fetch from URL: ${fileResponse.statusText}` });
    }
    
    const contentType = fileResponse.headers.get('content-type') || 'audio/mpeg';
    
    // Validate that it is an audio file
    if (!contentType.startsWith('audio/') && !contentType.startsWith('video/') && contentType !== 'application/octet-stream') {
        return res.status(400).json({ error: `URL does not point to a valid audio file. Content-Type: ${contentType}` });
    }

    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Extract filename from URL or use default
    const urlPath = new URL(url).pathname;
    let filename = urlPath.split('/').pop() || `audio_${Date.now()}.mp3`;
    
    // Ensure extension matches content type if missing
    if (!filename.includes('.')) {
        const ext = contentType.split('/')[1] || 'mp3';
        filename = `${filename}.${ext}`;
    }

    // 2. Upload to Telegram
    const isVoice = type === 'voice';
    const topicId = isVoice ? TOPICS.voice : TOPICS.audios;
    const endpoint = isVoice ? 'sendVoice' : 'sendAudio';

    const result = await fetchTelegramWithFallback((token) => {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('message_thread_id', topicId.toString());
      const blob = new Blob([buffer], { type: contentType });
      formData.append(isVoice ? 'voice' : 'audio', blob, filename);
      
      return fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
        method: 'POST',
        body: formData,
      });
    });

    if (!result.ok) {
      console.error('Telegram API Error:', result.data);
      return res.status(500).json({ error: 'Failed to upload to Telegram', details: result.data });
    }

    const data = result.data;

    const fileId = isVoice ? data.result.voice.file_id : data.result.audio.file_id;
    const messageId = data.result.message_id;

    res.json({ success: true, fileId, messageId, chatId: CHAT_ID, topicId });
  } catch (error: any) {
    console.error('Upload from URL error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/upload-image', handleUpload(uploadImage.single('image')), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    let topicId = TOPICS.images;
    if (req.body.topicType === 'market') topicId = TOPICS.market;
    if (req.body.topicType === 'book') topicId = TOPICS.book;

    const result = await fetchTelegramWithFallback((token) => {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('message_thread_id', topicId.toString());
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('photo', blob, file.originalname);
      
      return fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });
    });

    if (!result.ok) {
      console.error('Telegram API Error:', result.data);
      return res.status(500).json({ error: 'Failed to upload to Telegram', details: result.data });
    }

    const data = result.data;

    const photoArray = data.result.photo;
    const largestPhoto = photoArray[photoArray.length - 1];
    const fileId = largestPhoto.file_id;
    const messageId = data.result.message_id;

    res.json({ success: true, fileId, messageId, chatId: CHAT_ID, topicId });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const uploadDocument = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

app.post('/api/upload-document', handleUpload(uploadDocument.single('document')), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No document file uploaded' });
    }

    const topicId = TOPICS.book;

    const result = await fetchTelegramWithFallback((token) => {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('message_thread_id', topicId.toString());
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('document', blob, file.originalname);
      
      return fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
        method: 'POST',
        body: formData,
      });
    });

    if (!result.ok) {
      console.error('Telegram API Error:', result.data);
      return res.status(500).json({ error: 'Failed to upload to Telegram', details: result.data });
    }

    const data = result.data;

    const fileId = data.result.document.file_id;
    const messageId = data.result.message_id;

    res.json({ success: true, fileId, messageId, chatId: CHAT_ID, topicId });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/document/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const fileResult = await fetchTelegramWithFallback((token) => 
      fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`)
    );

    if (!fileResult.ok) {
      const isTooBig = fileResult.data?.description?.includes('file is too big');
      return res.status(isTooBig ? 400 : 404).json({ 
        error: isTooBig ? 'File is too large to stream via Telegram (20MB limit)' : 'File not found on Telegram' 
      });
    }

    const { token: botToken, data: fileData } = fileResult;
    const filePath = fileData.result.file_path;
    const docUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    const docStreamResponse = await fetch(docUrl);

    if (!docStreamResponse.ok) {
      return res.status(500).json({ error: 'Failed to stream document' });
    }

    res.setHeader('Content-Type', docStreamResponse.headers.get('content-type') || 'application/pdf');
    res.setHeader('Content-Length', docStreamResponse.headers.get('content-length') || '');
    
    if (docStreamResponse.body && typeof (docStreamResponse.body as any).pipe === 'function') {
      (docStreamResponse.body as any).pipe(res);
    } else if (docStreamResponse.body) {
      const { Readable } = await import('stream');
      Readable.fromWeb(docStreamResponse.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/upload-video', handleUpload(uploadVideo.single('video')), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    if (isR2Configured) {
      const key = `videos/${Date.now()}-${file.originalname}`;
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });
      await upload.done();
      const url = `${process.env.R2_PUBLIC_URL}/${key}`;
      return res.json({ success: true, url, type: 'r2' });
    }

    const isReel = req.body.type === 'reel';
    const topicId = isReel ? TOPICS.reels : TOPICS.videos;

    const result = await fetchTelegramWithFallback((token) => {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('message_thread_id', topicId.toString());
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('video', blob, file.originalname);
      
      return fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
        method: 'POST',
        body: formData,
      });
    });

    if (!result.ok) {
      console.error('Telegram API Error (Video):', JSON.stringify(result.data, null, 2));
      return res.status(500).json({ error: `Telegram Error: ${result.data?.description || 'Failed to upload video'}`, details: result.data });
    }

    const data = result.data;

    const fileId = data.result.video.file_id;
    const messageId = data.result.message_id;

    res.json({ success: true, fileId, messageId, chatId: CHAT_ID, topicId });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/video/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const fileResult = await fetchTelegramWithFallback((token) => 
      fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`)
    );

    if (!fileResult.ok) {
      const isTooBig = fileResult.data?.description?.includes('file is too big');
      return res.status(isTooBig ? 400 : 404).json({ 
        error: isTooBig ? 'File is too large to stream via Telegram (20MB limit)' : 'File not found on Telegram' 
      });
    }

    const { token: botToken, data: fileData } = fileResult;
    const filePath = fileData.result.file_path;
    const videoUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    
    // For video, we should ideally handle range requests, but for now we'll stream it directly
    // and let the browser handle it. To support seeking, we pass the range header if present.
    const fetchOptions: any = {};
    if (req.headers.range) {
      fetchOptions.headers = { Range: req.headers.range };
    }

    const videoStreamResponse = await fetch(videoUrl, fetchOptions);

    if (!videoStreamResponse.ok && videoStreamResponse.status !== 206) {
      return res.status(500).json({ error: 'Failed to stream video' });
    }

    // Forward headers
    res.status(videoStreamResponse.status);
    res.setHeader('Content-Type', videoStreamResponse.headers.get('content-type') || 'video/mp4');
    
    const contentLength = videoStreamResponse.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    
    const contentRange = videoStreamResponse.headers.get('content-range');
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
    }
    
    res.setHeader('Accept-Ranges', 'bytes');

    if (videoStreamResponse.body && typeof (videoStreamResponse.body as any).pipe === 'function') {
      (videoStreamResponse.body as any).pipe(res);
    } else if (videoStreamResponse.body) {
      const { Readable } = await import('stream');
      Readable.fromWeb(videoStreamResponse.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/audio/:fileId', async (req, res) => {
  const { fileId } = req.params;
  console.log(`GET /api/audio/${fileId} requested`);
  try {
    // 1. Get file path from Telegram
    const fileResult = await fetchTelegramWithFallback((token) => 
      fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`)
    );

    if (!fileResult.ok) {
      const isTooBig = fileResult.data?.description?.includes('file is too big');
      return res.status(isTooBig ? 400 : 404).json({ 
        error: isTooBig ? 'File is too large to stream via Telegram (20MB limit)' : 'File not found on Telegram' 
      });
    }

    const { token: botToken, data: fileData } = fileResult;
    const filePath = fileData.result.file_path;

    // 2. Stream the file back to the client
    const audioUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    console.log(`Streaming audio from Telegram: ${audioUrl}`);
    const audioStreamResponse = await fetch(audioUrl);

    if (!audioStreamResponse.ok) {
      console.error(`Failed to fetch audio from Telegram: ${audioStreamResponse.status}`);
      return res.status(500).json({ error: 'Failed to stream audio' });
    }

    // Forward headers
    res.setHeader('Content-Type', audioStreamResponse.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Content-Length', audioStreamResponse.headers.get('content-length') || '');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache audio for 1 year

    if (audioStreamResponse.body && typeof (audioStreamResponse.body as any).pipe === 'function') {
      (audioStreamResponse.body as any).pipe(res);
    } else if (audioStreamResponse.body) {
      const { Readable } = await import('stream');
      Readable.fromWeb(audioStreamResponse.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Stream error for audio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/image/:fileId', async (req, res) => {
  const { fileId } = req.params;
  console.log(`GET /api/image/${fileId} requested`);
  try {
    // 1. Get file path from Telegram
    const fileResult = await fetchTelegramWithFallback((token) => 
      fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`)
    );

    if (!fileResult.ok) {
      const isTooBig = fileResult.data?.description?.includes('file is too big');
      return res.status(isTooBig ? 400 : 404).json({ 
        error: isTooBig ? 'File is too large to stream via Telegram (20MB limit)' : 'File not found on Telegram' 
      });
    }

    const { token: botToken, data: fileData } = fileResult;
    const filePath = fileData.result.file_path;

    // 2. Stream the file back to the client
    const imageUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    console.log(`Streaming image from Telegram: ${imageUrl}`);
    const imageStreamResponse = await fetch(imageUrl);

    if (!imageStreamResponse.ok) {
      console.error(`Failed to fetch image from Telegram: ${imageStreamResponse.status}`);
      return res.status(500).json({ error: 'Failed to stream image' });
    }

    // Forward headers
    res.setHeader('Content-Type', imageStreamResponse.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Content-Length', imageStreamResponse.headers.get('content-length') || '');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache images for 1 year

    if (imageStreamResponse.body && typeof (imageStreamResponse.body as any).pipe === 'function') {
      (imageStreamResponse.body as any).pipe(res);
    } else if (imageStreamResponse.body) {
      const { Readable } = await import('stream');
      Readable.fromWeb(imageStreamResponse.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Stream error for image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- External API Routes ---

app.get(['/api/quranenc/:translationKey/:surahNumber', '/quranenc/:translationKey/:surahNumber'], async (req, res, next) => {
  const { translationKey, surahNumber } = req.params;
  const url = `https://quranenc.com/api/v1/translation/sura/${translationKey}/${surahNumber}`;
  await proxyRequest(req, res, next, url);
});

app.get(['/api/alquran/*path', '/alquran/*path'], async (req, res, next) => {
  const endpoint = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
  const queryParams = new URLSearchParams(req.query as any).toString();
  const url = `https://api.alquran.cloud/v1/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  await proxyRequest(req, res, next, url);
});

app.get(['/api/qurancdn/*path', '/qurancdn/*path'], async (req, res, next) => {
  const endpoint = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
  const queryParams = new URLSearchParams(req.query as any).toString();
  const url = `https://api.qurancdn.com/api/qdc/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  await proxyRequest(req, res, next, url);
});

app.get(['/api/quran/*path', '/quran/*path'], async (req, res, next) => {
  const endpoint = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
  const queryParams = new URLSearchParams(req.query as any).toString();
  const url = `https://api.quran.com/api/v4/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  await proxyRequest(req, res, next, url);
});

app.get(['/api/pt/cal', '/pt/cal'], async (req, res, next) => {
  const { year, month, latitude, longitude, method, school, adjustment } = req.query;
  const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}&adjustment=${adjustment}`;
  await proxyRequest(req, res, next, url);
});

app.get(['/api/pt/gToH', '/pt/gToH'], async (req, res, next) => {
  const { month, year, method } = req.query;
  const url = `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}?method=${method}`;
  await proxyRequest(req, res, next, url);
});

app.get(['/api/nominatim/reverse', '/nominatim/reverse'], async (req, res, next) => {
  const { lat, lon, zoom, 'accept-language': acceptLanguage } = req.query;
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=${zoom}&accept-language=${acceptLanguage}`;
  await proxyRequest(req, res, next, url, {
    headers: { 'User-Agent': 'Ponloe.org/3.4 (creative.ponloe.org@gmail.com)' }
  });
});

app.get('/api/proxy-audio', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid URL' });
    }

    const fetchOptions: any = {};
    if (req.headers.range) {
      fetchOptions.headers = { Range: req.headers.range };
    }

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok && response.status !== 206) {
      return res.status(response.status).json({ error: `Failed to fetch audio: ${response.statusText}` });
    }

    // Forward headers
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    
    const contentRange = response.headers.get('content-range');
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
    }
    
    res.setHeader('Accept-Ranges', 'bytes');

    if (response.body && typeof (response.body as any).pipe === 'function') {
      (response.body as any).pipe(res);
    } else if (response.body) {
      const { Readable } = await import('stream');
      Readable.fromWeb(response.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Proxy audio error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const LOGIN_BOT_TOKEN = '8257808380:AAGrVLSaXFRntM1gdLSXz3LAEwSAIzuM1G0'; // @PonloeBot

app.get('/api/telegram/updates', async (req, res) => {
  try {
    const { offset } = req.query;
    const offsetParam = offset ? `&offset=${offset}` : '';
    const response = await fetch(`https://api.telegram.org/bot${LOGIN_BOT_TOKEN}/getUpdates?timeout=10${offsetParam}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Telegram updates:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

app.post('/api/telegram/send', async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const response = await fetch(`https://api.telegram.org/bot${LOGIN_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text, 
        parse_mode: 'HTML' 
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// --- Error Handling Middleware ---
class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(`[Error] ${req.method} ${req.url}:`, {
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

app.use(errorHandler);

// --- Error Handling ---
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.path
  });
});

export default function (req: any, res: any, next?: any) {
  if (next) {
    return app(req, res, next);
  }
  return app(req, res);
}
