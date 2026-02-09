import React from 'react';
import Svg, { Path, G, ClipPath, Defs, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

// IconSax Previous (back) - triangle pointing right with bar on left
export const PreviousIcon = ({ size = 24, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G clipPath="url(#clip0_prev)">
      <Path
        d="M20.24 7.21957V16.7896C20.24 18.7496 18.11 19.9796 16.41 18.9996L12.26 16.6096L8.10996 14.2096C6.40996 13.2296 6.40996 10.7796 8.10996 9.79957L12.26 7.39957L16.41 5.00957C18.11 4.02957 20.24 5.24957 20.24 7.21957Z"
        fill={color}
      />
      <Path
        d="M3.76001 18.9303C3.35001 18.9303 3.01001 18.5903 3.01001 18.1803V5.82031C3.01001 5.41031 3.35001 5.07031 3.76001 5.07031C4.17001 5.07031 4.51001 5.41031 4.51001 5.82031V18.1803C4.51001 18.5903 4.17001 18.9303 3.76001 18.9303Z"
        fill={color}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_prev">
        <Rect width="24" height="24" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

// IconSax Play - circle with play triangle
export const PlayIcon = ({ size = 24, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G clipPath="url(#clip0_play)">
      <Path
        d="M11.97 2C6.44997 2 1.96997 6.48 1.96997 12C1.96997 17.52 6.44997 22 11.97 22C17.49 22 21.97 17.52 21.97 12C21.97 6.48 17.5 2 11.97 2ZM14.97 14.23L12.07 15.9C11.71 16.11 11.31 16.21 10.92 16.21C10.52 16.21 10.13 16.11 9.76997 15.9C9.04997 15.48 8.61997 14.74 8.61997 13.9V10.55C8.61997 9.72 9.04997 8.97 9.76997 8.55C10.49 8.13 11.35 8.13 12.08 8.55L14.98 10.22C15.7 10.64 16.13 11.38 16.13 12.22C16.13 13.06 15.7 13.81 14.97 14.23Z"
        fill={color}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_play">
        <Rect width="24" height="24" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

// IconSax Pause - circle with two pause bars
export const PauseIcon = ({ size = 24, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G clipPath="url(#clip0_pause)">
      <Path
        d="M11.97 2C6.44997 2 1.96997 6.48 1.96997 12C1.96997 17.52 6.44997 22 11.97 22C17.49 22 21.97 17.52 21.97 12C21.97 6.48 17.5 2 11.97 2ZM10.72 15.03C10.72 15.51 10.52 15.7 10.01 15.7H8.70997C8.19997 15.7 7.99997 15.51 7.99997 15.03V8.97C7.99997 8.49 8.19997 8.3 8.70997 8.3H9.99997C10.51 8.3 10.71 8.49 10.71 8.97V15.03H10.72ZM16 15.03C16 15.51 15.8 15.7 15.29 15.7H14C13.49 15.7 13.29 15.51 13.29 15.03V8.97C13.29 8.49 13.49 8.3 14 8.3H15.29C15.8 8.3 16 8.49 16 8.97V15.03Z"
        fill={color}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_pause">
        <Rect width="24" height="24" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

// IconSax Next (forward) - triangle pointing left with bar on right
export const NextIcon = ({ size = 24, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G clipPath="url(#clip0_next)">
      <Path
        d="M3.76001 7.21957V16.7896C3.76001 18.7496 5.89001 19.9796 7.59001 18.9996L11.74 16.6096L15.89 14.2096C17.59 13.2296 17.59 10.7796 15.89 9.79957L11.74 7.39957L7.59001 5.00957C5.89001 4.02957 3.76001 5.24957 3.76001 7.21957Z"
        fill={color}
      />
      <Path
        d="M20.24 18.9303C19.83 18.9303 19.49 18.5903 19.49 18.1803V5.82031C19.49 5.41031 19.83 5.07031 20.24 5.07031C20.65 5.07031 20.99 5.41031 20.99 5.82031V18.1803C20.99 18.5903 20.66 18.9303 20.24 18.9303Z"
        fill={color}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_next">
        <Rect width="24" height="24" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);
