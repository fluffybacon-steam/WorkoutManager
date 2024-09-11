'use client';
import { useState, useEffect } from 'react';
const palettesDark = [
      {
          '--firstColor':'#023E8A',
          '--secondColor':'#0096C7',
          '--thirdColor':'#14168b',
          '--fourthColor':'#c8e7f1'
      },
      {
          '--firstColor':'#C200FB',
          '--secondColor':'#4E0066',
          '--thirdColor':'#1F0029',
          '--fourthColor':'#4E0066' ,
      },
      {
          '--firstColor':'#AE8E1C',
          '--secondColor':'#9B3D12',
          '--thirdColor':'#650D1B',
          '--fourthColor':'#650D1B'
      },
      {
            '--firstColor':'#A26769',
            '--secondColor':'#9B3D12',
            '--thirdColor':'#6D2E46',
            '--fourthColor':'#ECE2D0'
        },
        {
            '--firstColor':'#08B2E3',
            '--secondColor':'#57A773',
            '--thirdColor':'#EE6352',
            '--fourthColor':'#57A773'
        },
        {
            '--firstColor':'#136F63',
            '--secondColor':'#3E2F5B',
            '--thirdColor':'#000F08',
            '--fourthColor':'#F34213'
        },
        {
            '--firstColor':'#B6DCFE',
            '--secondColor':'#ae63bd',
            '--thirdColor':'#516169',
            '--fourthColor':'#81F7E5'
        },
  ];

  const palettesLight = [
    {
        '--firstColor':'#82AA57',
        '--secondColor':'#C5D86D',
        '--thirdColor':'#82AA57',
        '--fourthColor':'#C5D86D'
    },
    {
        '--firstColor':'#8FDC97',
        '--secondColor':'#24D2F9',
        '--thirdColor':'#048BA8',
        '--fourthColor':'#16DB93' ,
    },
    {
        '--firstColor':'#D782BA',
        '--secondColor':'#EEB1D5',
        '--thirdColor':'#E18AD4',
        '--fourthColor':'#EFC7E5' ,
    },
    {
        '--firstColor':'#7b106c',
        '--secondColor':'#F6F2FF',
        '--thirdColor':'#DCCCFF',
        '--fourthColor':'#932F6D' ,
    },
    {
        '--firstColor':'#EFEA5A',
        '--secondColor':'#F29E4C',
        '--thirdColor':'#D17010',
        '--fourthColor':'#F29E4C' ,
    },
    {
        '--firstColor':'#C9184A',
        '--secondColor':'#FF4D6D',
        '--thirdColor':'#A4133C',
        '--fourthColor':'#590D22' ,
    },
];

const ColorPalette = () => {
  // Define color palettes

  const [palette, setPalette] = useState(palettesLight);
  const [selectedPaletteNum, setSelectedPaletteNum] = useState(0);

  // Function to change global CSS variables
  const changePalette = () => {
    let num = selectedPaletteNum;
    if(selectedPaletteNum == (palette.length - 1)){
        num = 0;
    } else {
        num += 1;
    }
    setSelectedPaletteNum(num);
  };

  useEffect(() => {
    if(typeof window == "undefined"){
        return
    }
    const darkThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if(darkThemeQuery?.matches == true){
        setPalette(palettesDark);
    }
    const userPreferenceJSON = window.localStorage.getItem('color-palette');
    const userPreference = (userPreferenceJSON) ? JSON.parse(userPreferenceJSON) : false;
    console.log(userPreference,typeof userPreference == 'number');
    if(typeof userPreference == 'number'){
        setSelectedPaletteNum(userPreference);
    }
  }, []);

  useEffect(()=>{
    console.log(selectedPaletteNum,typeof selectedPaletteNum == 'number');
    if(typeof selectedPaletteNum == 'number'){
        window.localStorage.setItem('color-palette',JSON.stringify(selectedPaletteNum));
        const root = document.documentElement;
        const selectedColors = palette[selectedPaletteNum];
        for (const [key, value] of Object.entries(selectedColors)) {
            root.style.setProperty(key, value);
        }
    }
  },[selectedPaletteNum])

  return (
    <button
        onClick={() => changePalette()}
        style={{ color: palette[selectedPaletteNum]['--firstColor'], float: 'right' }}
    >
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 32.5-156t88-127Q256-817 330-848.5T488-880q80 0 151 27.5t124.5 76q53.5 48.5 85 115T880-518q0 115-70 176.5T640-280h-74q-9 0-12.5 5t-3.5 11q0 12 15 34.5t15 51.5q0 50-27.5 74T480-80Zm0-400Zm-220 40q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm120-160q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm200 0q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm120 160q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17ZM480-160q9 0 14.5-5t5.5-13q0-14-15-33t-15-57q0-42 29-67t71-25h70q66 0 113-38.5T800-518q0-121-92.5-201.5T488-800q-136 0-232 93t-96 227q0 133 93.5 226.5T480-160Z"/></svg>
    </button>
  );
};

export default ColorPalette;
