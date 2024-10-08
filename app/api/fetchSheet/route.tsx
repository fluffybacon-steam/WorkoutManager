

import { NextResponse, NextRequest } from 'next/server';
const { OAuth2Client } = require('google-auth-library');
import { GoogleSpreadsheet } from 'google-spreadsheet';
import {formateGoogleSheet} from '../../utils/googleSheets';

const redirect_uri = process.env.REDIRECT_URI;
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;

async function getSheet(auth: typeof OAuth2Client, sheetUrl: string){
  let sheetId = (sheetUrl) ? sheetUrl.match(/(?<=\/d\/)[\w-]+/) : null;
  if(sheetId === null || sheetId.length != 1){
    return null;
  }
  try{
    const doc = new GoogleSpreadsheet(sheetId[0],auth);
    await doc.loadInfo(); 
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadCells(['E26:N55','E9:N16','A57:P639']);
    const sheetData = await formateGoogleSheet(sheet);
    return sheetData;
  } catch (err) {
    console.log((err as Error).message);  // Cast err to Error
    return (err as Error).message;  
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const validCredsStr = searchParams.get('credentials');
  const validCreds = (validCredsStr) ? JSON.parse(validCredsStr) : null;

  const sheetUrlStr = searchParams.get('sheetUrl');
  const sheetUrl = (sheetUrlStr) ? sheetUrlStr : null;

  // Use saved credentials
  if(validCreds && sheetUrl){
    let client = new OAuth2Client(client_id, client_secret, redirect_uri);
    try{
      await client.setCredentials(validCreds);
      const sheetData = await getSheet(client,sheetUrl);
      if(typeof sheetData !== 'string'){
        return NextResponse.json({'sheetData': sheetData},{status:200, statusText: "Got the sheet!"});
      } else {
        return NextResponse.json({ error: sheetData }, { status: 400 });
      }
    } catch(err) {
      console.log(err);
      return NextResponse.json({ error: 'Something went wrong while attempting to fetch sheet' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Could not fetch sheet. Credentials or sheet url is missing' }, { status: 400 });
  }
}

