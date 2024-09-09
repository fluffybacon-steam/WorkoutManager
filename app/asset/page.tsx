'use client';
import styles from './page.module.scss';
import {Calendar} from '../components/Calendar';
import {Exercise} from '../components/Exercise';

const WorkoutDays = [
    {
        day: "Pull #1 \n(Lat Focused)",
        complete: true,
        exercises: [
            {
                primary: "Cross-Body Lat Pull-Around",
            },
        ],
        key: 0
    }, {
        day: "Pull #2 \n(Lat Focused)",
        complete: true,
        exercises: [
            {
                primary: "Cross-Body Lat Pull-Around",
            },
        ],
        key: 1
    }, {
        day: "Pull #3 \n(Lat Focused)",
        complete: false,
        exercises: [
            {
                primary: "Cross-Body Lat Pull-Around",
            },
        ],
        key: 2
    }, {
        day: "Rest",
        complete: false,
        exercises: [
            {
                primary: "Cross-Body Lat Pull-Around",
            },
        ],
        key: 3
    }

]
const exercise = {
    earlySetRpe: "~9-10",
    lastSetRpe: "10",
    lastSetTech: "Myo-reps",
    notes: "Raise the cables up and out in a 'Y' motion. Really try to connect with the middle delt fibers as you sweep the weight up and out.",
    primary: "Cuffed Behind-The-Back Lateral Raise",
    primary_vid: "https://youtu.be/fjiOCmFljDM?si=DYumnkVUgWxdJeud",
    recordedSets: ['12.5 x 0', '12 x 0', '12 x 0', '0 x 0'],
    repRange: "10-12",
    rest: "~1-2 min",
    rowOrigin: 65,
    sub1: "Cross-Body Cable Y-Raise",
    sub1_vid: "https://youtu.be/64RFJSCJuN8?si=wkooeub0BG4mRyUI",
    sub2: "DB Lateral Raise",
    sub2_vid: "https://youtu.be/RyztKrzaMNk?si=d5M9ZaY77l9t4wnw",
    warmupSets: "1-2",
    workingSets: 3
};

export default function AssetPage() {
    return(
        <div className={styles.wrapper}>
            <div id="loader">
                <div className="spinner"></div>
            </div>
            <button className='home-button'>Load workouts from local memory</button>
            <button className='home-button' disabled>Load workouts from local memory</button>
            <Calendar workoutDays={WorkoutDays} setCurrentDay={function(){}} currentDay={WorkoutDays[2]}  currentDayRef={null}/>
            <Exercise saveExercise={function(){}} exercise={exercise} />
        </div>
    )
}