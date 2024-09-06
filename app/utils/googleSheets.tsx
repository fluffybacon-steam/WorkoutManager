interface Exercise {
  primary: string;
  sub1?: string;
  sub2?: string;
  lastSetTech?: string;
  warmupSets?: number;
  workingSets?: number;
  repRange?: string;
  rowOrigin?: number;
  recordedSets?: any[];
  earlySetRpe?: number;
  lastSetRpe?: number;
  rest?: number;
  notes?: string;
}

class Workout {
  day: string;
  complete: boolean;
  exercises: any[];
  key: number;

  constructor(day: string, key: number = -1) {
    this.day = day;
    this.complete = false;
    this.exercises = [];
    this.key = key;
  }

  public addVideos(videoMap: Map<string,string>){
    this.exercises.forEach((exercise)=>{
      exercise.primary_vid = videoMap.get(exercise.primary);
      exercise.sub1_vid =  videoMap.get(exercise.sub1);
      exercise.sub2_vid =  videoMap.get(exercise.sub2);
    })
  }

  private isComplete(sets: any[] | undefined){
    if (!sets || sets.length === 0) return;
    for (const value of sets) {
        if (value !== null) {
          this.complete = true;
          return
        }
    }
  }


  public addExercise(data: Exercise){
    //console.log("datafromSeet",data);
    const exercise: Exercise = {
      primary : data.primary,
      sub1 : data.sub1,
      sub2 : data.sub2,
      lastSetTech  : data.lastSetTech,
      warmupSets  : data.warmupSets,
      workingSets  : data.workingSets,
      repRange  : data.repRange,
      rowOrigin  : data.rowOrigin,
      recordedSets : data.recordedSets,
      earlySetRpe  : data.earlySetRpe,
      lastSetRpe  : data.lastSetRpe,
      rest  : data.rest,
      notes  : data.notes,
    };
    if(this.complete == false){
      this.isComplete(exercise.recordedSets);
    }
      //console.log("exercise object",exercise);
    this.exercises.push(exercise);
  }
}

class WeakPoint {
  point: string;
  exercises: any[];
  info: any[];

  constructor(point: string){
    this.point = point;
    this.exercises = [];
    this.info = [];
  }

  public addContent(cellValue: string){
    if(cellValue == undefined || cellValue == ''){
      return
    } else if(cellValue.includes('1.') || cellValue.includes('2.') || cellValue.includes('3.')) {
      //Exercise
      const formatCellValue = cellValue.replace('1. ', '').replace('2. ', '').replace('3. ', '').trim();
      this.exercises.push(formatCellValue);
    } else {
      //info
      this.info.push(cellValue);
    }
  }

  public addVideos(videoMap: Map<string,string>){
    this.exercises.forEach((exercise, index)=>{
      const video_url = videoMap.get(exercise);
      if(video_url){
        this.exercises[index] = [exercise, video_url];
      }
    })
  }
}

