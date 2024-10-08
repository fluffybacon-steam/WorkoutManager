import { NextRequest,NextResponse } from 'next/server';
const { OAuth2Client } = require('google-auth-library');
import {generateStateToken} from '../../utils/crypto';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";


const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];
const redirect_uri = process.env.REDIRECT_URI;
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;

async function authorize(client: typeof OAuth2Client) {
    try{
      cookies().delete('state');
    } catch (err) {
      console.error("Error deleting state cookie:", err);
    }
    const state = generateStateToken();
    cookies().set('state', state, { 
      // secure:true,
      httpOnly: true,
      path: '/',
      maxAge: 120
    })
    console.log('client',client);
    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state: state
    });
    return authorizeUrl;
  }

export async function GET() {
  //Fetch auth url
  console.log('redirect_uri',redirect_uri);
  const client = new OAuth2Client(
      client_id, client_secret, redirect_uri
  );
  try{
    const authUrl = await authorize(client);
    return NextResponse.json({'auth_url': authUrl},{status:307, statusText: "Need to get consent"});
  } catch {
    return NextResponse.json({ error: 'Could not generate authorization url for 0auth2' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  //Validate saved credentials
  const body = await req.json(); // Parse the body as JSON
  const {savedCredentialsStr} = body;
  const credentials = JSON.parse(savedCredentialsStr);
  
  if(credentials){
      const client = new OAuth2Client(
          client_id, client_secret, redirect_uri
      );
      //Used saved creds to return auth object
      let returnCreds = credentials;
      await client.setCredentials(returnCreds);
      if(client.isTokenExpiring()){
        const refreshToken = cookies().get('refrestToken')?.value;
        await client.setCredentials(refreshToken);
        returnCreds = await client.refreshAccessToken();
        returnCreds = returnCreds.credentials;
        cookies().set('refreshToken',returnCreds.refresh_token,{
          httpOnly: true, 
          secure: true,  
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 
        });
      }
      returnCreds = {access_token: returnCreds.access_token}
      return NextResponse.json({'credentials': returnCreds},{status:200, statusText: "Restored auth from saved credentials"});
  } else {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 500 });
  }
}
  