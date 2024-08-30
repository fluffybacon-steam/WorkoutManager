import { NextResponse, NextRequest } from 'next/server';
const { OAuth2Client } = require('google-auth-library');
import { GoogleSpreadsheet } from 'google-spreadsheet';

const redirect_uri = process.env.REDIRECT_URI;
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;

export async function POST(req: NextRequest) {
    const body = await req.json(); // Parse the body as JSON
    console.log("saveExercise POST",body);
    const { credentials, reps, lbs, rowI, sheetUrl } = body;

    console.log('credentials',credentials)
    console.log('reps', reps);
    console.log('lbs', lbs);
    console.log('rowI', rowI);
    console.log('sheetUrl', sheetUrl);
    const client = new OAuth2Client(
        client_id, client_secret, redirect_uri
    );
    await client.setCredentials(credentials);
    console.log("set creds...client",client);
    // let sheetUrl = '';
      
    let sheetId = (sheetUrl) ? sheetUrl.match(/(?<=\/d\/)[\w-]+/) : null;
    console.log(sheetId,sheetId.length);
    if(sheetId === null || sheetId.length != 1){
        return NextResponse.json({ error: 'Invalid sheet URL' }, { status: 400 });;
    }
    try{
        console.log('server auth',`G${rowI}:J${rowI}`,reps[0]);
        const doc = new GoogleSpreadsheet(sheetId[0],client);
        await doc.loadInfo(); 
        const sheet = doc.sheetsByIndex[0];
        await sheet.loadCells([`G${rowI+1}:J${rowI+1}`]);
        console.log("load cells", typeof rowI);
        for (let i = 0; i <= reps.length - 1; i++) {
            const cell = sheet.getCell(rowI,i + 6);
            console.log(`${parseFloat(reps[i])} x ${parseFloat(lbs[i])}`);
            cell.value = `${parseFloat(reps[i])} x ${parseFloat(lbs[i])}`
        }
        await sheet.saveUpdatedCells();
        return NextResponse.json({ message: 'Updated successfully!' }, { status: 200 });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }