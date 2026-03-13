import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import helmet from 'helmet';

import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ 
  keepAlive: true,
  timeout: 60000,
});

// --- Hardcoded Environment Variables for 100% Reliability ---
const TELEGRAM_BOT_TOKENS = [
  '8257808380:AAGrVLSaXFRntM1gdLSXz3LAEwSAIzuM1G0', // @PonloeBot (Priority)
  '8601992984:AAHpH95jY-beedPVBJOHB_OesEKUlFjMmGI', // @ponloe_bot
  '8658491430:AAHLJDLh8LSBYyn7g7T-l2lLKbXFS3BEfhY'  // @PonloeAppBot
];
process.env.TELEGRAM_BOT_TOKEN = TELEGRAM_BOT_TOKENS[0];
process.env.TELEGRAM_CHANNEL_ID = '-1003526327706';
process.env.VITE_SUPABASE_URL = 'https://jposixqotpxzaafnmsjx.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb3NpeHFvdHB4emFhZm5tc2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDk2MTUsImV4cCI6MjA4NzU4NTYxNX0.RjTWWkrydyezytKP5EwnE2fA9kyhT-STewns14kUTw4';

const app = express();
const PORT = 3000;

// --- Security Middlewares ---
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

let s3Client: S3Client | null = null;
function getS3Client() {
  if (s3Client !== null) return s3Client;
  const isR2Configured = !!(process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME);
  if (isR2Configured) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return s3Client;
}

const isR2Configured = !!(process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// --- Proxy Helper ---
async function proxyRequest(req: express.Request, res: express.Response, next: express.NextFunction, targetUrl: string, options: any = {}) {
  let retries = 2;
  while (retries >= 0) {
    try {
      console.log(`Proxying request to: ${targetUrl} (Retries left: ${retries})`);
      const response = await axios({
        url: targetUrl,
        method: options.method || req.method,
        httpsAgent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://ponloe.org',
          'Referer': 'https://ponloe.org/',
          ...(options.headers || {}),
        },
        data: ['POST', 'PUT', 'PATCH'].includes(req.method) ? (options.body || req.body) : undefined,
        timeout: 15000, // 15s timeout
        responseType: 'arraybuffer'
      });

      const contentType = response.headers['content-type'];
      if (contentType) res.setHeader('Content-Type', contentType);

      return res.send(Buffer.from(response.data));
    } catch (error: any) {
      const isNetworkError = !error.response || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.message.includes('socket disconnected');
      
      if (isNetworkError && retries > 0) {
        retries--;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        continue;
      }

      console.error(`Proxy Error for ${targetUrl}:`, error.message);
      
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'Gateway Timeout', message: 'The external API took too long to respond.' });
      }

      const status = error.response?.status || 500;
      const message = error.response?.data?.toString() || error.message;
      
      return res.status(status).json({ 
        error: 'Proxy Error', 
        status,
        message: message.substring(0, 200)
      });
    }
  }
}

// --- Telegram API Routes ---

const TELEGRAM_CHANNEL_ID = '-1003526327706'; // Fixed: removed extra 100 prefix

const CHAT_ID = TELEGRAM_CHANNEL_ID;

// Helper for Telegram operations with better logging
async function callTelegram(method: string, params: any = {}) {
  const token = TELEGRAM_BOT_TOKENS[0]; // Always use the primary bot for consistency
  try {
    const response = await axios.post(`https://api.telegram.org/bot${token}/${method}`, params, {
      timeout: 10000,
    });
    return response.data;
  } catch (error: any) {
    console.error(`Telegram API Error (${method}):`, error.response?.data || error.message);
    throw error;
  }
}

