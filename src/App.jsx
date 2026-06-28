// Imports 
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from './store';
import './App.css';
import './components/Styles/Default.css';
import './components/Styles/Templates_Interface.css';

// Components
import ExpenseTracker from './components/User/ExpenseTracker';
import GoalPlanner from './components/Inteligence/GoalPlanner';
import HabitTracker from './components/Health/HabitTracker';
import FridgeStock from './components/Health/FridgeStock';
import BigTargets from './components/User/BigTargets';
import BookList from './components/Inteligence/BookList';
import MovieList from './components/Agency/MovieList';
import ProfileSettings from './components/User/ProfileSettings';
import SkillTree from './components/User/SkillTree';
import Overview from './components/User/Overview';
import SportHub from './components/Health/SportHub';
import LanguageHub from './components/Agency/LanguageHub';
import Auth from './components/User/Auth';
import ProfileModal from './components/User/ProfileModal';
import TripMode from './components/Agency/TripMode';
import AIAssistant from './components/Functions/AIAssistant';
import ProjectCanvas from './components/Functions/ProjectCanvas';
import Journal from './components/Agency/Journal';
import Editor from './components/Functions/Editor';
import TradingTerminal from './components/User/TradingTerminal';
import Timetable from './components/User/Timetable';
import PasswordManager from './components/Agency/PasswordManager';
import { SKILL_DEF } from './constants';
import './components/Styles/Timetable.css';



// Icon for Skill Tree
const BeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-beaker" viewBox="0 0 16 16">
    <path d="M9.5 3a.5.5 0 0 0 0 1H13V3zm2 2a.5.5 0 0 0 0 1H13V5zm-2 2a.5.5 0 0 0 0 1H13V7zm2 2a.5.5 0 0 0 0 1H13V9zm-2 2a.5.5 0 0 0 0 1H13v-1zm2 2a.5.5 0 0 0 0 1H13v-1z" />
    <path d="M.5 0a.5.5 0 0 0-.354.854l.122.12A2.5 2.5 0 0 1 1 2.744V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2.743a2.5 2.5 0 0 1 .732-1.768l.122-.121A.5.5 0 0 0 15.5 0zM2 2.743A3.5 3.5 0 0 0 1.535 1h12.93A3.5 3.5 0 0 0 14 2.743V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
  </svg>
);
// Icon for Overview
const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-bar-chart" viewBox="0 0 16 16">
    <path d="M4 11H2v3h2zm5-4H7v7h2zm5-5v12h-2V2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1z" />
  </svg>
);

// Icon for AI Assistant
const RobotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-robot" viewBox="0 0 16 16">
    <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.889a28.24 28.24 0 0 1 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z" />
    <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5" />
  </svg>
);

// Icon for Canvas
const CanvasIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-diagram-3" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5v-1zM8.5 5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1zM0 11.5A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm4.5.5A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm4.5.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1z" />
  </svg>
);

// Icon for Habits
const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
  </svg>
);

// Icon for Wallet
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-wallet" viewBox="0 0 16 16">
    <path d="M0 3a2 2 0 0 1 2-2h13.5a.5.5 0 0 1 0 1H15v2a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-1.5 1.5h-12A2.5 2.5 0 0 1 0 12.5V3zm1 1.732V12.5A1.5 1.5 0 0 0 2.5 14h12a.5.5 0 0 0 .5-.5V5H2a1.99 1.99 0 0 1-1-.268zM1 3a1 1 0 0 0 1 1h12V2H2a1 1 0 0 0-1 1z" />
  </svg>
);

// Icon for Food
const ForkKnifeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-fork-knife" viewBox="0 0 16 16">
    <path d="M13 .5c0-.276-.226-.506-.498-.465-1.703.257-2.94 2.012-3 8.462a.5.5 0 0 0 .498.5c.56.01 1 .13 1 1.003v5.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5zM4.25 0a.25.25 0 0 1 .25.25v5.122a.128.128 0 0 0 .256.006l.233-5.14A.25.25 0 0 1 5.24 0h.522a.25.25 0 0 1 .25.238l.233 5.14a.128.128 0 0 0 .256-.006V.25A.25.25 0 0 1 6.75 0h.29a.5.5 0 0 1 .498.458l.423 5.07a1.69 1.69 0 0 1-1.059 1.711l-.053.022a.92.92 0 0 0-.58.884L6.47 15a.971.971 0 1 1-1.942 0l.202-6.855a.92.92 0 0 0-.58-.884l-.053-.022a1.69 1.69 0 0 1-1.059-1.712L3.462.458A.5.5 0 0 1 3.96 0z" />
  </svg>
);

// Icon for Goals
const GoalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-geo-alt" viewBox="0 0 16 16">
    <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
    <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
  </svg>
);

// Icon for Big Targets
const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-trophy" viewBox="0 0 16 16">
    <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935M3.504 1q.01.775.056 1.469c.13 2.028.457 3.546.87 4.667C5.294 9.48 6.484 10 7 10a.5.5 0 0 1 .5.5v2.61a1 1 0 0 1-.757.97l-1.426.356a.5.5 0 0 0-.179.085L4.5 15h7l-.638-.479a.5.5 0 0 0-.18-.085l-1.425-.356a1 1 0 0 1-.757-.97V10.5A.5.5 0 0 1 9 10c.516 0 1.706-.52 2.57-2.864.413-1.12.74-2.64.87-4.667q.045-.694.056-1.469z" />
  </svg>
);

// Icon for Library
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-bookmark" viewBox="0 0 16 16">
    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z" />
  </svg>
);

// Icon for Cinema
const FilmIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-film" viewBox="0 0 16 16">
    <path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z" />
  </svg>
);

// Icon for Workout
const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-activity" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2" />
  </svg>
);

// Icon for Languages
const TranslateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-translate" viewBox="0 0 16 16">
    <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z" />
    <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31" />
  </svg>
);

// Icon for Trip Mode
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-globe" viewBox="0 0 16 16">
    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z" />
  </svg>
);

// Icon for Journal
const JournalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-journal-text" viewBox="0 0 16 16">
    <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" />
    <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z" />
    <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z" />
  </svg>
);

const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-key" viewBox="0 0 16 16">
    <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.5.5a.5.5 0 0 1-.707 0L7.3 9.3a4 4 0 0 1-7.3-1.3zm4-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
    <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
  </svg>
);

// Icon for Editor
const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-code-square" viewBox="0 0 16 16">
    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
    <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z" />
  </svg>
);

// Icon for Overview
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-house-door" viewBox="0 0 16 16">
    <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
  </svg>
);

// Icon for Settings
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
  </svg>
);

// Icon for Timetable
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-calendar3" viewBox="0 0 16 16">
    <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z" />
    <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
  </svg>
);

