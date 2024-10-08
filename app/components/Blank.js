'use client'
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
const styles = {
    "--bkg" :'var(--body-bg)',
    "--border-radius": '10px',
    "--inputWidth": '100px',
    "--tableGap": '5px',
    background: 'var(--bkg)',
    border: '1px solid var(--firstColor)',
    borderRadius: 'var(--border-radius)',
    padding: '20px',
    marginBottom: '20px',
    gap: '15px',
    display: 'flex',
    flexWrap: 'wrap',
    position: 'relative',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--themeColor)'
};
const svg_styles = {
    fill: 'currentColor',
    minWidth: '35px',
    minHeight: '35px'
}

const sayings = [
    "Drag yourself into bed, you earned it!",
    "Lifting is easy, resting is hard. Get into bed",
    "Got to rest to grow, or you’ll have nothing to show",
    "Lay down, dream big, and recharge!",
    "Get your @$$ to bed",
    "Surrender to sleep, you’ve earned it.",
    "Wrap yourself in comfort and rest those muscles",
    "Rest now, build body later",
    "Your bed is calling, don’t be rude.",
    "Are you getting smaller? Guess you aren’t resting enough.",
    "The weights can wait... wait.",
    "Rest. recharge. reborn.",
    "Good night, Sweet Prince... ess?",
    "Slide under those covers now",
    "The only thing you’re curling today are pillows",
    "Lay down and pretend your sleeping."
];



// Register the Draggable plugin
gsap.registerPlugin(Draggable);

export function Blank({currentDay,updateWorkoutDay,setCurrentDay}){
    const boundaryRef = useRef(null); 

    const handleLazyButtResting = () =>{
        const restDay = currentDay;
        restDay.complete = true;
        updateWorkoutDay(restDay);
        // setCurrentDay(null);
    }

    const wordsOfEncouragement = sayings[Math.round(Math.random() * sayings.length)]

    return(
        <div style={styles} ref={boundaryRef}>
            {currentDay.day}
            {currentDay.complete == false ? (
                <PutToBed PutToBed={handleLazyButtResting} boundaryRef={boundaryRef}/>
                // <button onClick={(()=>{handleLazyButtResting()})}>Click me to rest</button>
            ) : (
                <svg 
                    style={svg_styles}
                    xmlns="http://www.w3.org/2000/svg" 
                    height="24px" 
                    width="24px" 
                    viewBox="0 -960 960 960" 
                >
                    <path d="M40-200v-600h80v400h320v-320h320q66 0 113 47t47 113v360h-80v-120H120v120H40Zm240-240q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Zm240 40h320v-160q0-33-23.5-56.5T760-640H520v240ZM280-520q17 0 28.5-11.5T320-560q0-17-11.5-28.5T280-600q-17 0-28.5 11.5T240-560q0 17 11.5 28.5T280-520Zm0-40Zm240-80v240-240Z"/>
                </svg>
            )}
            {currentDay.complete == false && (
                <p style={{fontSize: "0.5em"}}>{wordsOfEncouragement}</p>
            )}
        </div>
    )
}

function PutToBed({PutToBed,boundaryRef}){
    const dragBodyRef = useRef(null); // Ref for the draggable SVG
    const bedRef = useRef(null); // Ref for the drop zone
    
    useEffect(() => {
        // Initialize Draggable
        Draggable.create(dragBodyRef.current, {
        bounds: boundaryRef.current, // Limit drag bounds to the window
        onDragEnd: function () {
            // Get the bounding boxes of the dragged item and drop zone
            const dragItemBounds = dragBodyRef.current.getBoundingClientRect();
            const dropZoneBounds = bedRef.current.getBoundingClientRect();
    
            // Check for overlap with the drop zone
            if (
                dragItemBounds.left < dropZoneBounds.right &&
                dragItemBounds.right > dropZoneBounds.left &&
                dragItemBounds.top < dropZoneBounds.bottom &&
                dragItemBounds.bottom > dropZoneBounds.top
            ) {
                PutToBed();
                // Optionally, you can snap the SVG to the drop zone
            } 
        },
        });
    }, []);

    return(
        <div style={{position: "relative", flexBasis: '100%'}} ref={boundaryRef}>
            {/* Draggable SVG */}
            <svg
                style={svg_styles}
                ref={dragBodyRef}
                xmlns="http://www.w3.org/2000/svg" 
                height="50px" 
                width="50px" 
                viewBox="0 -960 960 960" 
            >
                <path d="M480-660q-29 0-49.5-20.5T410-730q0-29 20.5-49.5T480-800q29 0 49.5 20.5T550-730q0 29-20.5 49.5T480-660Zm-80 500v-200h-40v-180q0-33 23.5-56.5T440-620h80q33 0 56.5 23.5T600-540v180h-40v200H400Z"/>
            </svg>

        {/* Drop Zone SVG */}
            <svg
                ref={bedRef}
                style={svg_styles}
                xmlns="http://www.w3.org/2000/svg" 
                height="50px" 
                width="50px" 
                viewBox="0 -960 960 960" 
            >
                <path d="M80-200v-240q0-27 11-49t29-39v-112q0-50 35-85t85-35h160q23 0 43 8.5t37 23.5q17-15 37-23.5t43-8.5h160q50 0 85 35t35 85v112q18 17 29 39t11 49v240h-80v-80H160v80H80Zm440-360h240v-80q0-17-11.5-28.5T720-680H560q-17 0-28.5 11.5T520-640v80Zm-320 0h240v-80q0-17-11.5-28.5T400-680H240q-17 0-28.5 11.5T200-640v80Zm-40 200h640v-80q0-17-11.5-28.5T760-480H200q-17 0-28.5 11.5T160-440v80Zm640 0H160h640Z"/>
            </svg>
        </div>
    )
}