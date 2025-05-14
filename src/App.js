import React, { createContext, useContext } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import GamesIcon from '@mui/icons-material/Games';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LinearProgress from '@mui/material/LinearProgress';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bcd4', // Cyan color
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

// Shared context for total mined CRN
const MiningContext = createContext();

// Add getUserId utility above Referral
function getUserId() {
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
    return window.Telegram.WebApp.initDataUnsafe.user?.id?.toString();
  }
  let userId = localStorage.getItem('coreon_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('coreon_user_id', userId);
  }
  return userId;
}

// Placeholder components for each route
const Home = ({ goToLiveMine, miningRate, miningProgress, miningFilled, minedCRN }) => {
  const [totalCRN, setTotalCRN] = React.useState(0);
  const [totalTON, setTotalTON] = React.useState(0);
  const [gamesPlayed, setGamesPlayed] = React.useState(0);
  const [invites, setInvites] = React.useState(0);
  const [activeDays, setActiveDays] = React.useState(0);
  const [referralTaskPercent, setReferralTaskPercent] = React.useState(0);
  const [eligible, setEligible] = React.useState(false);
  const [withdrawOpen, setWithdrawOpen] = React.useState(false);
  const [withdrawAmount, setWithdrawAmount] = React.useState(1);
  const [showCriteria, setShowCriteria] = React.useState(false);
  const [criteriaChecked, setCriteriaChecked] = React.useState({});
  const [swapOpen, setSwapOpen] = React.useState(false);
  const { totalMinedCRN } = useContext(MiningContext);

  React.useEffect(() => {
    // Fetch live data from mock API
    fetch('http://localhost:8000/api/user/1')
      .then(response => response.json())
      .then(data => {
        setTotalCRN(data.total_crn_earned);
        setTotalTON(data.total_ton_earned);
        setGamesPlayed(data.games_played);
        setInvites(data.invites);
        setActiveDays(data.active_days);
        setReferralTaskPercent(data.referral_task_percent);
        setEligible(data.eligible);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleWithdrawClick = () => {
    setWithdrawOpen(true);
    setShowCriteria(false);
  };
  const handleWithdrawClose = () => {
    setWithdrawOpen(false);
    setShowCriteria(false);
  };
  const handleWithdrawTry = () => {
    // Only show criteria if amount >= 1 and user has enough TON
    if (withdrawAmount >= 1 && withdrawAmount <= totalTON) {
      // Check each criteria
      setCriteriaChecked({
        invites: invites >= 3,
        activeDays: activeDays >= 7,
        gamesPlayed: gamesPlayed >= 10,
        referral: referralTaskPercent >= 60,
      });
      setShowCriteria(true);
    }
  };
  const handleWithdraw = () => {
    // Only allow if all criteria are met
    if (Object.values(criteriaChecked).every(Boolean)) {
      fetch('http://localhost:8000/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1, amount: withdrawAmount }),
      })
        .then(response => response.json())
        .then(data => {
          alert(data.message);
          setWithdrawOpen(false);
        })
        .catch(error => console.error('Error processing withdrawal:', error));
    }
  };

  return (
    <Box sx={{
      maxWidth: 400,
      mx: 'auto',
      mt: 2,
      mb: 2,
      p: 2,
      borderRadius: 4,
      background: 'linear-gradient(135deg, #0a1623 80%, #00fff7 100%)',
      boxShadow: '0 0 32px 4px #00fff7, 0 0 0 2px #1a2a3a',
      color: '#7ffcff',
      fontFamily: 'Orbitron, Arial, sans-serif',
      textAlign: 'center',
      position: 'relative',
    }}>
      <h1 style={{
        fontWeight: 700,
        fontSize: '2.2em',
        margin: '0 0 12px 0',
        letterSpacing: 2,
        textShadow: '0 0 16px #00fff7',
      }}>Coreon Wallet</h1>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mb: 2,
      }}>
        <Box sx={{
          p: 2,
          borderRadius: 3,
          background: 'rgba(10,22,35,0.95)',
          boxShadow: '0 0 16px 2px #00fff7',
          mb: 2,
          cursor: 'pointer',
        }} onClick={() => setSwapOpen(true)}>
          <div style={{ fontSize: '1.1em', opacity: 0.7 }}>Total CRN Earned</div>
          <div style={{ fontSize: '2.2em', fontWeight: 700, color: '#fff7a0', textShadow: '0 0 16px #ffb347', marginBottom: 0 }}>
            {totalMinedCRN.toFixed(6)} CRN
          </div>
          <div style={{ fontSize: '1.1em', color: '#7ffcff', opacity: 0.8, marginTop: 0 }}>≈ {(totalMinedCRN * 0.1).toFixed(6)} USDT</div>
        </Box>
        <Box sx={{
          p: 2,
          borderRadius: 3,
          background: 'rgba(10,22,35,0.95)',
          boxShadow: '0 0 16px 2px #00fff7',
          mb: 2,
          cursor: 'pointer',
        }} onClick={goToLiveMine}>
          <div style={{ fontSize: '1.1em', opacity: 0.7 }}>Mining</div>
          <div style={{ fontSize: '2em', fontWeight: 700, color: '#fff7a0', textShadow: '0 0 8px #ffb347', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span role="img" aria-label="flame" style={{fontSize:'1.1em', verticalAlign:'middle', marginRight: 8}}>🔥</span>
            {miningFilled ? 'Storage filled' : minedCRN.toFixed(6)}
          </div>
          {!miningFilled && <div style={{ fontSize: '1em', color: '#7ffcff', opacity: 0.8 }}>{miningRate.toFixed(6)} CRN/hr</div>}
        </Box>
        <Box sx={{
          p: 2,
          borderRadius: 3,
          background: 'rgba(10,22,35,0.95)',
          boxShadow: '0 0 16px 2px #00fff7',
          mb: 2,
          cursor: 'pointer',
        }} onClick={handleWithdrawClick}>
          <div style={{ fontSize: '1.1em', opacity: 0.7 }}>TON Balance</div>
          <div style={{ fontSize: '2em', fontWeight: 700, color: '#7ffcff', textShadow: '0 0 8px #00fff7', textDecoration: 'underline' }}>{totalTON.toFixed(6)} <span style={{fontSize:'0.7em', color:'#fff', opacity:0.7}}>TON</span></div>
        </Box>
      </Box>
      <Dialog open={withdrawOpen} onClose={handleWithdrawClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{bgcolor:'#0a1623', color:'#7ffcff', textAlign:'center'}}>Withdraw TON</DialogTitle>
        <DialogContent sx={{bgcolor:'#101a2a'}}>
          {totalTON < 1 ? (
            <div style={{color:'#ffb347', textAlign:'center', fontWeight:700, fontSize:'1.1em'}}>Minimum 1 TON required to withdraw.</div>
          ) : !showCriteria ? (
            <>
              <TextField
                type="number"
                label="TON Amount"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(Number(e.target.value))}
                inputProps={{ min: 1, max: totalTON, step: 0.01 }}
                fullWidth
                sx={{ input: { color: '#7ffcff', fontFamily: 'Orbitron' }, label: { color: '#7ffcff' }, mt:2 }}
              />
              <div style={{fontSize:'0.9em', color:'#7ffcff88', marginTop:4, marginBottom:8}}>Min 1 TON</div>
            </>
          ) : (
            <Box>
              <div style={{ fontWeight:700, color:'#7ffcff', marginBottom:8 }}>Withdrawal Criteria</div>
              <ul style={{textAlign:'left', margin:0, padding:'0 0 0 18px', fontSize:'1em', opacity:0.85}}>
                <li>Minimum 3 invites {criteriaChecked.invites ? <CheckCircleIcon sx={{color:'#00fff7', ml:1}}/> : <CancelIcon sx={{color:'#ff4d4d', ml:1}}/>}</li>
                <li>Active for 7 consecutive days {criteriaChecked.activeDays ? <CheckCircleIcon sx={{color:'#00fff7', ml:1}}/> : <CancelIcon sx={{color:'#ff4d4d', ml:1}}/>}</li>
                <li>Played at least 10 games {criteriaChecked.gamesPlayed ? <CheckCircleIcon sx={{color:'#00fff7', ml:1}}/> : <CancelIcon sx={{color:'#ff4d4d', ml:1}}/>}</li>
                <li>60% of invited users must complete 3 tasks {criteriaChecked.referral ? <CheckCircleIcon sx={{color:'#00fff7', ml:1}}/> : <CancelIcon sx={{color:'#ff4d4d', ml:1}}/>}</li>
              </ul>
              {Object.values(criteriaChecked).every(Boolean) ? (
                <div style={{marginTop:12, fontWeight:700, color:'#00fff7', textShadow:'0 0 8px #00fff7'}}>You are eligible for withdrawal!</div>
              ) : (
                <div style={{marginTop:12, fontWeight:700, color:'#ffb347', textShadow:'0 0 8px #ffb347'}}>Not eligible for withdrawal yet.</div>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{bgcolor:'#101a2a', justifyContent:'center'}}>
          {totalTON >= 1 && !showCriteria && (
            <Button variant="contained" onClick={handleWithdrawTry} sx={{bgcolor:'#00fff7', color:'#0a1623', fontWeight:700, borderRadius:2, boxShadow:'0 0 8px #00fff7'}}>Withdraw</Button>
          )}
          {showCriteria && Object.values(criteriaChecked).every(Boolean) && (
            <Button variant="contained" onClick={handleWithdraw} sx={{bgcolor:'#00fff7', color:'#0a1623', fontWeight:700, borderRadius:2, boxShadow:'0 0 8px #00fff7'}}>Confirm Withdraw</Button>
          )}
          <Button onClick={handleWithdrawClose} sx={{color:'#7ffcff'}}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={swapOpen} onClose={() => setSwapOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{bgcolor:'#0a1623', color:'#7ffcff', textAlign:'center'}}>Swap to USDT</DialogTitle>
        <DialogContent sx={{bgcolor:'#101a2a'}}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, background: 'rgba(10,22,35,0.95)', mb: 2 }}>
            <Box sx={{ mr: 2, fontSize: 32, color: '#00fff7' }}>$</Box>
            <Box sx={{ flexGrow: 1 }}>
              <div style={{ fontWeight: 700, color: '#7ffcff', fontSize: '1.1em' }}>USDT Swap</div>
              <div style={{ color: '#ffb347', fontWeight: 500, fontSize: '1em' }}>Coming soon</div>
            </Box>
            <Button variant="contained" sx={{ bgcolor: '#00fff7', color: '#0a1623', fontWeight: 700, borderRadius: 2, ml: 2 }}>Swap</Button>
          </Box>
          <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(10,22,35,0.95)' }}>
            <div style={{ fontWeight: 700, color: '#7ffcff', fontSize: '1.1em', marginBottom: 4 }}>Withdraw</div>
            <div style={{ color: '#ffb347', fontWeight: 500, fontSize: '1em' }}>Withdrawable soon</div>
          </Box>
        </DialogContent>
        <DialogActions sx={{bgcolor:'#101a2a', justifyContent:'center'}}>
          <Button onClick={() => setSwapOpen(false)} sx={{color:'#7ffcff'}}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
const Tasks = () => (
  <Box sx={{ p: 3 }}>
    <div style={{ fontWeight: 700, color: '#7ffcff', fontSize: '1.3em', marginBottom: 18, textAlign: 'center', fontFamily: 'Orbitron, Arial, sans-serif' }}>Tasks</div>
    <Box sx={{ mb: 3, p: 2, background: 'rgba(10,22,35,0.95)', borderRadius: 3, boxShadow: '0 0 16px 2px #00fff7' }}>
      <div style={{ fontWeight: 700, color: '#7ffcff', fontSize: '1.1em', marginBottom: 4 }}>Connect Wallet</div>
      <Button variant="contained" sx={{ bgcolor: '#00fff7', color: '#0a1623', fontWeight: 700, borderRadius: 2, boxShadow: '0 0 8px #00fff7' }}>Connect TON Wallet</Button>
    </Box>
    <Box sx={{ mt: 3, p: 2, background: 'rgba(10,22,35,0.95)', borderRadius: 3, boxShadow: '0 0 16px 2px #00fff7' }}>
      <div style={{ fontWeight: 700, color: '#7ffcff', fontSize: '1.1em', marginBottom: 4 }}>Watch Ads</div>
      <div style={{ fontSize: '1em', color: '#7ffcff', opacity: 0.8, marginBottom: 8 }}>Rewards: 0.00001 TON + 0.0001 CRN</div>
      <Button variant="contained" sx={{ bgcolor: '#00fff7', color: '#0a1623', fontWeight: 700, borderRadius: 2, boxShadow: '0 0 8px #00fff7' }}>Watch Ad</Button>
    </Box>
  </Box>
);
const Referral = () => {
  const [userId, setUserId] = React.useState('');
  const [copyLabel, setCopyLabel] = React.useState('Copy');
  React.useEffect(() => { setUserId(getUserId()); }, []);
  const referralLink = `${window.location.origin}?ref=${userId}`;
  return (
    <Box sx={{ p: 3, textAlign: 'center', color: '#7ffcff', fontFamily: 'Orbitron, Arial, sans-serif' }}>
      <div style={{ fontWeight: 700, fontSize: '1.3em', marginBottom: 12 }}>Refer and earn 0.0005 TON</div>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: 340, mx: 'auto', mb: 2 }}>
        <input
          type="text"
          value={referralLink}
          readOnly
          style={{
            flex: 1,
            fontSize: '1em',
            fontFamily: 'Orbitron, Arial, sans-serif',
            background: '#181a1f',
            color: '#7ffcff',
            border: '1.5px solid #00fff7',
            borderRadius: 10,
            padding: '8px 12px',
            marginRight: 8,
            outline: 'none',
            boxShadow: '0 0 8px 2px #00fff7 inset',
            width: '100%'
          }}
        />
        <Button
          variant="contained"
          sx={{ bgcolor: '#00fff7', color: '#0a1623', fontWeight: 700, borderRadius: 2, boxShadow: '0 0 8px #00fff7', minWidth: 70 }}
          onClick={() => { navigator.clipboard.writeText(referralLink); setCopyLabel('Copied!'); setTimeout(() => setCopyLabel('Copy'), 1200); }}
        >{copyLabel}</Button>
      </Box>
      <div style={{ fontSize: '0.95em', color: '#7ffcff', marginTop: 10, opacity: 0.8 }}>
        Share your link with friends. When they join, you both earn rewards!
      </div>
    </Box>
  );
};

const LiveMine = () => {
  // Mining state (mocked for now)
  const [miningRate, setMiningRate] = React.useState(0.0005); // CRN/hr
  const [storageHours, setStorageHours] = React.useState(2); // hours
  const [elapsed, setElapsed] = React.useState(0); // seconds
  const [claimed, setClaimed] = React.useState(false);
  const [boostOpen, setBoostOpen] = React.useState(false);
  const [storageBoostLevel, setStorageBoostLevel] = React.useState(0); // 0: default, 1: refer, 2+: TON
  const [speedBoostLevel, setSpeedBoostLevel] = React.useState(0); // 0: default, 1: refer, 2+: TON
  const { totalMinedCRN, setTotalMinedCRN } = useContext(MiningContext);

  // Storage boost steps
  const storageBoosts = [
    { hours: 2, label: '2h', cost: null },
    { hours: 3, label: '3h', cost: 'Refer a friend' },
    { hours: 5, label: '5h', cost: '0.1 TON' },
    { hours: 8, label: '8h', cost: '0.2 TON' },
    { hours: 12, label: '12h', cost: '0.3 TON' },
    { hours: 15, label: '15h', cost: '0.5 TON' },
    { hours: 20, label: '20h', cost: '0.7 TON' },
    { hours: 24, label: '24h', cost: '0.8 TON' },
  ];
  // Speed boost steps
  const speedBoosts = [
    { rate: 0.0005, label: '0.0005/hr', cost: null },
    { rate: 0.0007, label: '0.0007/hr', cost: 'Refer a friend' },
    { rate: 0.001, label: '0.001/hr', cost: '0.1 TON' },
    { rate: 0.002, label: '0.002/hr', cost: '0.2 TON' },
    { rate: 0.004, label: '0.004/hr', cost: '0.4 TON' },
    { rate: 0.008, label: '0.008/hr', cost: '0.8 TON' },
    { rate: 0.016, label: '0.016/hr', cost: '1.6 TON' },
  ];
  // Timer logic
  React.useEffect(() => {
    if (claimed) return;
    const interval = setInterval(() => {
      setElapsed(e => {
        if (e >= storageHours * 3600) return e;
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [storageHours, claimed]);
  // Progress
  const progress = Math.min((elapsed / (storageHours * 3600)) * 100, 100);
  const minedCRN = Math.min((elapsed / 3600) * miningRate, storageHours * miningRate);
  // Claim logic
  const handleClaim = () => {
    setClaimed(true);
    setElapsed(0);
    setTotalMinedCRN(prev => prev + minedCRN); // Accumulate mined CRN
    setTimeout(() => setClaimed(false), 1000); // Reset after 1s for demo
  };
  // Boost logic (mocked)
  const handleStorageBoost = () => {
    if (storageBoostLevel < storageBoosts.length - 1) {
      setStorageBoostLevel(storageBoostLevel + 1);
      setStorageHours(storageBoosts[storageBoostLevel + 1].hours);
    }
  };
  const handleSpeedBoost = () => {
    if (speedBoostLevel < speedBoosts.length - 1) {
      setSpeedBoostLevel(speedBoostLevel + 1);
      setMiningRate(speedBoosts[speedBoostLevel + 1].rate);
    }
  };
  return (
    <Box sx={{
      maxWidth: 400,
      mx: 'auto',
      mt: 2,
      mb: 2,
      p: 2,
      borderRadius: 4,
      background: 'linear-gradient(135deg, #0a1623 80%, #00fff7 100%)',
      boxShadow: '0 0 32px 4px #00fff7, 0 0 0 2px #1a2a3a',
      color: '#7ffcff',
      fontFamily: 'Orbitron, Arial, sans-serif',
      textAlign: 'center',
      position: 'relative',
    }}>
      <div style={{ fontSize: '1.2em', opacity: 0.8, marginBottom: 8 }}>In storage:</div>
      <div style={{ fontSize: '2.6em', fontWeight: 700, color: '#fff7a0', textShadow: '0 0 16px #ffb347', marginBottom: 4 }}>
        <span role="img" aria-label="flame" style={{fontSize:'1.1em', verticalAlign:'middle'}}>🔥</span> {minedCRN.toFixed(6)}
      </div>
      <div style={{ fontSize: '1.1em', color: '#fff', opacity: 0.8, marginBottom: 16 }}>
        CRN Balance: <span style={{color:'#fff7a0', fontWeight:700}}>{totalMinedCRN.toFixed(6)}</span>
      </div>
      <Box sx={{
        background: '#181a1f',
        borderRadius: 3,
        boxShadow: '0 0 16px 2px #00fff7',
        p: 2,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MonetizationOnIcon sx={{ fontSize: 38, color: '#fff7a0', mr: 1 }} />
          <Box>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.1em' }}>Storage</div>
            <div style={{ color: '#ffb347', fontWeight: 500, fontSize: '0.95em' }}>{progress >= 100 ? 'Filled' : 'Mining...'}</div>
            <div style={{ color: '#7ffcff', fontWeight: 500, fontSize: '0.95em' }}>{miningRate.toFixed(6)} CRN/hour</div>
          </Box>
        </Box>
        <Button variant="contained" onClick={handleClaim} disabled={progress < 100 || claimed} sx={{bgcolor:'#fff7a0', color:'#181a1f', fontWeight:700, borderRadius:2, boxShadow:'0 0 8px #ffb347', fontSize:'1.1em', px:3}}>Claim</Button>
      </Box>
      <div style={{ color: '#ffb347', fontWeight: 500, fontSize: '1.1em', marginBottom: 12 }}>Claim CRN from storage to keep mining</div>
      <Button variant="outlined" onClick={()=>setBoostOpen(true)} sx={{color:'#00fff7', borderColor:'#00fff7', fontWeight:700, borderRadius:2, boxShadow:'0 0 8px #00fff7', fontSize:'1.1em', mb:2}}>Boost</Button>
      <Dialog open={boostOpen} onClose={()=>setBoostOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{bgcolor:'#0a1623', color:'#7ffcff', textAlign:'center'}}>Boost Options</DialogTitle>
        <DialogContent sx={{bgcolor:'#101a2a'}}>
          <Box sx={{ mb: 3 }}>
            <div style={{ fontWeight: 700, color: '#7ffcff', marginBottom: 8 }}>Storage Boost</div>
            <div>Current: {storageBoosts[storageBoostLevel].label}</div>
            {storageBoostLevel < storageBoosts.length - 1 && (
              <Button variant="outlined" onClick={handleStorageBoost} sx={{mt:1, color:'#00fff7', borderColor:'#00fff7'}}>Upgrade to {storageBoosts[storageBoostLevel+1].label} ({storageBoosts[storageBoostLevel+1].cost})</Button>
            )}
          </Box>
          <Box>
            <div style={{ fontWeight: 700, color: '#7ffcff', marginBottom: 8 }}>Mining Speed Boost</div>
            <div>Current: {speedBoosts[speedBoostLevel].label}</div>
            {speedBoostLevel < speedBoosts.length - 1 && (
              <Button variant="outlined" onClick={handleSpeedBoost} sx={{mt:1, color:'#00fff7', borderColor:'#00fff7'}}>Upgrade to {speedBoosts[speedBoostLevel+1].label} ({speedBoosts[speedBoostLevel+1].cost})</Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{bgcolor:'#101a2a', justifyContent:'center'}}>
          <Button onClick={()=>setBoostOpen(false)} sx={{color:'#7ffcff'}}>Close</Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ mt: 2, p: 2, background: 'rgba(10,22,35,0.95)', borderRadius: 3, boxShadow: '0 0 16px 2px #00fff7' }}>
        <div style={{ fontWeight: 700, color: '#7ffcff', fontSize: '1.1em', marginBottom: 4 }}>Total CRN Mined</div>
        <div style={{ fontSize: '1.5em', fontWeight: 700, color: '#fff7a0', textShadow: '0 0 8px #ffb347' }}>{totalMinedCRN.toFixed(6)} CRN</div>
        <div style={{ fontSize: '1em', color: '#7ffcff', opacity: 0.8 }}>≈ {(totalMinedCRN * 0.1).toFixed(6)} USDT</div>
      </Box>
    </Box>
  );
};

const Earn = () => (
  <Box sx={{ p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%' }}>
    <iframe
      src={'/neon_snake.html'}
      title="Snake Game"
      width="370"
      height="650"
      style={{ border: 'none', borderRadius: 32, boxShadow: '0 0 32px #00fff7', background: 'transparent', margin: 0, padding: 0 }}
      allowFullScreen
    />
  </Box>
);

function MainLayout() {
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const [totalMinedCRN, setTotalMinedCRN] = React.useState(0);
  // Mining state for Home/LiveMine sync
  const [miningRate, setMiningRate] = React.useState(0.0005);
  const [storageHours, setStorageHours] = React.useState(2);
  const [elapsed, setElapsed] = React.useState(0);
  const [claimed, setClaimed] = React.useState(false);
  const miningFilled = elapsed >= storageHours * 3600;
  const minedCRN = Math.min((elapsed / 3600) * miningRate, storageHours * miningRate);
  // Handler to go to Live Mine tab from Home
  const goToLiveMine = () => {
    setValue(1);
  };
  React.useEffect(() => {
    // Sync navigation with bottom nav
    switch (value) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/livemine');
        break;
      case 2:
        navigate('/earn');
        break;
      case 3:
        navigate('/tasks');
        break;
      case 4:
        navigate('/referral');
        break;
      default:
        break;
    }
  }, [value, navigate]);
  // Mining timer for Home
  React.useEffect(() => {
    if (claimed) return;
    const interval = setInterval(() => {
      setElapsed(e => {
        if (e >= storageHours * 3600) return e;
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [storageHours, claimed]);

  // Listen for CRN_EARNED messages from the Earn iframe
  React.useEffect(() => {
    function handleMessage(event) {
      if (event.data && event.data.type === 'CRN_EARNED') {
        setTotalMinedCRN(prev => prev + event.data.value);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <MiningContext.Provider value={{ totalMinedCRN, setTotalMinedCRN }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
        alignItems: 'center',
      }}>
        {/* Main Content */}
        <Box sx={{ flexGrow: 1, pb: 7, pt: 0, overflow: 'auto', width: '100%', maxWidth: 400 }}>
          <Box sx={{ position: 'relative' }}>
            {/* No back arrow */}
            <Routes>
              <Route path="/" element={<Home goToLiveMine={goToLiveMine} miningRate={miningRate} miningProgress={elapsed} miningFilled={miningFilled} minedCRN={minedCRN} />} />
              <Route path="/livemine" element={<LiveMine />} />
              <Route path="/earn" element={<Earn />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/referral" element={<Referral />} />
            </Routes>
          </Box>
        </Box>
        {/* Single Bottom Navigation - always at the bottom, only once */}
        <Box sx={{
          width: '100%',
          maxWidth: 400,
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 0,
          zIndex: 100,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          boxShadow: '0 -2px 16px #00fff7',
        }}>
          <BottomNavigation
            value={value}
            onChange={(event, newValue) => setValue(newValue)}
            showLabels
            sx={{
              width: '100%',
              bgcolor: 'background.paper',
              '.Mui-selected': { color: '#00fff7 !important' },
              fontFamily: 'Orbitron, Arial, sans-serif',
              fontWeight: 700,
              fontSize: '1.1em',
            }}
          >
            <BottomNavigationAction label="Home" icon={<HomeIcon />} />
            <BottomNavigationAction label="Live Mine" icon={<MonetizationOnIcon />} />
            <BottomNavigationAction label="Earn" icon={<GamesIcon />} />
            <BottomNavigationAction label="Tasks" icon={<AssignmentIcon />} />
            <BottomNavigationAction label="Referral" icon={<PeopleIcon />} />
          </BottomNavigation>
        </Box>
      </Box>
    </MiningContext.Provider>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <MainLayout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