// Icon for Trading Terminal
const GraphUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-graph-up" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M0 0h1v15h15v1H0zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07" />
  </svg>
);

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [openFolders, setOpenFolders] = useState({
    'Finance & Goals': true,
    'Health & Fitness': false,
    'Knowledge & Agency': false,
    'Trading': false,
    'Functions': false
  });

  const toggleFolder = (title) => {
    setOpenFolders(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Connect to Zustand Global Store
  const profile = useStore((state) => state.profile);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const theme = useStore((state) => state.theme);
  const accentColor = useStore((state) => state.accentColor);

  const syncHabits = useStore((state) => state.syncHabits);
  const unlockedSkills = useStore((state) => state.skills);
  const designSettings = useStore((state) => state.designSettings);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-interface-template', designSettings.enabled ? (designSettings.template || 'default') : 'default');
    root.style.setProperty('--primary', accentColor);

    // Convert hex to RGB for semi-transparent variations
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);

    // Design Mode variables
    root.style.setProperty('--glass-blur', `${designSettings.enabled ? designSettings.blur : 0}px`);
    root.style.setProperty('--border-radius-custom', `${designSettings.enabled ? designSettings.radius : 12}px`);

    // Dynamic Font Selection
    let fontValue = 'var(--font-main)';
    if (designSettings.enabled) {
      if (designSettings.font === 'Outfit') fontValue = 'var(--font-outfit)';
      else if (designSettings.font === 'JetBrains Mono') fontValue = 'var(--font-mono)';
      else if (designSettings.font === 'Roboto') fontValue = 'var(--font-roboto)';
    }
    root.style.setProperty('--font-main', fontValue);

    if (designSettings.enabled && designSettings.isNeon) {
      root.style.setProperty('--neon-glow', `0 0 15px rgba(${r}, ${g}, ${b}, 0.5)`);
      root.style.setProperty('--border-neon', `1px solid rgba(${r}, ${g}, ${b}, 0.8)`);
    } else {
      root.style.setProperty('--neon-glow', 'none');
      root.style.setProperty('--border-neon', '1px solid var(--border-color)');
    }

    if (designSettings.enabled && designSettings.isCompact) {
      root.style.setProperty('--compact-gap', '10px');
      root.style.setProperty('--compact-padding', '12px');
    } else {
      root.style.setProperty('--compact-gap', '24px');
      root.style.setProperty('--compact-padding', '24px');
    }

  }, [theme, accentColor, designSettings]);

  // Automatic URL parameters Cloud Sync loader
  useEffect(() => {
    const DATA_KEYS = [
      'profile',
      'activeQuests',
      'expenses',
      'assets',
      'habits',
      'customHabitTemplates',
      'goals',
      'fridge',
      'targets',
      'books',
      'movies',
      'workouts',
      'languages',
      'trips',
      'journal',
      'editorFiles',
      'trades',
      'watchlist',
      'tradingTrends',
      'tradingStrategies',
      'tradingAnalyses',
      'tradingPlan',
      'calendarEvents',
      'skills',
      'canvasNodes',
      'canvasEdges',
      'timetableBlocks',
      'theme',
      'accentColor',
      'designSettings',
      'financeSettings',
      'overviewSettings'
    ];

    const params = new URLSearchParams(window.location.search);
    const syncCode = params.get('sync');
    if (syncCode) {
      const loadSync = async () => {
        try {
          const res = await fetch(`https://api.pastes.dev/${syncCode}`);
          if (!res.ok) throw new Error('Failed to fetch sync data');
          const data = await res.json();
          if (data && data.profile) {
            // Restore and merge Zustand store state
            const existingState = useStore.getState();
            const mergedState = { ...existingState };

            DATA_KEYS.forEach(key => {
              if (data[key] !== undefined) {
                mergedState[key] = data[key];
              }
            });

            // Restore image values that were cleared in sync from current existing state
            if (mergedState.profile) {
              mergedState.profile = {
                ...mergedState.profile,
                profilePicture: existingState.profile.profilePicture || '',
                backgroundImage: existingState.profile.backgroundImage || '',
                heroImage: existingState.profile.heroImage || ''
              };
            }

            useStore.setState(mergedState);
            alert('🎉 Data successfully synchronized from cloud!');
            // Clean up the URL parameter
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.reload();
          } else {
            throw new Error('Invalid sync data format');
          }
        } catch (e) {
          console.error(e);
          alert('❌ Failed to restore cloud sync database. Make sure the code is correct.');
        }
      };
      loadSync();
    }
  }, []);

  // Removed 'habits' from dependency to avoid infinite loop
  useEffect(() => {
    if (isAuthenticated) {
      syncHabits(SKILL_DEF);
    }
  }, [isAuthenticated, unlockedSkills, syncHabits]);

  const getActiveTabProps = (path) => {
    // Treat "/" as overview, otherwise match exactly
    const isActive = location.pathname === path || (path === '/overview' && location.pathname === '/');
    return isActive ? 'active' : '';
  };

  const navGroups = [
    {
      title: 'Finance & Goals',
      items: [
        { path: '/expenses', label: 'Expense Tracker', icon: <WalletIcon /> },
        { path: '/targets', label: 'Big Targets', icon: <TrophyIcon /> },
        { path: '/goals', label: 'Goal Planner', icon: <GoalIcon /> },
        { path: '/trading', label: 'Trading Terminal', icon: <GraphUpIcon /> },
      ]
    },
    {
      title: 'Health & Fitness',
      items: [
        { path: '/habits', label: 'Habit Tracker', icon: <ListIcon /> },
        { path: '/fridge', label: 'Fridge Stock', icon: <ForkKnifeIcon /> },
        { path: '/sport', label: 'Workout Hub', icon: <ActivityIcon /> },
      ]
    },
    {
      title: 'Knowledge & Agency',
      items: [
        { path: '/books', label: 'Library', icon: <BookIcon /> },
        { path: '/languages', label: 'Language Hub', icon: <TranslateIcon /> },
        { path: '/movies', label: 'Cinema', icon: <FilmIcon /> },
        { path: '/journal', label: 'Journal', icon: <JournalIcon /> },
        { path: '/trips', label: 'Trip Mode', icon: <GlobeIcon /> },
        { path: '/passwords', label: 'Password Manager', icon: <KeyIcon /> },
      ]
    },
    {
      title: 'Functions',
      items: [
        { path: '/canvas', label: 'Canvas', icon: <CanvasIcon /> },
        { path: '/editor', label: 'Editor', icon: <CodeIcon /> },
        { path: '/ai', label: 'AI Assistant', icon: <RobotIcon /> },
      ]
    }
  ];

  const navItemsAccount = [
    { path: '/overview', label: 'Overview', icon: <HomeIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
    { path: '/skills', label: 'Skill Tree', icon: <BeakerIcon /> },
    { path: '/timetable', label: 'Timetable', icon: <CalendarIcon /> },
  ];


  const backgroundStyle = profile.backgroundImage
    ? {
      backgroundImage: `url(${profile.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
    : {};

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={backgroundStyle}>
        <Auth />
      </div>
    );
  }

  return (
    <div className="app-container" style={backgroundStyle}>

      {/* Backdrop for mobile only */}
      {isSidebarOpen && window.innerWidth <= 900 && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`} style={profile.backgroundImage ? { backdropFilter: 'blur(20px)', background: theme === 'dark' ? 'rgba(10,10,12,0.85)' : 'rgba(255,255,255,0.85)' } : {}}>
        <div className="app-title">
          <div className="app-logo" style={{ background: 'transparent', color: 'var(--text-main)', padding: 0 }}>
            <BarChartIcon />
          </div>
          E.O.M
        </div>

        <div
          className="user-profile"
          onClick={() => setIsProfileModalOpen(true)}
          style={profile.backgroundImage ? {
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
          } : {}}
          onMouseEnter={profile.backgroundImage ? ((e) => e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)') : undefined}
          onMouseLeave={profile.backgroundImage ? ((e) => e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') : undefined}
        >
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="avatar-circle">{profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}</div>
          )}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{profile.username || 'My Workspace'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pro Plan</div>
          </div>
        </div>

        <div className="nav-menu">
          <div className="nav-label">My Account</div>
          {navItemsAccount.map(item => (
            <button
              key={item.path}
              className={`nav-item ${getActiveTabProps(item.path)}`}
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth <= 900) setIsSidebarOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {navGroups.map(group => (
          <div key={group.title} className="nav-menu" style={{ marginBottom: '15px' }}>
            <div
              className="nav-folder-header"
              onClick={() => toggleFolder(group.title)}
            >
              {group.title}
              <span style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '2px' }}>{openFolders[group.title] ? '▼' : '▶'}</span>
            </div>

            <div style={{
              overflow: 'hidden',
              transition: 'max-height 0.3s ease-in-out',
              maxHeight: openFolders[group.title] ? '500px' : '0px'
            }}>
              {group.items.map(item => (
                <button
                  key={item.path}
                  className={`nav-item ${getActiveTabProps(item.path)}`}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth <= 900) setIsSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}

      </div>

      {/* NAVBAR - For Mobile */}
      <div className="dashboard-content" style={{ position: 'relative', ...(profile.backgroundImage ? { backdropFilter: 'blur(10px)', background: 'rgba(10,10,12,0.65)' } : {}) }}>

        {/* Toggle Button */}
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle Sidebar"
          style={{ left: isSidebarOpen ? '295px' : '15px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
          </svg>
        </button>




        <div className="view-transition" style={{ paddingTop: '40px' }}>
          <Routes>
            <Route path="/" element={<Overview navigate={navigate} />} />
            <Route path="/overview" element={<Overview navigate={navigate} />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/skills" element={<SkillTree />} />
            <Route path="/expenses" element={<ExpenseTracker />} />
            <Route path="/goals" element={<GoalPlanner />} />
            <Route path="/habits" element={<HabitTracker />} />
            <Route path="/fridge" element={<FridgeStock />} />
            <Route path="/targets" element={<BigTargets />} />
            <Route path="/sport" element={<SportHub />} />
            <Route path="/languages" element={<LanguageHub />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/movies" element={<MovieList />} />
            <Route path="/trading" element={<TradingTerminal navigate={navigate} />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/trips" element={<TripMode />} />
            <Route path="/passwords" element={<PasswordManager />} />
            <Route path="/canvas" element={<ProjectCanvas />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/timetable" element={<Timetable />} />
          </Routes>
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

export default App;