// Keep tryTelegram for backward compatibility if needed, but refactor it
async function tryTelegram(operation: (token: string) => Promise<any>) {
  let lastError = null;
  for (let i = 0; i < TELEGRAM_BOT_TOKENS.length; i++) {
    const token = TELEGRAM_BOT_TOKENS[i];
    try {
      return await operation(token);
    } catch (error: any) {
      lastError = error;
      // Only log warning for primary bot if it's NOT a "not found" error
      // "File not found" is expected if the file was uploaded by a different bot
      if (i === 0) {
        const isNotFound = error.message === 'File not found on Telegram' || 
                          error.message.includes('Bad Request: invalid file id') ||
                          error.message.includes('Bad Request: file_id_invalid');
        
        if (!isNotFound) {
          console.warn(`Telegram primary bot error:`, error.message);
        }
      }
    }
  }
  throw lastError || new Error('All Telegram bots failed');
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

    const data = await tryTelegram(async (token) => {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('message_thread_id', topicId.toString());
      
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append(isVoice ? 'voice' : 'audio', blob, file.originalname);

      const endpoint = isVoice ? 'sendVoice' : 'sendAudio';
      const response = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    });

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

    const data = await tryTelegram(async (token) => {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('message_thread_id', topicId.toString());
      
      const blob = new Blob([buffer], { type: contentType });
      formData.append(isVoice ? 'voice' : 'audio', blob, filename);

      const endpoint = isVoice ? 'sendVoice' : 'sendAudio';
      const tgResponse = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      return await tgResponse.json();
    });

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

    const data = await tryTelegram(async (token) => {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('message_thread_id', topicId.toString());
      
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('photo', blob, file.originalname);

      const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    });

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

    const data = await tryTelegram(async (token) => {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('message_thread_id', topicId.toString());
      
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('document', blob, file.originalname);

      const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    });

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

    const docStreamResponse = await tryTelegram(async (token) => {
      const fileResponse = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
      const fileData: any = await fileResponse.json();

      if (!fileData.ok) {
        throw new Error('File not found on Telegram');
      }

      const filePath = fileData.result.file_path;
      const docUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
      const response = await fetch(docUrl);
      if (!response.ok) throw new Error(`Failed to stream document: ${response.statusText}`);
      return response;
    });

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
  } catch (error: any) {
    if (error.message === 'File not found on Telegram' || error.message.includes('Bad Request: invalid file id')) {
      res.status(404).json({ error: 'File not found' });
    } else {
      console.error('Stream error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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
        client: getS3Client()!,
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

    const data = await tryTelegram(async (token) => {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('message_thread_id', topicId.toString());
      
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('video', blob, file.originalname);

      const response = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    });

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

    const videoStreamResponse = await tryTelegram(async (token) => {
      const fileResponse = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
      const fileData: any = await fileResponse.json();

      if (!fileData.ok) {
        throw new Error('File not found on Telegram');
      }

      const filePath = fileData.result.file_path;
      const videoUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
      
      const fetchOptions: any = {};
      if (req.headers.range) {
        fetchOptions.headers = { Range: req.headers.range };
      }

      const response = await fetch(videoUrl, fetchOptions);
      if (!response.ok && response.status !== 206) {
        throw new Error(`Failed to stream video: ${response.statusText}`);
      }
      return response;
    });

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
  } catch (error: any) {
    if (error.message === 'File not found on Telegram' || error.message.includes('Bad Request: invalid file id')) {
      res.status(404).json({ error: 'File not found' });
    } else {
      console.error('Stream error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.get('/api/audio/:fileId', async (req, res) => {
  const { fileId } = req.params;
  console.log(`GET /api/audio/${fileId} requested`);
  try {
    const audioStreamResponse = await tryTelegram(async (token) => {
      // 1. Get file path from Telegram
      const fileResponse = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
      const fileData: any = await fileResponse.json();

      if (!fileData.ok) {
        throw new Error('File not found on Telegram');
      }

      const filePath = fileData.result.file_path;

      // 2. Stream the file back to the client
      const audioUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
      console.log(`Streaming audio from Telegram: ${audioUrl}`);
      const response = await fetch(audioUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch audio from Telegram: ${response.status}`);
      }
      return response;
    });

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
  } catch (error: any) {
    if (error.message === 'File not found on Telegram' || error.message.includes('Bad Request: invalid file id')) {
      res.status(404).json({ error: 'File not found' });
    } else {
      console.error('Stream error for audio:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.get('/api/image/:fileId', async (req, res) => {
  const { fileId } = req.params;
  console.log(`GET /api/image/${fileId} requested`);
  try {
    const imageStreamResponse = await tryTelegram(async (token) => {
      // 1. Get file path from Telegram
      const fileResponse = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
      const fileData: any = await fileResponse.json();

      if (!fileData.ok) {
        throw new Error('File not found on Telegram');
      }

      const filePath = fileData.result.file_path;

      // 2. Stream the file back to the client
      const imageUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
      console.log(`Streaming image from Telegram: ${imageUrl}`);
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch image from Telegram: ${response.status}`);
      }
      return response;
    });

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
  } catch (error: any) {
    if (error.message === 'File not found on Telegram' || error.message.includes('Bad Request: invalid file id')) {
      res.status(404).json({ error: 'File not found' });
    } else {
      console.error('Stream error for image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jposixqotpxzaafnmsjx.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb3NpeHFvdHB4emFhZm5tc2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDk2MTUsImV4cCI6MjA4NzU4NTYxNX0.RjTWWkrydyezytKP5EwnE2fA9kyhT-STewns14kUTw4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Shared state for Telegram updates
let globalLastUpdateId = 0;
let globalRecentUpdates: any[] = [];

// Background polling loop for maximum reliability
async function startTelegramPolling() {
  const token = TELEGRAM_BOT_TOKENS[0];
  
  // First, delete any existing webhook to ensure getUpdates works
  try {
    console.log('Deleting Telegram Webhook to enable polling...');
    await axios.get(`https://api.telegram.org/bot${token}/deleteWebhook`);
    console.log('Telegram Webhook deleted.');
  } catch (e: any) {
    console.warn('Error deleting webhook:', e.message);
  }

  console.log('Starting background Telegram polling...');
  
  const poll = async () => {
    try {
      const offsetParam = globalLastUpdateId > 0 ? `&offset=${globalLastUpdateId + 1}` : '';
      const response = await axios.get(`https://api.telegram.org/bot${token}/getUpdates?timeout=10${offsetParam}`, {
        timeout: 15000,
        httpsAgent
      });
      
      const data = response.data;
      if (data.ok && data.result?.length > 0) {
        for (const update of data.result) {
          if (update.update_id > globalLastUpdateId) {
            globalLastUpdateId = update.update_id;
            globalRecentUpdates.push(update);
            
            // Keep only last 100 updates
            if (globalRecentUpdates.length > 100) {
              globalRecentUpdates.shift();
            }

            // Optional: Auto-reply to any message to show the bot is alive
            const chatId = update.message?.chat?.id;
            const text = update.message?.text || '';
            if (chatId && !text.startsWith('/start')) {
              // If it's just a random message, we could reply, but let's keep it quiet 
              // unless it looks like a session ID (6 chars, alphanumeric)
            }
          }
        }
      }
    } catch (error: any) {
      // 409 means another instance is polling or webhook is active
      if (error.response?.status !== 409) {
        console.error('Background polling error:', error.message);
      }
    }
    // Poll again after a short delay
    setTimeout(poll, 2000);
  };

  poll();
}

// Start the loop
startTelegramPolling();

app.get('/api/messages/sync', async (req, res) => {
  try {
    const { offset } = req.query;
    const clientOffset = offset ? parseInt(offset as string) : 0;
    
    // Return updates from our reliable background cache
    const filtered = globalRecentUpdates.filter(u => u.update_id >= clientOffset);
    res.json({ ok: true, result: filtered });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

app.post('/api/messages/send', async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const data = await callTelegram('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    });
    res.json(data);
  } catch (error: any) {
    console.error('Server error sending Telegram:', error.message);
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
