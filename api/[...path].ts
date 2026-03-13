import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import helmet from 'helmet';

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

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', url: req.url, originalUrl: req.originalUrl });
});

// --- Security Middlewares ---
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Proxy Helper ---
async function proxyRequest(req: express.Request, res: express.Response, next: express.NextFunction, targetUrl: string, options: any = {}) {
  try {
    console.log(`Proxying request to: ${targetUrl}`);
    
    const fetchOptions: RequestInit = {
      method: options.method || req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ...(options.headers || {}),
      },
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const bodyData = options.body || req.body;
      if (bodyData) {
        if (typeof bodyData === 'object' && !Buffer.isBuffer(bodyData)) {
          fetchOptions.body = JSON.stringify(bodyData);
          (fetchOptions.headers as any)['Content-Type'] = 'application/json';
        } else {
          fetchOptions.body = bodyData;
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    fetchOptions.signal = controller.signal;

    const response = await fetch(targetUrl, fetchOptions);
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);

    if (options.responseType === 'stream') {
      res.status(response.status);
      if (response.body) {
        // @ts-ignore
        for await (const chunk of response.body) {
          res.write(chunk);
        }
        res.end();
      } else {
        res.end();
      }
      return;
    }

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error: any) {
    console.error(`Proxy Error for ${targetUrl}:`, error.message);
    
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Gateway Timeout', message: 'The external API took too long to respond.' });
    }

    res.status(500).json({ 
      error: 'Proxy Error', 
      status: 500,
      message: error.message.substring(0, 500)
    });
  }
}

// --- Telegram API Routes ---
const TELEGRAM_CHANNEL_ID = '-1003526327706';
const CHAT_ID = TELEGRAM_CHANNEL_ID;

// Helper for multi-bot failover
async function tryTelegram(operation: (token: string) => Promise<any>) {
  let lastError = null;
  for (let i = 0; i < TELEGRAM_BOT_TOKENS.length; i++) {
    const token = TELEGRAM_BOT_TOKENS[i];
    try {
      const result = await operation(token);
      if (result instanceof Response) {
        if (result.ok) return result;
        const errorData = await result.clone().json().catch(() => ({}));
        const description = errorData.description || `HTTP ${result.status}`;
        
        // Only log warning for primary bot if it's NOT a "not found" error
        if (i === 0) {
          const isNotFound = description.includes('File not found') || 
                            description.includes('invalid file id') ||
                            description.includes('file_id_invalid');
          if (!isNotFound) {
            console.warn(`Telegram Bot ${token.split(':')[0]} failed with status ${result.status}:`, errorData);
          }
        }
        lastError = new Error(description);
      } else if (result && typeof result === 'object' && 'ok' in result) {
        if (result.ok) return result;
        const description = result.description || 'Unknown Telegram error';
        
        // Only log warning for primary bot if it's NOT a "not found" error
        if (i === 0) {
          const isNotFound = description.includes('File not found') || 
                            description.includes('invalid file id') ||
                            description.includes('file_id_invalid');
          if (!isNotFound) {
            console.warn(`Telegram Bot ${token.split(':')[0]} returned error:`, description);
          }
        }
        lastError = new Error(description);
      } else {
        return result;
      }
    } catch (error: any) {
      const isNotFound = error.message === 'File not found on Telegram' || 
                        error.message.includes('Bad Request: invalid file id') ||
                        error.message.includes('Bad Request: file_id_invalid');
      
      if (i === 0 && !isNotFound) {
        console.warn(`Telegram Bot ${token.split(':')[0]} connection error:`, error.message);
      }
      lastError = error;
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

// Lazy multer initialization
let uploadAudio: any = null;
function getUploadAudio() {
  if (!uploadAudio) {
    const m = (multer as any).default || multer;
    uploadAudio = m({ storage: m.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
  }
  return uploadAudio;
}

const handleUpload = (getUploadMiddleware: () => any) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const uploadMiddleware = getUploadMiddleware();
      uploadMiddleware.single('audio')(req, res, (err: any) => {
        if (err && err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'ឯកសារធំពេក សូមជ្រើសរើសទំហំតូចជាងនេះ (អតិបរមា: រូបភាព/សំឡេង 10MB, វីដេអូ 600MB)។' });
        } else if (err) {
          return res.status(500).json({ error: err.message });
        }
        next();
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Multer initialization failed: ' + error.message });
    }
  };
};

// API Routes
app.post('/api/upload', handleUpload(getUploadAudio), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No audio file uploaded' });
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
        body: formData as any
      });
      return await response.json();
    });
    
    const fileId = isVoice ? data.result.voice.file_id : data.result.audio.file_id;
    res.json({ success: true, fileId, messageId: data.result.message_id, chatId: CHAT_ID, topicId });
  } catch (error: any) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pt/cal', async (req, res, next) => {
  const queryParams = new URLSearchParams(req.query as any).toString();
  const url = `https://api.aladhan.com/v1/calendar/${req.query.year}/${req.query.month}?${queryParams}`;
  await proxyRequest(req, res, next, url);
});

