document.addEventListener('keydown', function (e) {
	var box = document.getElementById('log');
	box.textContent += e.code + ' ';
	box.scrollTop = box.scrollHeight;
});

document.getElementById('speakBtn').addEventListener('click', function () {
	if (window.webOS && webOS.service) {
		webOS.service.request('luna://com.webos.service.tts', {
			method: 'speak',
			parameters: {text: 'Hello from E I O Glasses'},
			onSuccess: function ()  { console.log('TTS success'); },
			onFailure: function (e) { console.error('TTS error', e); }
		});
	} else {
		alert('webOS service bridge not found');
	}
});
