
import { NextResponse, NextRequest } from 'next/server';
const { OAuth2Client } = require('google-auth-library');
import { cookies } from 'next/headers';

const redirect_uri = process.env.REDIRECT_URI;
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;

async function setToken(code: string,client: typeof OAuth2Client) {
  console.log("setToken");
  const r = await client.getToken(code);
  await client.setCredentials(r.tokens);
  // const info = await client.getTokenInfo(client.credentials.access_token);
  console.log('credentials',client.credentials)
  return client.credentials;
  // return JSON.stringify({
  //   type: 'authorized_user',
  // client_id: client_id,
  // client_secret: client_secret,
  // client_email: info.email,
  // tokens: tokens,
  //   credentials: client.credentials
  // });
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    console.log('setToken params',searchParams);
    const state = searchParams.get('state');
    const code = searchParams.get('code');
    
    // Check state
    const stateCookie = cookies().get('state')?.value;
    if(state && stateCookie != state){
      return NextResponse.json({ error: 'Invalid state. Fuck off hacker! (or whoever you are!)' }, { status: 403 });
    }
    
    // Use auth code to set token
    if(code){
      const client = new OAuth2Client(
        client_id, client_secret, redirect_uri
      )
      try{ 
        const credentials = await setToken(code,client);
        return NextResponse.json({'credentials': credentials},{status:200, statusText: "Got credentials"});
      } catch(err) {
        console.log(err);
        return NextResponse.json({ error: 'Failed to generate credentials with auth code' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'No auth code provided' }, { status: 400 });
    }
}
  
  