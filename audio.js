var ac = new AudioContext();

var coinSound = new TinyMusic.Sequence(ac, 120, ["G5 s", "C6 s"]);
coinSound.staccato = 0.5;
coinSound.gain.gain.value = 0.5;
coinSound.waveType = "triangle";
coinSound.loop = false;

var lineSound = new TinyMusic.Sequence(ac, 120, ["F#3 0.2", "- 0.2", "F3 0.2", "- 0.2"]);
lineSound.waveType = "triangle";
lineSound.staccato = 0.3;
lineSound.loop = true;

var deadSound = new TinyMusic.Sequence(ac, 120, ["E2 q", "C2 0.2", "C2 0.2", "C2 0.2", "C2 0.2", "C2 0.2"]);
deadSound.smoothing = 0.8;
deadSound.gain.gain.value = 0.2;
deadSound.loop = false;