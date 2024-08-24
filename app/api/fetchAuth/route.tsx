import { NextRequest } from 'next/server';
const { OAuth2Client } = require('google-auth-library');
import {generateStateToken} from '../../utils/crypto';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";


const CREDENTIALS = require('../oauth2.keys.json');
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];
const { redirect_uris } = CREDENTIALS.web;
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
    console.log('state',state);
    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state: state
    });
    return authorizeUrl;
  }

export async function GET(req: NextRequest) {
    // try{
        const searchParams = req.nextUrl.searchParams;
        const savedCredsStr = searchParams.get('savedCredentials');
        const savedCreds = (savedCredsStr) ? JSON.parse(savedCredsStr) : null;
        const client = new OAuth2Client(
            client_id, client_secret, redirect_uris[1]
        );
        if(savedCreds){
            //Used saved creds to return auth object
            let returnCreds = savedCreds;
            await client.setCredentials(returnCreds);
            if(client.isTokenExpiring()){
              returnCreds = await client.refreshAccessToken();
            }
            return Response.json({'credentials': returnCreds},{status:200, statusText: "Restored auth from saved credentials"});
        } else {
            //No creds, ask for consent/signin
            const authUrl = await authorize(client);
            return Response.json({'auth_url': authUrl},{status:307, statusText: "Need to get consent"});
        }
    // } catch (err) {
    //     return Response.json({
    //     apiMessage: { errorMsg: "Internal Server Error, Please try again later" },
    //     });
    // }
}
  