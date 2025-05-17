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
const Home = ({ goToLiveMine, miningRate, miningProgress, miningFilled, minedCRN, totalTON, setTotalTON }) => {
  const [totalCRN, setTotalCRN] = React.useState(0);
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
  const { totalMinedCRN, setTotalMinedCRN } = useContext(MiningContext);

  React.useEffect(() => {
    // Fetch live data from mock API
    fetch('http://localhost:8000/api/user/1')
      .then(response => response.json())
      .then(data => {
        setTotalCRN(data.total_crn_earned);
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

  React.useEffect(() => {
    const userId = getUserId();
    const storageKey = `earned_points_${userId}`;
    const savedData = JSON.parse(localStorage.getItem(storageKey) || '{"crn":0,"ton":0}');
    setTotalMinedCRN(savedData.crn);
    setTotalTON(savedData.ton);
  }, []);

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

const Earn = ({ setTotalTON }) => {
  // Official TON logo SVG (no text)
  const tonLogoSVG = `<svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="#00bfff" stroke="#00fff7" stroke-width="2"/><path d="M20 28L11 14H29L20 28Z" fill="white"/></svg>`;
  // Free play logic
  const FREE_PLAYS_PER_DAY = 3;
  const [freePlays, setFreePlays] = React.useState(() => {
    const data = JSON.parse(localStorage.getItem('snake_free_plays') || '{}');
    const today = new Date().toISOString().slice(0, 10);
    if (data.date === today) return data.count;
    return FREE_PLAYS_PER_DAY;
  });
  React.useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('snake_free_plays', JSON.stringify({ date: today, count: freePlays }));
  }, [freePlays]);
  function decrementFreePlays() {
    setFreePlays(fp => Math.max(0, fp - 1));
  }
  // Neon Snake Game React Integration
  const canvasRef = React.useRef(null);
  const [gameState, setGameState] = React.useState({
    snake: [{ x: 9, y: 9 }],
    direction: 'right',
    nextDirection: 'right',
    fruit: { x: 5, y: 5, type: 'crn' },
    bombs: [],
    timeFruit: null,
    tonFruit: null,
    timer: 60,
    crnEaten: 0,
    usdtEarned: 0, // This is actually TON earned in-game
    gameOver: false,
    gameStarted: false,
    showStart: true,
    crnPoints: 0,
  });
  const [intervals, setIntervals] = React.useState({ game: null, timer: null });
  const gridCount = 18;
  const neonBlue = '#00fff7';
  const neonOrange = '#ffb347';
  const neonBomb = '#ff6f40';
  const neonGrid = 'rgba(0,255,247,0.08)';
  const neonSnake = '#00fff7';
  const neonSnakeGlow = '#7ffcff';
  const neonFruit = '#7ffcff';
  const neonTon = '#00bfff';
  const neonBombGlow = '#ffb347';
  const { totalMinedCRN, setTotalMinedCRN } = React.useContext(MiningContext);

  // Multiplier logic
  function getTimeMultiplier(time) {
    if (time >= 100) return 2;
    if (time >= 50) return 1.5;
    if (time >= 20) return 1.2;
    if (time >= 10) return 1.1;
    return 1;
  }

  // Inject Orbitron font and styles
  React.useEffect(() => {
    const font = document.createElement('link');
    font.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap';
    font.rel = 'stylesheet';
    document.head.appendChild(font);
    const style = document.createElement('style');
    style.innerHTML = `
      .neon-snake-root { background: #0a1623 url('https://www.transparenttextures.com/patterns/circuit-board.png'); background-size: cover; color: #7ffcff; font-family: 'Orbitron', Arial, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .neon-snake-root #mobile-frame { max-width: 370px; width: 100vw; min-height: 100vh; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .neon-snake-root .container { background: rgba(10, 22, 35, 0.95); border-radius: 32px; box-shadow: 0 0 32px 4px #00fff7, 0 0 0 2px #1a2a3a; padding: 24px 8px 8px 8px; max-width: 370px; width: 100%; margin: 0 auto; position: relative; }
      .neon-snake-root .stats-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .neon-snake-root .stat { display: flex; align-items: center; gap: 7px; font-size: 1.1em; color: #7ffcff; text-shadow: 0 0 6px #00fff7; }
      .neon-snake-root .stat-icon { width: 22px; height: 22px; display: inline-block; }
      .neon-snake-root .game-box { background: rgba(10, 22, 35, 0.95); border-radius: 24px; box-shadow: 0 0 24px 2px #00fff7, 0 0 0 2px #1a2a3a; margin: 0 auto 1vw auto; padding: 0; width: 294px; height: 294px; display: flex; align-items: center; justify-content: center; position: relative; }
      .neon-snake-root .game-over-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(10, 22, 35, 0.92); border-radius: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; color: #7ffcff; font-family: 'Orbitron', Arial, sans-serif; text-align: center; box-shadow: 0 0 32px 8px #00fff7; animation: fadeIn 0.5s; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .neon-snake-root .game-over-title { font-size: 2em; font-weight: 700; margin-bottom: 12px; text-shadow: 0 0 16px #00fff7; }
      .neon-snake-root .game-over-score { font-size: 1.1em; margin-bottom: 8px; }
      .neon-snake-root .play-again-btn { margin-top: 12px; padding: 10px 28px; border-radius: 16px; border: none; background: linear-gradient(145deg, #0a1623 60%, #00fff7 100%); color: #7ffcff; font-size: 1.1em; font-family: 'Orbitron', Arial, sans-serif; font-weight: 700; box-shadow: 0 0 12px 2px #00fff7; cursor: pointer; transition: box-shadow 0.2s, background 0.2s; }
      .neon-snake-root .play-again-btn:active { box-shadow: 0 0 24px 6px #00fff7; background: linear-gradient(145deg, #00fff7 60%, #0a1623 100%); }
      .neon-snake-root #game-canvas { background: transparent; border-radius: 18px; width: 288px; height: 288px; display: block; margin: 0 auto; box-shadow: 0 0 16px 2px #00fff7 inset; }
      .neon-snake-root .game-label { color: #7ffcff; text-align: center; font-size: 1.1em; margin: 8px 0 0 0; letter-spacing: 1px; opacity: 0.8; }
      .neon-snake-root .usdt-row { display: flex; justify-content: flex-end; align-items: center; margin: 10px 0 0 0; }
      .neon-snake-root .usdt-label { color: #fff; font-size: 1em; opacity: 0.7; margin-right: 8px; }
      .neon-snake-root .usdt-value { color: #7ffcff; font-size: 1.3em; font-weight: 700; text-shadow: 0 0 8px #00fff7; }
      .neon-snake-root .controls { display: flex; flex-direction: column; align-items: center; margin-top: 10px; margin-bottom: 0; }
      .neon-snake-root .dpad { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; background: rgba(10, 22, 35, 0.7); border-radius: 50%; box-shadow: 0 0 24px 6px #00fff7, 0 0 0 2px #1a2a3a; width: 96px; height: 96px; aspect-ratio: 1/1; padding: 0; margin-bottom: 0; }
      .neon-snake-root .dpad-row { display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 8px; }
      .neon-snake-root .dpad-btn { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(145deg, #0a1623 60%, #00fff7 100%); box-shadow: 0 0 12px 3px #00fff7, 0 0 0 1px #1a2a3a; border: none; color: #7ffcff; font-size: 1em; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: box-shadow 0.2s, background 0.2s; outline: none; }
      .neon-snake-root .dpad-btn:active { box-shadow: 0 0 20px 5px #00fff7, 0 0 0 1px #1a2a3a; background: linear-gradient(145deg, #00fff7 60%, #0a1623 100%); }
      .neon-snake-root .bottom-row { display: flex; justify-content: space-between; margin-top: 18px; gap: 12px; }
      .neon-snake-root .bottom-btn { flex: 1; background: linear-gradient(145deg, #0a1623 60%, #00fff7 100%); color: #7ffcff; border: none; border-radius: 16px; font-size: 1.1em; font-family: 'Orbitron', Arial, sans-serif; font-weight: 700; padding: 12px 0; margin: 0 2px; box-shadow: 0 0 12px 2px #00fff7; cursor: pointer; transition: box-shadow 0.2s, background 0.2s; }
      .neon-snake-root .bottom-btn:active { box-shadow: 0 0 24px 6px #00fff7; background: linear-gradient(145deg, #00fff7 60%, #0a1623 100%); }
      @media (max-width: 400px) { .neon-snake-root #mobile-frame { max-width: 98vw; width: 98vw; } .neon-snake-root .container, .neon-snake-root .game-box { max-width: 98vw; width: 98vw; } .neon-snake-root .game-box { width: 90vw; height: 90vw; max-width: 294px; max-height: 294px; } .neon-snake-root #game-canvas { width: 86vw; height: 86vw; max-width: 288px; max-height: 288px; } .neon-snake-root .dpad-btn { width: 20px; height: 20px; font-size: 0.85em; } .neon-snake-root .dpad { width: 56px; height: 56px; aspect-ratio: 1/1; padding: 0; gap: 2px; } .neon-snake-root .dpad-row { gap: 3px; } }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); document.head.removeChild(font); };
  }, []);

  // Helper function to get all occupied cells
  function getOccupiedCells(snake, bombs, fruit, timeFruit, tonFruit) {
    const occupied = new Set();
    snake.forEach(s => occupied.add(`${s.x},${s.y}`));
    bombs.forEach(b => occupied.add(`${b.x},${b.y}`));
    if (fruit) occupied.add(`${fruit.x},${fruit.y}`);
    if (timeFruit) occupied.add(`${timeFruit.x},${timeFruit.y}`);
    if (tonFruit) occupied.add(`${tonFruit.x},${tonFruit.y}`);
    return occupied;
  }

  function randomEmptyCellNoOverlap(snake, bombs, fruit, timeFruit, tonFruit) {
    const occupied = getOccupiedCells(snake, bombs, fruit, timeFruit, tonFruit);
    let cell;
    do {
      cell = { x: Math.floor(Math.random() * gridCount), y: Math.floor(Math.random() * gridCount) };
    } while (occupied.has(`${cell.x},${cell.y}`));
    return cell;
  }

  // Draw everything on canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const gridSize = canvas.width / gridCount;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw grid
    ctx.save();
    ctx.strokeStyle = neonGrid;
    for (let i = 0; i <= gridCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= gridCount; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(canvas.width, i * gridSize);
      ctx.stroke();
    }
    ctx.restore();
    // Draw snake
    ctx.save();
    for (let i = 0; i < gameState.snake.length; i++) {
      const seg = gameState.snake[i];
      ctx.save();
      // Head
      if (i === 0) {
        ctx.shadowColor = neonSnakeGlow;
        ctx.shadowBlur = 16;
        ctx.fillStyle = neonSnake;
        const x = seg.x * gridSize + 2;
        const y = seg.y * gridSize + 2;
        const w = gridSize * 1.2;
        const h = gridSize * 0.7;
        let angle = 0;
        if (gameState.direction === 'up') angle = -Math.PI / 2;
        if (gameState.direction === 'down') angle = Math.PI / 2;
        if (gameState.direction === 'left') angle = Math.PI;
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(angle);
        // Draw head (rounded rectangle)
        ctx.beginPath();
        ctx.moveTo(-w / 2 + h / 2, -h / 2);
        ctx.lineTo(w / 2 - h / 2, -h / 2);
        ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + h / 2);
        ctx.lineTo(w / 2, h / 2 - h / 2);
        ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - h / 2, h / 2);
        ctx.lineTo(-w / 2 + h / 2, h / 2);
        ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - h / 2);
        ctx.lineTo(-w / 2, -h / 2 + h / 2);
        ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + h / 2, -h / 2);
        ctx.closePath();
        ctx.fill();
        // Eye/dot
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(w / 4, 0, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.shadowColor = neonSnakeGlow;
        ctx.shadowBlur = 16;
        ctx.fillStyle = neonSnake;
        const x = seg.x * gridSize + 2;
        const y = seg.y * gridSize + 2;
        const w = gridSize * 1.2;
        const h = gridSize * 0.7;
        let angle = 0;
        const prev = gameState.snake[i - 1];
        if (prev.x < seg.x) angle = 0;
        if (prev.x > seg.x) angle = Math.PI;
        if (prev.y < seg.y) angle = Math.PI / 2;
        if (prev.y > seg.y) angle = -Math.PI / 2;
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-w / 2 + h / 2, -h / 2);
        ctx.lineTo(w / 2 - h / 2, -h / 2);
        ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + h / 2);
        ctx.lineTo(w / 2, h / 2 - h / 2);
        ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - h / 2, h / 2);
        ctx.lineTo(-w / 2 + h / 2, h / 2);
        ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - h / 2);
        ctx.lineTo(-w / 2, -h / 2 + h / 2);
        ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + h / 2, -h / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
    // Draw bombs
    if (gameState.bombs && gameState.bombs.length > 0) {
      gameState.bombs.forEach(bomb => {
        ctx.save();
        const x = bomb.x * gridSize + gridSize / 2;
        const y = bomb.y * gridSize + gridSize / 2;
        ctx.shadowColor = neonBombGlow;
        ctx.shadowBlur = 18;
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💣', x, y + 2);
        ctx.shadowBlur = 0;
        ctx.restore();
      });
    }
    // Draw fruit
    if (gameState.fruit) {
      ctx.save();
      const x = gameState.fruit.x * gridSize + gridSize / 2;
      const y = gameState.fruit.y * gridSize + gridSize / 2;
      ctx.shadowColor = neonFruit;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(x, y, gridSize * 0.7, 0, 2 * Math.PI);
      ctx.fillStyle = neonFruit;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = 'bold 16px Orbitron, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#0a1623';
      ctx.globalAlpha = 0.85;
      ctx.fillText('C', x, y + 1);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    // Draw time fruit
    if (gameState.timeFruit) {
      ctx.save();
      const x = gameState.timeFruit.x * gridSize + gridSize / 2;
      const y = gameState.timeFruit.y * gridSize + gridSize / 2;
      ctx.shadowColor = neonOrange;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(x, y, gridSize * 0.7, 0, 2 * Math.PI);
      ctx.fillStyle = neonOrange;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = neonBlue;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, gridSize * 0.7, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -gridSize * 0.45);
      ctx.strokeStyle = neonBlue;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(x, y, gridSize * 0.13, 0, 2 * Math.PI);
      ctx.fillStyle = neonBlue;
      ctx.fill();
      ctx.restore();
    }
    // Draw TON fruit
    if (gameState.tonFruit) {
      ctx.save();
      const x = gameState.tonFruit.x * gridSize + gridSize / 2;
      const y = gameState.tonFruit.y * gridSize + gridSize / 2;
      ctx.shadowColor = neonTon;
      ctx.shadowBlur = 18;
      // Draw official TON logo SVG only (no text)
      const img = new window.Image();
      const svg64 = btoa(tonLogoSVG.replace(/\n/g, ''));
      img.src = 'data:image/svg+xml;base64,' + svg64;
      img.onload = function() {
        ctx.drawImage(img, x - gridSize * 0.7, y - gridSize * 0.7, gridSize * 1.4, gridSize * 1.4);
      };
      if (img.complete) {
        ctx.drawImage(img, x - gridSize * 0.7, y - gridSize * 0.7, gridSize * 1.4, gridSize * 1.4);
      }
      ctx.restore();
    }
  }, [gameState]);

  // --- Controls ---
  function setDirection(dir) {
    if (gameState.gameOver || !gameState.gameStarted) return;
    setGameState(prev => {
      if (
        (dir === 'up' && prev.direction !== 'down') ||
        (dir === 'down' && prev.direction !== 'up') ||
        (dir === 'left' && prev.direction !== 'right') ||
        (dir === 'right' && prev.direction !== 'left')
      ) {
        return { ...prev, nextDirection: dir };
      }
      return prev;
    });
  }

  // --- Game Loop ---
  React.useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    const moveSnake = () => {
      setGameState(prev => {
        let direction = prev.nextDirection;
        let head = { ...prev.snake[0] };
        if (direction === 'up') head.y--;
        if (direction === 'down') head.y++;
        if (direction === 'left') head.x--;
        if (direction === 'right') head.x++;
        // Wrap
        if (head.x < 0) head.x = gridCount - 1;
        if (head.x >= gridCount) head.x = 0;
        if (head.y < 0) head.y = gridCount - 1;
        if (head.y >= gridCount) head.y = 0;
        // Bomb collision
        if (prev.bombs.some(bomb => bomb.x === head.x && bomb.y === head.y)) {
          return { ...prev, gameOver: true };
        }
        // Self collision
        if (prev.snake.some((s, i) => i && s.x === head.x && s.y === head.y)) {
          return { ...prev, gameOver: true };
        }
        // Fruit collision
        let ate = false;
        let crnEaten = prev.crnEaten;
        let fruit = prev.fruit;
        let bombs = [...prev.bombs];
        let timeFruit = prev.timeFruit;
        let tonFruit = prev.tonFruit;
        let timer = prev.timer;
        let usdtEarned = prev.usdtEarned;
        let newSnake = [head, ...prev.snake];
        // CRN fruit
        if (head.x === fruit.x && head.y === fruit.y) {
          ate = true;
          crnEaten++;
          // Bomb logic: every 3 CRN eaten
          if (crnEaten % 3 === 0) {
            // Add a new bomb at a random, unoccupied position
            let newBomb;
            do {
              newBomb = randomEmptyCellNoOverlap(newSnake, bombs, fruit, timeFruit, tonFruit);
            } while (bombs.some(b => b.x === newBomb.x && b.y === newBomb.y));
            bombs.push(newBomb);
          }
          // Time fruit logic: every 5 CRN eaten
          if (crnEaten % 5 === 0) {
            timeFruit = { ...randomEmptyCellNoOverlap(newSnake, bombs, fruit, null, tonFruit), type: 'time' };
          }
          // TON fruit logic: every 10 CRN eaten
          if (crnEaten % 10 === 0) {
            tonFruit = { ...randomEmptyCellNoOverlap(newSnake, bombs, fruit, timeFruit, null), type: 'ton' };
          }
          fruit = { ...randomEmptyCellNoOverlap(newSnake, bombs, null, timeFruit, tonFruit), type: 'crn' };
        }
        // Time fruit collision
        if (timeFruit && head.x === timeFruit.x && head.y === timeFruit.y) {
          timer += 18;
          timeFruit = null;
        }
        // TON fruit collision
        if (tonFruit && head.x === tonFruit.x && head.y === tonFruit.y) {
          usdtEarned += 0.00005;
          tonFruit = null;
        }
        if (!ate) newSnake.pop();
        return {
          ...prev,
          snake: newSnake,
          direction,
          crnEaten,
          fruit,
          bombs,
          timeFruit,
          tonFruit,
          timer,
          usdtEarned,
        };
      });
    };
    const interval = setInterval(moveSnake, 140);
    return () => clearInterval(interval);
  }, [gameState.gameStarted, gameState.gameOver]);

  // --- Timer ---
  React.useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timer <= 1) return { ...prev, timer: 0, gameOver: true };
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState.gameStarted, gameState.gameOver]);

  // --- Start Game ---
  function startGame() {
    if (freePlays <= 0) return; // Block if no free plays left
    setGameState({
      snake: [{ x: 9, y: 9 }],
      direction: 'right',
      nextDirection: 'right',
      fruit: { x: 5, y: 5, type: 'crn' },
      bombs: [],
      timeFruit: null,
      tonFruit: null,
      timer: 60,
      crnEaten: 0,
      usdtEarned: 0,
      gameOver: false,
      gameStarted: true,
      showStart: false,
      crnPoints: 0,
    });
    decrementFreePlays();
  }

  // --- Keyboard Controls ---
  React.useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowUp') setDirection('up');
      if (e.key === 'ArrowDown') setDirection('down');
      if (e.key === 'ArrowLeft') setDirection('left');
      if (e.key === 'ArrowRight') setDirection('right');
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // --- D-Pad Controls ---
  function dpad(dir) {
    setDirection(dir);
  }

  // --- Game Over: Calculate CRN Points and update Home ---
  React.useEffect(() => {
    if (gameState.gameOver && gameState.gameStarted) {
      const multiplier = getTimeMultiplier(gameState.timer);
      const crnPoints = parseFloat((gameState.crnEaten * 0.0001 * multiplier).toFixed(6));
      setGameState(prev => ({ ...prev, crnPoints }));
      setTotalMinedCRN(prev => parseFloat((parseFloat(prev) + crnPoints).toFixed(6)));
      // TON earned
      setTotalTON && setTotalTON(prev => parseFloat((parseFloat(prev) + gameState.usdtEarned).toFixed(5)));
      // Save earned points to localStorage for Telegram bot
      const userId = getUserId();
      const storageKey = `earned_points_${userId}`;
      const savedData = JSON.parse(localStorage.getItem(storageKey) || '{"crn":0,"ton":0}');
      savedData.crn += crnPoints;
      savedData.ton += gameState.usdtEarned;
      localStorage.setItem(storageKey, JSON.stringify(savedData));
    }
  }, [gameState.gameOver]);

  // --- PAY button handler ---
  function handlePay() {
    window.open('ton://transfer/UQN7Y0K38v-nmgjjKjZNf0JqfxpVJgtu9MyjXuQXW0LEJq?amount=100000000&text=PlaySnake', '_blank');
  }

  // --- Overlay ---
  const showOverlay = gameState.showStart || gameState.gameOver;
  const overlayContent = gameState.showStart ? (
    <>
      <div className="game-over-title">NEON SNAKE</div>
      {freePlays > 0 ? (
        <>
          <div style={{marginBottom:8, color:'#7ffcff', fontWeight:700}}>Free Plays Left: {freePlays}</div>
          <button className="play-again-btn" onClick={startGame}>Play</button>
        </>
      ) : (
        <>
          <div style={{marginBottom:8, color:'#ffb347', fontWeight:700}}>No Free Plays Left Today</div>
          <button className="play-again-btn" onClick={handlePay}>Pay to Play</button>
        </>
      )}
    </>
  ) : (
    <>
      <div className="game-over-title">GAME OVER</div>
      <div className="game-over-score">CRN Points: <span>{gameState.crnPoints}</span></div>
      <div className="game-over-score">TON Earned: <span>{gameState.usdtEarned.toFixed(5)}</span></div>
      {freePlays > 0 ? (
        <button className="play-again-btn" onClick={startGame}>Play Again</button>
      ) : (
        <button className="play-again-btn" onClick={handlePay}>Pay to Play</button>
      )}
    </>
  );

  return (
    <div className="neon-snake-root">
      <div id="mobile-frame">
        <div className="container">
          <div className="stats-row">
            <div className="stat"><span className="stat-icon">⏱️</span><span id="timer">{gameState.timer}</span></div>
            <div className="stat"><span>CRN</span> <span id="crn-eaten">{gameState.crnEaten}</span></div>
          </div>
          <div className="game-box" style={{ position: 'relative' }}>
            <canvas ref={canvasRef} id="game-canvas" width="290" height="290"></canvas>
            {showOverlay && (
              <div className="game-over-overlay" style={{ display: 'flex' }}>{overlayContent}</div>
            )}
          </div>
          <div className="game-label">PLAY &amp; EARN: SNAKE GAME</div>
          <div className="usdt-row">
            <span className="usdt-label">TON EARNED</span>
            <span className="usdt-value" id="usdt-earned">{gameState.usdtEarned.toFixed(5)}</span>
          </div>
          <div className="controls">
            <div className="dpad">
              <div className="dpad-row">
                <button className="dpad-btn" onClick={() => dpad('up')}>▲</button>
              </div>
              <div className="dpad-row">
                <button className="dpad-btn" onClick={() => dpad('left')}>◀</button>
                <button className="dpad-btn" onClick={() => dpad('right')}>▶</button>
              </div>
              <div className="dpad-row">
                <button className="dpad-btn" onClick={() => dpad('down')}>▼</button>
              </div>
            </div>
          </div>
          <div className="bottom-row">
            <button className="bottom-btn" onClick={handlePay}>PAY</button>
            <button className="bottom-btn">LEADERBOARD</button>
          </div>
        </div>
      </div>
    </div>
  );
};

function MainLayout() {
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const [totalMinedCRN, setTotalMinedCRN] = React.useState(0);
  const [totalTON, setTotalTON] = React.useState(0);
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
              <Route path="/" element={<Home goToLiveMine={goToLiveMine} miningRate={miningRate} miningProgress={elapsed} miningFilled={miningFilled} minedCRN={minedCRN} totalTON={totalTON} setTotalTON={setTotalTON} />} />
              <Route path="/livemine" element={<LiveMine />} />
              <Route path="/earn" element={<Earn setTotalTON={setTotalTON} />} />
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
          bgcolor: 'transparent',
          borderTop: 'none',
          boxShadow: '0 0 24px 4px #00fff7',
          borderRadius: '18px 18px 24px 24px',
          overflow: 'hidden',
          m: 0,
          p: 0,
        }}>
          <BottomNavigation
            value={value}
            onChange={(event, newValue) => setValue(newValue)}
            showLabels
            sx={{
              width: '100%',
              minHeight: 48,
              bgcolor: 'rgba(10,22,35,0.98)',
              boxShadow: '0 0 16px 2px #00fff7',
              borderRadius: '18px 18px 24px 24px',
              '.Mui-selected': { color: '#00fff7 !important', textShadow: '0 0 8px #00fff7' },
              fontFamily: 'Orbitron, Arial, sans-serif',
              fontWeight: 700,
              fontSize: '1em',
              p: 0,
              m: 0,
            }}
          >
            <BottomNavigationAction label="Home" icon={<HomeIcon sx={{ fontSize: 22, mb: '2px' }} />} sx={{ minWidth: 0, maxWidth: 60, p: 0, m: 0, color: '#7ffcff', '&.Mui-selected': { color: '#00fff7' }, fontSize: '0.95em' }} />
            <BottomNavigationAction label="Live Mine" icon={<MonetizationOnIcon sx={{ fontSize: 22, mb: '2px' }} />} sx={{ minWidth: 0, maxWidth: 60, p: 0, m: 0, color: '#7ffcff', '&.Mui-selected': { color: '#00fff7' }, fontSize: '0.95em' }} />
            <BottomNavigationAction label="Earn" icon={<GamesIcon sx={{ fontSize: 22, mb: '2px' }} />} sx={{ minWidth: 0, maxWidth: 60, p: 0, m: 0, color: '#7ffcff', '&.Mui-selected': { color: '#00fff7' }, fontSize: '0.95em' }} />
            <BottomNavigationAction label="Tasks" icon={<AssignmentIcon sx={{ fontSize: 22, mb: '2px' }} />} sx={{ minWidth: 0, maxWidth: 60, p: 0, m: 0, color: '#7ffcff', '&.Mui-selected': { color: '#00fff7' }, fontSize: '0.95em' }} />
            <BottomNavigationAction label="Referral" icon={<PeopleIcon sx={{ fontSize: 22, mb: '2px' }} />} sx={{ minWidth: 0, maxWidth: 60, p: 0, m: 0, color: '#7ffcff', '&.Mui-selected': { color: '#00fff7' }, fontSize: '0.95em' }} />
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