export async function formateGoogleSheet(sheet: any) {
  //Create map of hyperlinked exercises .getCell(59,1) to .getCell(637,1),.getCell(59,13) to .getCell(637,13),.getCell(59,14) to .getCell(637,14)
  var videoMap = new Map();
  const columns = [1, 13, 14];
  for (let i = 59; i <= 637; i++) {
    for (let ii of columns) {
      const exer_cell = sheet.getCell(i, ii);
      const video_url = exer_cell.hyperlink;
      const exer_name = exer_cell.stringValue;
      if(!videoMap.has(exer_name)){
        videoMap.set(exer_name,video_url);
      }
    }
  } 
  //Add warmup exercise to video library
  for (let i = 11; i <= 15; i++) {
    const exer_cell = sheet.getCell(i, 6);
    const video_url = exer_cell.hyperlink;
    const exer_name = exer_cell.stringValue;
    if(!videoMap.has(exer_name)){
      //console.log(exer_name);
      videoMap.set(exer_name,video_url);
    }
  }

  //Workout days are defined in .getCell(59,0) to .getCell(637,0) 
  var workoutDays = [];
  let currentDay = undefined;
  // for (let i = 59; i <= 101; i++) {
  for (let i = 59; i <= 637; i++) {
    const cellString = sheet.getCell(i, 0).stringValue;
    const adjacentCell = sheet.getCell(i, 1).stringValue;
    if((cellString == undefined || cellString == '')){
      //Blank cell.
      if(currentDay != undefined && (adjacentCell != undefined || adjacentCell != '' )){
        //Exercise, add to current day
        currentDay.addExercise({
          primary: sheet.getCell(i, 1).stringValue || sheet.getCell(i, 1).formattedValue,
          sub1: sheet.getCell(i, 13).stringValue || sheet.getCell(i, 13).formattedValue,
          sub2: sheet.getCell(i, 14).stringValue || sheet.getCell(i, 14).formattedValue,
          lastSetTech : sheet.getCell(i, 2).stringValue || sheet.getCell(i, 2).formattedValue,
          warmupSets : sheet.getCell(i, 3).stringValue || sheet.getCell(i, 3).formattedValue,
          workingSets : parseInt(sheet.getCell(i, 4).stringValue || sheet.getCell(i, 4).formattedValue),
          repRange : sheet.getCell(i, 5).stringValue || sheet.getCell(i, 5).formattedValue,
          rowOrigin : i,
          recordedSets : [
              sheet.getCell(i, 6).stringValue || sheet.getCell(i, 6).formattedValue,
              sheet.getCell(i, 7).stringValue || sheet.getCell(i, 7).formattedValue,
              sheet.getCell(i, 8).stringValue || sheet.getCell(i, 8).formattedValue,
              sheet.getCell(i, 9).stringValue || sheet.getCell(i, 9).formattedValue
          ],
          earlySetRpe : sheet.getCell(i, 10).stringValue || sheet.getCell(i, 10).formattedValue,
          lastSetRpe : sheet.getCell(i, 11).stringValue || sheet.getCell(i, 11).formattedValue,
          rest : sheet.getCell(i, 12).stringValue || sheet.getCell(i, 12).formattedValue,
          notes : sheet.getCell(i, 15).stringValue || sheet.getCell(i, 15).formattedValue
        });
        currentDay.addVideos(videoMap);
      }

    } else {
      //Cell has some text
      if(cellString.toLowerCase().includes('week') || cellString.toLowerCase().includes('rest day')){
        //Rest Day or Week header
        if(currentDay){
          workoutDays.push(currentDay);
          currentDay = undefined;
        }
        if(cellString.toLowerCase().includes('rest day')){
          workoutDays.push(new Workout(cellString,workoutDays.length));
        }
      } else if (adjacentCell != undefined || adjacentCell != '' ){
        //New day
        if(currentDay){
          workoutDays.push(currentDay);
        }

        currentDay = new Workout(cellString,workoutDays.length);
        currentDay.addExercise({
          primary: sheet.getCell(i, 1).stringValue || sheet.getCell(i, 1).formattedValue,
          sub1: sheet.getCell(i, 13).stringValue || sheet.getCell(i, 13).formattedValue,
          sub2: sheet.getCell(i, 14).stringValue || sheet.getCell(i, 14).formattedValue,
          lastSetTech : sheet.getCell(i, 2).stringValue || sheet.getCell(i, 2).formattedValue,
          warmupSets : sheet.getCell(i, 3).stringValue || sheet.getCell(i, 3).formattedValue,
          workingSets : parseInt(sheet.getCell(i, 4).stringValue || sheet.getCell(i, 4).formattedValue),
          repRange : sheet.getCell(i, 5).stringValue || sheet.getCell(i, 5).formattedValue,
          rowOrigin : i,
          recordedSets : [
              sheet.getCell(i, 6).stringValue || sheet.getCell(i, 6).formattedValue,
              sheet.getCell(i, 7).stringValue || sheet.getCell(i, 7).formattedValue,
              sheet.getCell(i, 8).stringValue || sheet.getCell(i, 8).formattedValue,
              sheet.getCell(i, 9).stringValue || sheet.getCell(i, 9).formattedValue
          ],
          earlySetRpe : sheet.getCell(i, 10).stringValue || sheet.getCell(i, 10).formattedValue,
          lastSetRpe : sheet.getCell(i, 11).stringValue || sheet.getCell(i, 11).formattedValue,
          rest : sheet.getCell(i, 12).stringValue || sheet.getCell(i, 12).formattedValue,
          notes : sheet.getCell(i, 15).stringValue || sheet.getCell(i, 15).formattedValue
        });
        currentDay.addVideos(videoMap);
      }
    }
  }
  //WeakPoints are defined in .getCell(26,4) to .getCell(54,13) 
  var weakPoints = [];
  let currentPoint = undefined;
  for (let i = 26; i <= 54; i++) {
      const cellString = sheet.getCell(i, 4).stringValue;
      console.log('cellstring', cellString,sheet.getCell(i, 5).stringValue,sheet.getCell(i, 6).stringValue);
      if((cellString == undefined || cellString == '')){
        //Cell is blank
        if(currentPoint){
          //Add exercises 1 and 2/info
          currentPoint.addContent(sheet.getCell(i, 5).stringValue);
          currentPoint.addContent(sheet.getCell(i, 6).stringValue);
        } else {
          //do nothing
        }
      } else {
        //Cell has value
        if(currentPoint){
          //End current point
          currentPoint.addVideos(videoMap);
          weakPoints.push(currentPoint);
        }
        //Begin new point
        currentPoint = new WeakPoint(cellString);
        currentPoint.addContent(sheet.getCell(i, 5).stringValue);
        currentPoint.addContent(sheet.getCell(i, 6).stringValue);
      }
  }
  console.log(weakPoints);
  // console.log('videoMap3',videoMap);
  //warmupsTable
  let warmUps = [];
  for (let i = 10; i <= 15; i++) {
    const reps = sheet.getCell(i, 4).stringValue;
    for (let ii = 6; ii <= 13; ii++) {
      const exercise = sheet.getCell(i, ii).stringValue;
      if (exercise !== undefined && exercise !== '') {
        const video_url = videoMap.get(exercise);
        warmUps.push([reps, exercise, video_url]);
        break; // Exit the inner loop once a valid exercise is found
      }
    }
  }

   // console.log(warmUps);

  return {workoutDays, weakPoints, warmUps};
}