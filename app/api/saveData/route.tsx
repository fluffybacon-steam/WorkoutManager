import { NextResponse, NextRequest } from 'next/server';
const { OAuth2Client } = require('google-auth-library');
import { GoogleSpreadsheet } from 'google-spreadsheet';

const redirect_uri = process.env.REDIRECT_URI;
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;

interface Workout {
    day: string;
    complete: boolean;
    exercises: any[];
    key: number;
}

export async function POST(req: NextRequest) {
    const body = await req.json(); // Parse the body as JSON
    // console.log("saveExercise POST",body);
    const { credentials, sheetDataStr, sheetUrl } = body;
    const sheetData = JSON.parse(sheetDataStr);
    const workoutDays: Array<Workout> = sheetData.workoutDays;
    // console.log('credentials',credentials)
    // console.log('sheetData', JSON.parse(sheetDataStr));
    // console.log('sheetUrl', sheetUrl);
    const client = new OAuth2Client(
        client_id, client_secret, redirect_uri
    );
    await client.setCredentials({access_token: credentials.access_token});
    // await client.setCredentials(credentials);
    // let sheetUrl = '';
      
    let sheetId = (sheetUrl) ? sheetUrl.match(/(?<=\/d\/)[\w-]+/) : null;
    console.log(sheetId,sheetId.length);
    if(sheetId === null || sheetId.length != 1){
        return NextResponse.json({ error: 'Invalid sheet URL' }, { status: 400 });;
    }
    try{
        const doc = new GoogleSpreadsheet(sheetId[0],client);
        await doc.loadInfo(); 
        const sheet = doc.sheetsByIndex[0];
        await sheet.loadCells('A57:P639');
        //skip incomplete days;
        const completedWorkouts = workoutDays.filter(workout => workout.complete);
        for (let i = 0; i <= completedWorkouts.length - 1; i++) {
            const day = completedWorkouts[i];
            const exercises = day.exercises;
            //Add rep/lbs to each exercise
            if(exercises.length != 0){
                exercises.forEach(exercise => {
                    if(exercise.sub1 == null && exercise.sub2 == null){
                        //Check for weakpoint
                        const exer_cell = sheet.getCell(exercise.rowOrigin, 1);
                        console.log('weak',exercise,exer_cell.value);
                        exer_cell.value = exercise.primary;
                    }
                    for (let i = 0; i <= exercise.recordedSets.length - 1; i++) {
                        const set_cell = sheet.getCell(exercise.rowOrigin, i + 6);
                        set_cell.value = exercise.recordedSets[i] ? exercise.recordedSets[i] : '';
                    }
                });
            }
        }
        await sheet.saveUpdatedCells();
        return NextResponse.json({ message: 'Updated successfully!' }, { status: 200 });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }