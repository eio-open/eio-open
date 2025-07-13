// EIO Glasses Developer Demo JS
// Key event logger and TTS demo

// Key code mapping for legend (for reference)
const KEY_MAP = {
	'ArrowLeft': 'LEFT',
	'ArrowRight': 'RIGHT',
	'Enter': 'OK',
	'Backspace': 'BACK',
};

const logBox = document.getElementById('log');
const ttsInput = document.getElementById('tts-input');
const speakBtn = document.getElementById('speakBtn');
const ttsStatus = document.getElementById('tts-status');

// Show key events in log, highlight special keys
function logKey(e) {
	let keyName = KEY_MAP[e.code] || e.code;
	let highlight = KEY_MAP[e.code] ? '*' : '';
	logBox.textContent += `${highlight}${keyName}${highlight} `;
	logBox.scrollTop = logBox.scrollHeight;
	// Optionally, show a toast for special keys
	if (KEY_MAP[e.code]) {
		showStatus(`Key: ${KEY_MAP[e.code]}`);
	}
}

document.addEventListener('keydown', logKey);

function showStatus(msg, isError) {
	if (ttsStatus) {
		ttsStatus.textContent = msg;
		ttsStatus.style.color = isError ? '#f66' : '#8f8';
		setTimeout(() => { ttsStatus.textContent = ''; }, 2000);
	}
}

speakBtn.addEventListener('click', function () {
	const text = ttsInput.value.trim() || 'Hello from EIO Glasses!';
	if (window.webOS && webOS.service) {
		webOS.service.request('luna://com.webos.service.tts', {
			method: 'speak',
			parameters: {text},
			onSuccess: function ()  { showStatus('TTS success'); },
			onFailure: function (e) { showStatus('TTS error', true); }
		});
	} else {
		showStatus('webOS service bridge not found', true);
	}
});
