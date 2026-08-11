import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

declare global {
  var __fbs_store_settings_cache: any | undefined;
}

const defaultSettings = {
  whatsappNumber: '60103574196',
  whatsappNumber2: '60168765432',
  whatsappBusinessName: 'FBS Bakery World Support',
  storeName: 'FBS Bakery World',
  companyRegistrationName: 'FBS Bakery World (M) Sdn. Bhd. (1080422-V)',
  operatingHours: 'Senin - Jumat | 08.30 - 17.30',
  currency: 'RM',
  announcement: '✨ Free Shipping For Orders Above RM150! | Premium Baking Supply Partner Malaysia ✨',
  supportEmail: 'order@fbsbakeryworld.com',
  address: 'K9694,K9695,K9696 & K9697, Taman Pajak Utama, 24000 Chukai, Terengganu, Malaysia',
  googleMapsEmbedUrl: 'https://maps.google.com/maps?q=FBS%20Bakery%20World%2C%20K9694%2CK9695%2CK9696%20%26%20K9697%2C%20Taman%20Pajak%20Utama%2C%2024000%20Chukai%2C%20Terengganu%2C%20Malaysia&t=&z=15&ie=UTF8&iwloc=&output=embed',
  googleMapsAppUrl: 'https://maps.google.com/?q=FBS+Bakery+World+Chukai+Terengganu',
};

function getDataFilePath(): string {
  const localDir = path.join(process.cwd(), 'data');
  const localFile = path.join(localDir, 'fbs_store_settings.json');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return localFile;
  } catch (e) {
    return path.join(os.tmpdir(), 'fbs_store_settings.json');
  }
}

function readServerSettings(): any {
  if (globalThis.__fbs_store_settings_cache && Object.keys(globalThis.__fbs_store_settings_cache).length > 0) {
    return globalThis.__fbs_store_settings_cache;
  }
  const file = getDataFilePath();
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        globalThis.__fbs_store_settings_cache = { ...defaultSettings, ...parsed };
        return globalThis.__fbs_store_settings_cache;
      }
    }
  } catch (err) {
    console.error('Error reading store settings file:', err);
  }
  globalThis.__fbs_store_settings_cache = { ...defaultSettings };
  return globalThis.__fbs_store_settings_cache;
}

function writeServerSettings(settings: any) {
  const merged = { ...defaultSettings, ...readServerSettings(), ...settings };
  globalThis.__fbs_store_settings_cache = merged;
  const file = getDataFilePath();
  try {
    fs.writeFileSync(file, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    try {
      const tmpFile = path.join(os.tmpdir(), 'fbs_store_settings.json');
      fs.writeFileSync(tmpFile, JSON.stringify(merged, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.error('Error writing tmp store settings:', tmpErr);
    }
  }
  return merged;
}

const antiCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// GET /api/settings
export async function GET() {
  try {
    const settings = readServerSettings();
    return NextResponse.json({ success: true, settings, source: 'SERVER_PERSISTED' }, { headers: antiCacheHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/settings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const settingsInput = body.settings || body;

    if (!settingsInput || typeof settingsInput !== 'object') {
      return NextResponse.json({ success: false, error: 'Settings object is required' }, { status: 400 });
    }

    const saved = writeServerSettings(settingsInput);
    console.log('✅ [Store Settings API Saved Successfully]:', saved.storeName);
    return NextResponse.json({ success: true, settings: saved, source: 'SERVER_PERSISTED' }, { headers: antiCacheHeaders });
  } catch (err: any) {
    console.error('[Store Settings API POST Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export const PUT = POST;
