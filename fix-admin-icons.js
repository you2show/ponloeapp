import fs from 'fs';
import path from 'path';

const ICON_MAP = {
  'Sparkle01Icon': 'SparklesIcon',
  'Send01Icon': 'SentIcon',
  'CheckCircleIcon': 'CheckmarkCircle01Icon',
  'LoaderIcon': 'Loading01Icon',
  'MessageCircle01Icon': 'Message01Icon',
  'TrendingUp01Icon': 'ArrowUpRight01Icon',
  'FileText01Icon': 'File01Icon',
  'LogOut01Icon': 'Logout01Icon',
  'Lock01Icon': 'LockPasswordIcon',
  'Bell01Icon': 'Notification01Icon',
  'Palette01Icon': 'PaintBoardIcon',
  'Globe01Icon': 'Globe02Icon',
  'Save01Icon': 'FloppyDiskIcon',
  'FileDownload01Icon': 'Download01Icon',
  'LineChart01Icon': 'ChartLineData01Icon',
  'Filter01Icon': 'FilterIcon',
  'Plus01Icon': 'Add01Icon',
  'Trash01Icon': 'Delete01Icon',
  'Eye01Icon': 'ViewIcon',
  'EyeOff01Icon': 'ViewOffIcon',
  'Fire01Icon': 'FireIcon',
  'Trophy01Icon': 'Trophy01Icon',
  'Star01Icon': 'StarIcon'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        processDirectory(filePath);
      }
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      Object.keys(ICON_MAP).forEach(oldIcon => {
        const newIcon = ICON_MAP[oldIcon];
        if (content.includes(oldIcon)) {
          content = content.replace(new RegExp(oldIcon, 'g'), newIcon);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
      }
    }
  });
}

processDirectory('./components');
processDirectory('./src');
