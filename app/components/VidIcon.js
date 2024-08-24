import gsap from 'gsap';
import {useRef, useEffect} from 'react';

export function VidIcon() { 
    const svgRef = useRef(null);

    
    useEffect(() => {
        const svg = svgRef.current;
        const hoverIn = () => {
            gsap.to(svg.querySelector('#arrow'), { 
                x: 10, 
                y: -10, 
                duration: 0.5 
            });
        };
        const hoverOut = () => {
            gsap.to(svg.querySelector('#arrow'), { 
                x: 0, 
                y: 0, 
                duration: 0.5 
            });
        };
        svg.addEventListener('mouseenter', hoverIn);
        svg.addEventListener('mouseleave', hoverOut);
        return () => {
            svg.removeEventListener('mouseenter', hoverIn);
            svg.removeEventListener('mouseleave', hoverOut);
        };
    },[]);
    
    return (
    <svg
        ref={svgRef}
        data-name="Layer 1"
        viewBox="0 0 13.994401 13.655376"
        x="0px"
        y="0px"
        version="1.1"
        id="svg4"
        width="13.994401"
        height="13.655376"
        xmlns="http://www.w3.org/2000/svg"
        style={{fill:'currentColor', overflow:'visible'}}
        >
        <defs
            id="defs4" />
        <g
            id="g5"
            transform="matrix(0.1705481,0,0,0.1705481,-1.4967682,-1.6734983)">
            <path
                d="m 44.1,10.74 c -10,0 -20,-0.26 -29.92,0.32 -1.48,0.08 -3.37,1.09 -3.61,2.75 -1.75,11.69 -0.92,24 -1.14,35.89 -0.23,12 -1.5,24.88 0.28,36.78 l 1,-3.65 -0.13,0.14 c -2.4,2.54 -0.58,6.03 2.61,6.4 10.76,1.14 22.34,0 33.2,0.09 13.11,0.08 26.24,0.39 39.33,-0.41 C 87.2,89 89.1,88 89.34,86.3 c 1.38,-9.55 1.23,-19.45 1.49,-29.08 0.13,-4.83 -7.37,-4.83 -7.5,0 -0.24,8.88 0,18.53 -1.22,27.09 l 3.61,-2.76 C 72.63,82.35 59.5,82.04 46.39,81.96 35.53,81.9 24,83 13.19,81.87 l 2.66,6.4 C 17,87 17,86.07 16.94,84.48 c -0.15,-3.19 -0.58,-6.3 -0.54,-9.52 0,-2.61 0.14,-5.21 0.2,-7.82 0.11,-5 0.19,-10 0.28,-15 L 17.19,35.9 C 17.32,29.16 16.8,22.5 17.8,15.78 l -3.62,2.76 c 9.94,-0.58 20,-0.35 29.92,-0.32 4.83,0 4.84,-7.49 0,-7.5 z"
                 />
        <g
            id="arrow">
            <path
                d="m 54.65,50.65 c 11.16,-11.1 22,-21.46 33.76,-33 3.3,-3.52 -2,-8.83 -5.3,-5.3 -10.77,11.5 -22.6,21.85 -33.76,33 -3.43,3.41 1.87,8.71 5.3,5.3 z"
                />
            <path
                d="m 90.55,35.1 c 0.19,-7.3 0.55,-14.72 -0.57,-22 l -1,3.65 0.11,-0.13 c 2.37,-2.55 0.53,-6.05 -2.65,-6.4 -7,-0.75 -14.13,-0.29 -21.09,0 -4.81,0.2 -4.84,7.7 0,7.5 7,-0.28 14.14,-0.75 21.09,0 l -2.65,-6.4 c -2.31,2.49 -0.7,7.82 -0.64,10.94 0.08,4.27 0,8.53 -0.14,12.8 -0.12,4.82 7.38,4.82 7.5,0 z"
                />
        </g>
        </g>
    </svg>
)};