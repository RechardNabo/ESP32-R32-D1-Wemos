// WiFi network scanning
async function scanWiFi() {
  const networksDiv = document.getElementById('wifi-networks');
  networksDiv.innerHTML = '<div class="status-message">Scanning networks...</div>';
  
  try {
    const response = await fetch('/api/scan?type=wifi');
    const networks = await response.json();
    
    if (networks.length === 0) {
      networksDiv.innerHTML = '<div class="status-message">No networks found</div>';
      return;
    }
    
    let html = '<ul class="network-list">';
    
    networks.forEach((network, index) => {
      // Convert RSSI to bars (0-4)
      let bars = 0;
      if (network.rssi > -55) bars = 4;
      else if (network.rssi > -65) bars = 3;
      else if (network.rssi > -75) bars = 2;
      else if (network.rssi > -85) bars = 1;
      
      let barSymbols = '';
      for (let j = 0; j < 4; j++) {
        if (j < bars) barSymbols += '&#9608;'; // Full block for signal
        else barSymbols += '&#9617;'; // Light shade for no signal
      }
      
      html += `<li class="network-item" onclick="toggleForm('form-wifi-${index}')">`;
      html += `<div>${network.ssid}${network.encrypted ? ' 🔒' : ''}</div>`;
      html += `<div class="signal-strength"><span class="signal-bars">${barSymbols}</span></div>`;
      html += `</li>`;
      
      html += `<div class="connect-form" id="form-wifi-${index}" style="display:none;">`;
      html += `<form onsubmit="connectToWiFi('${network.ssid}', this); return false;">`;
      html += `<input type="hidden" name="ssid" value="${network.ssid}">`;
      
      if (network.encrypted) {
        html += `<div class="input-group"><label>Password for ${network.ssid}</label>`;
        html += `<input type="password" name="password" required></div>`;
      }
      
      html += `<button type="submit">Connect</button>`;
      html += `</form></div>`;
    });
    
    html += '</ul>';
    networksDiv.innerHTML = html;
  } catch (error) {
    networksDiv.innerHTML = `<div class="status-message error">Error scanning networks: ${error.message}</div>`;
  }
}

// Connect to WiFi
async function connectToWiFi(ssid, form) {
  const formData = new FormData(form);
  const password = formData.get('password') || '';
  
  try {
    const response = await fetch('/api/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `type=wifi&ssid=${encodeURIComponent(ssid)}&password=${encodeURIComponent(password)}`
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`Successfully connected to ${ssid}. IP address: ${result.ip}`);
      window.location.reload();
    } else {
      alert(`Failed to connect: ${result.message}`);
    }
  } catch (error) {
    alert(`Error connecting: ${error.message}`);
  }
}

// Toggle connect form
function toggleForm(formId) {
  const form = document.getElementById(formId);
  const forms = document.getElementsByClassName('connect-form');
  
  for (let i = 0; i < forms.length; i++) {
    if (forms[i].id !== formId) {
      forms[i].style.display = 'none';
    }
  }
  
  form.style.display = form.style.display === 'none' || form.style.display === '' ? 'block' : 'none';
}

// Get connection status
async function getConnectionStatus() {
  try {
    const response = await fetch('/api/status');
    const status = await response.json();
    
    const statusDiv = document.getElementById('connection-status');
    
    if (status.connected) {
      statusDiv.innerHTML = `
        <div class="card">
          <div class="wifi-info">
            Connected to <span>${status.ssid}</span><br>
            IP: <span>${status.ip}</span>
          </div>
        </div>
      `;
    } else {
      statusDiv.innerHTML = '';
    }
  } catch (error) {
    console.error('Error getting connection status:', error);
  }
}

// Initial loading
document.addEventListener('DOMContentLoaded', function() {
  getConnectionStatus();
  scanWiFi();
});