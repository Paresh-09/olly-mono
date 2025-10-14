import { NextRequest, NextResponse } from 'next/server';
import { ipAddress as ipAddress1 } from "@vercel/functions";
import prismadb from '@/lib/prismadb';
import { validateLicenseKey } from '@/lib/licenses/validate';
import { activateLicenseKey } from '@/lib/licenses/activate';
import { UAParser } from 'ua-parser-js';

interface ActivationDetails {
  deviceType: string | null;
  deviceModel: string | null;
  osName: string | null;
  osVersion: string | null;
  browser: string | null;
  browserVersion: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

function extractActivationDetails(request: NextRequest): ActivationDetails {
  try {
    const userAgent = request.headers.get('user-agent');
    const parser = new UAParser(userAgent || undefined);
    const result = parser.getResult();

      return {
        deviceType: result.device.type || null,
        deviceModel: result.device.model || null,
        osName: result.os.name || null,
        osVersion: result.os.version || null,
        browser: result.browser.name || null,
        browserVersion: result.browser.version || null,
        ipAddress: ipAddress1(request) || null,
        userAgent: userAgent
      };
  } catch (error) {
    console.error("Error extracting activation details:", error);
    return {
      deviceType: null,
      deviceModel: null,
      osName: null,
      osVersion: null,
      browser: null,
      browserVersion: null,
      ipAddress: null,
      userAgent: null
    };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { licenseKey, userId } = body;

    if (!licenseKey) {
      return NextResponse.json({ isValid: false, error: "License key is required" }, { status: 400 });
    }

    const result = await validateLicenseKey(licenseKey, userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error validating license:", error);
    return NextResponse.json({ isValid: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { licenseKey, userId } = body;

    if (!licenseKey || !userId) {
      return NextResponse.json({ isActivated: false, error: "License key and user ID are required" }, { status: 400 });
    }

    const activationDetails = extractActivationDetails(request);
    const result = await activateLicenseKey(licenseKey, userId, activationDetails);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error activating license:", error);
    return NextResponse.json({ isActivated: false, error: "Server error" }, { status: 500 });
  }
}