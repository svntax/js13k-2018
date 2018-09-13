var ac = new AudioContext();

var coinSound = new TinyMusic.Sequence(ac, 120, ["G5 s", "C6 s"]);
coinSound.staccato = 0.5;
coinSound.gain.gain.value = 0.5;
coinSound.waveType = "triangle";
coinSound.loop = false;

var startSound = new TinyMusic.Sequence(ac, 125, ["D3 s", "G3 s", "A3 s", "D4 s", "D#4 s", "E4 s"]);
startSound.staccato = 0.3;
startSound.gain.gain.value = 0.1;
startSound.loop = false;

var deadSound = new TinyMusic.Sequence(ac, 120, ["E2 q", "C2 0.2", "C2 0.2", "C2 0.2", "C2 0.2", "C2 0.2"]);
deadSound.smoothing = 0.8;
deadSound.gain.gain.value = 0.1;
deadSound.loop = false;