import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import Assessment from './pages/Assessment';
import ChatDetail from './pages/ChatDetail';
import Chats from './pages/Chats';
import Connect from './pages/Connect';
import CounsellorProfile from './pages/CounsellorProfile';
import Counsellors from './pages/Counsellors';
import Crisis from './pages/Crisis';
import Dashboard from './pages/Dashboard';
import Faq from './pages/Faq';
import Insights from './pages/Insights';
import Journal from './pages/Journal';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Signup from './pages/Signup';
import Splash from './pages/Splash';
import StoryCreate from './pages/StoryCreate';
import Support from './pages/Support';
import VerifyOtp from './pages/VerifyOtp';
function App() {
  return (
    <BrowserRouter>
        <Routes>
			<Route path="/" element={<Activities />} />
			<Route path="/Activities" element={<Activities />} />
			<Route path="/ActivityDetail" element={<ActivityDetail />} />
			<Route path="/Assessment" element={<Assessment />} />
			<Route path="/ChatDetail" element={<ChatDetail />} />
			<Route path="/Chats" element={<Chats />} />
			<Route path="/Connect" element={<Connect />} />
			<Route path="/CounsellorProfile" element={<CounsellorProfile />} />
			<Route path="/Counsellors" element={<Counsellors />} />
			<Route path="/Crisis" element={<Crisis />} />
			<Route path="/Dashboard" element={<Dashboard />} />
			<Route path="/Faq" element={<Faq />} />
			<Route path="/Insights" element={<Insights />} />
			<Route path="/Journal" element={<Journal />} />
			<Route path="/LandingPage" element={<LandingPage />} />
			<Route path="/Login" element={<Login />} />
			<Route path="/Onboarding" element={<Onboarding />} />
			<Route path="/Profile" element={<Profile />} />
			<Route path="/Settings" element={<Settings />} />
			<Route path="/Signup" element={<Signup />} />
			<Route path="/Splash" element={<Splash />} />
			<Route path="/StoryCreate" element={<StoryCreate />} />
			<Route path="/Support" element={<Support />} />
			<Route path="/VerifyOtp" element={<VerifyOtp />} />
        </Routes>
    </BrowserRouter>
  );
}
export default App;