app.get('/api/pt/gToH', async (req, res, next) => {
  const queryParams = new URLSearchParams(req.query as any).toString();
  const url = `https://api.aladhan.com/v1/gToHCalendar/${req.query.month}/${req.query.year}?${queryParams}`;
  await proxyRequest(req, res, next, url);
});

app.get('/api/nominatim/reverse', async (req, res, next) => {
  const queryParams = new URLSearchParams(req.query as any).toString();
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&${queryParams}`;
  await proxyRequest(req, res, next, url, {
    headers: {
      'User-Agent': 'PonloeApp/1.0 (ponloevideos@gmail.com)'
    }
  });
});

app.get('/api/quranenc/:translationKey/:surahNumber', async (req, res, next) => {
  const { translationKey, surahNumber } = req.params;
  const url = `https://quranenc.com/api/v1/translation/sura/${translationKey}/${surahNumber}`;
  await proxyRequest(req, res, next, url);
});

app.get('/api/alquran/*', async (req, res, next) => {
  const endpoint = req.params[0] || req.url.split('/api/alquran/')[1]?.split('?')[0];
  const queryParams = new URLSearchParams(req.query as any).toString();
  const url = `https://api.alquran.cloud/v1/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  await proxyRequest(req, res, next, url);
});

app.get('/api/quran/*', async (req, res, next) => {
  const endpoint = req.params[0] || req.url.split('/api/quran/')[1]?.split('?')[0];
  const queryParams = new URLSearchParams(req.query as any).toString();
  const url = `https://api.quran.com/api/v4/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  await proxyRequest(req, res, next, url);
});

app.get('/api/qurancdn/*', async (req, res, next) => {
  const endpoint = req.params[0] || req.url.split('/api/qurancdn/')[1]?.split('?')[0];
  const queryParams = new URLSearchParams(req.query as any).toString();
  const url = `https://api.qurancdn.com/api/qdc/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  await proxyRequest(req, res, next, url);
});

app.get('/api/proxy-audio', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing or invalid URL' });
    
    const headers: Record<string, string> = {};
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const response = await fetch(url, { headers });

    res.status(response.status);
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    
    const contentRange = response.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    
    if (response.body) {
      // @ts-ignore
      for await (const chunk of response.body) {
        res.write(chunk);
      }
      res.end();
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error('Proxy audio error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/sync', async (req, res) => {
  try {
    const { offset } = req.query;
    const data = await tryTelegram(async (token) => {
      const offsetParam = offset ? `&offset=${offset}` : '';
      const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?timeout=5${offsetParam}`);
      if (!response.ok) throw new Error(`Telegram API error: ${response.statusText}`);
      return await response.json();
    });
    res.json(data);
  } catch (error: any) {
    console.error('Server error polling Telegram:', error.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

app.post('/api/messages/send', async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const data = await tryTelegram(async (token) => {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });
      if (!response.ok) throw new Error(`Telegram API error: ${response.statusText}`);
      return await response.json();
    });
    res.json(data);
  } catch (error: any) {
    console.error('Error sending Telegram message:', error.message);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Root API handler
app.get('/api', (req, res) => {
  res.json({ status: 'API is running', version: '1.1.0' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global API Error:', err.message);
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
