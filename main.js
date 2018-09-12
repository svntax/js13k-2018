function toRadians(a){
  return a * (Math.PI / 180);
}

var gameOver = false;
var currentScore = 0;
var hiScore = 0;

function restartGame(){
	currentScore = 0;
	document.getElementById("score").setAttribute("text", {value: "Score: 0"});
	var swirlCenter = document.getElementById("swirl-center");
	while(swirlCenter.firstChild){
		swirlCenter.removeChild(swirlCenter.firstChild);
	}
	gameOver = false;
}

AFRAME.registerComponent("draw-canvas", {
	schema: {default: ""},

	init: function (){
		this.canvas = document.getElementById(this.data);
		this.ctx = this.canvas.getContext('2d');
		this.ctx.rect(0, 0, 16, 16);
		this.ctx.fillStyle = "#DEDEDE";
		this.ctx.fill();
		for(var i = 0; i < 16; i++){
			for(var j = 0; j < 16; j++){
				this.ctx.rect(i*16, j*16, 16, 16);
			}
		}
		this.ctx.strokeStyle = "#2222FF"
		this.ctx.stroke();
	}
});

AFRAME.registerComponent("spin", {
	schema: {
		rotX: {type: "number", default: 0},
		rotY: {type: "number", default: 360},
		rotZ: {type: "number", default: 0}
	},
	
	tick: function(time, deltaTime){
		var data = this.data;
		var el = this.el;
		if(!gameOver){
			el.object3D.rotation.x += toRadians(data.rotX) * (deltaTime / 1000);
			el.object3D.rotation.y += toRadians(data.rotY) * (deltaTime / 1000);
			el.object3D.rotation.z += toRadians(data.rotZ) * (deltaTime / 1000);
		}
	}
});

AFRAME.registerComponent("coin-collect", {
	schema: {
		delay: {type: "number", default: 0.75},
		centerX: {type: "number", default: 0},
		centerY: {type: "number", default: 1.6},
		centerZ: {type: "number", default: 0},
		radius: {type: "number", default: 1.3}
	},
	
	init: function(){
		this.delayTimer = 0;
		var data = this.data;
		var el = this.el;
		el.inDelay = false;
		el.addEventListener("mouseenter", function(){
			if(!gameOver && !this.inDelay){
				this.inDelay = true;
				if(coinSound){
					coinSound.play();
				}
				document.getElementById("score").setAttribute("text", {value: "Score: " + ++currentScore});
				el.object3D.scale.set(0.4, 0.4, 1.2);
			}
		});
	},
	
	tick: function(time, deltaTime){
		var data = this.data;
		var el = this.el;
		if(!gameOver && el.inDelay){
			this.delayTimer += deltaTime / 1000;
			if(this.delayTimer > data.delay){
				this.delayTimer = 0;
				this.respawn();
				el.inDelay = false;
			}
			el.object3D.rotation.y += 12 * (deltaTime / 1000);
		}
	},
	
	respawn: function(){
		var data = this.data;
		var el = this.el;
		var pos = el.object3D.position;
		var theta = toRadians(Math.random() * 180);
		var phi = toRadians(Math.random() * 360);
		var x = data.radius * Math.sin(theta) * Math.cos(phi);
		var y = data.radius * Math.sin(theta) * Math.sin(phi);
		var z = data.radius * Math.cos(theta);
		el.object3D.position.x = data.centerX + x;
		el.object3D.position.y = data.centerY + y;
		el.object3D.position.z = data.centerZ + z;
		el.object3D.scale.set(1, 1, 1);
	}
});

AFRAME.registerComponent("swirl", {
	schema: {
		rotSpeed: {type: "number", default: 60},
		maxLength: {type: "number", default: 60},
		maxAngleChange: {type: "number", default: 90},
		delay: {type: "number", default: 1.5},
		color: {default: "blue"} //TODO gaze debug test
	},
	
	init: function(){
		this.currentRot = 0;
		this.phase01 = true;
		this.inDelay = true;
		this.delayTimer = 0;
		this.stopped = false;
		
		var el = this.el;
		var data = this.data;
		var defaultColor = el.getAttribute("material").color;
		var geom = el.getAttribute("geometry");
		el.addEventListener("mouseenter", function(){
			if(!this.inDelay && !gameOver){
				el.setAttribute("material", "color", data.color);
				if(deadSound && !gameOver){
					deadSound.play();
				}
				gameOver = true;
				document.getElementById("score").setAttribute("text", {value: "Game Over!\nScore: " + currentScore});
			}
		});
		el.addEventListener("mouseleave", function(){
			if(!this.inDelay && !gameOver){
				el.setAttribute("material", "color", defaultColor);
			}
		});
		
		var startPoint = document.createElement("a-entity");
		startPoint.setAttribute("geometry", {
			primitive: "cylinder",
			openEnded: true,
			thetaLength: 4,
			height: 0.15,
			radius: 1.49
		});
		startPoint.setAttribute("material", {
			side: "double",
			color: "green"
		});
		el.parentNode.appendChild(startPoint);
		this.startPoint = startPoint;
		
		var endPoint = document.createElement("a-entity");
		endPoint.setAttribute("geometry", {
			primitive: "cylinder",
			openEnded: true,
			thetaStart: geom.thetaStart + data.maxLength,
			thetaLength: 4,
			height: 0.15,
			radius: 1.49
		});
		endPoint.setAttribute("material", {
			side: "double",
			color: "red"
		});
		endPoint.object3D.rotation.y += toRadians(data.maxAngleChange);
		el.parentNode.appendChild(endPoint);
		this.endPoint = endPoint;
	},
	
	tick: function(time, deltaTime){
		var data = this.data;
		var el = this.el;
		
		if(gameOver){
			if(!this.stopped){
				el.setAttribute("material", "color", "blue");
				this.stopped = true;
			}
		}
		else if(this.inDelay){
			this.delayTimer += deltaTime / 1000;
			if(this.delayTimer > data.delay){
				this.delayTimer = 0;
				this.inDelay = false;
			}
		}
		else{
			var len = el.getAttribute("geometry").thetaLength;
			
			if(this.phase01){
				if(len < data.maxLength){
					var dTheta = data.rotSpeed * (deltaTime / 1000);
					el.setAttribute("geometry", {
						thetaLength: len + dTheta
					});
				}
				else{
					var dTheta = toRadians(data.rotSpeed) * (deltaTime / 1000);
					el.object3D.rotation.y += dTheta;
					this.currentRot += dTheta;
					if(this.currentRot >= toRadians(data.maxAngleChange)){
						this.phase01 = false;
					}
				}
			}
			else{
				if(len > 1){
					var dTheta = data.rotSpeed * (deltaTime / 1000);
					var geom = el.getAttribute("geometry");
					el.setAttribute("geometry", {
						thetaStart: geom.thetaStart + dTheta,
						thetaLength: geom.thetaLength - dTheta
					});
				}
				else{
					el.parentNode.removeChild(this.startPoint);
					el.parentNode.removeChild(this.endPoint);
					el.parentNode.removeChild(el); //TODO object pooling?
				}
			}
		}
	}
});

function spawnSwirl(rotX, rotY, rotZ, rotSpeed, maxLength, maxAngleChange, x = 0, y = 0, z = 0){
	var parentEl = document.getElementById("swirl-center");
	
	var centerEl = document.createElement("a-entity");
	centerEl.setAttribute("rotation", rotX + " " + rotY + " " + rotZ);
	centerEl.setAttribute("position", x + " " + y + " " + z);
	
	var swirlEl = document.createElement("a-entity");
	swirlEl.setAttribute("geometry", {
		primitive: "cylinder",
		openEnded: true,
		thetaLength: 0,
		height: 0.1,
		radius: 1.5
	});
	swirlEl.setAttribute("material", {
		side: "double",
		color: "red"
	});
	swirlEl.setAttribute("swirl", "");
	
	parentEl.appendChild(centerEl);
	centerEl.appendChild(swirlEl);
}

AFRAME.registerComponent("swirl-spawner", {
	schema: {
		amount: {type: "number", default: 5}
	},
	
	init: function(){
		this.spawnTimer = 0;
	},
	
	tick: function(time, deltaTime){
		if(!gameOver){
			var data = this.data;
			var el = this.el;
			this.spawnTimer += (deltaTime / 1000);
			if(this.spawnTimer > 2){
				this.spawnTimer = -3.5;
				for(var i = 0; i < data.amount; i++){
					var rx = Math.random() * 360;
					var ry = Math.random() * 360;
					var rz = Math.random() * 360;
					spawnSwirl(rx, ry, rz, 45, 90, 90);
				}
			}
		}
	}
});

AFRAME.registerComponent("restart-game", {
	schema: {
		delay: {type: "number", default: 2},
	},
	
	init: function(){
		var el = this.el;
		el.inDelay = false;
		el.delayTimer = 0;
		el.addEventListener("mouseenter", function(){
			if(gameOver && !this.inDelay){
				this.inDelay = true;
				el.object3D.scale.set(1.2, 1.2, 1.2);
			}
		});
		el.addEventListener("mouseleave", function(){
			if(gameOver){
				this.inDelay = false;
				el.delayTimer = 0;
				el.object3D.scale.set(1, 1, 1);
			}
		});
	},
	
	tick: function(time, deltaTime){
		var data = this.data;
		var el = this.el;
		if(gameOver && el.inDelay){
			el.delayTimer += deltaTime / 1000;
			if(el.delayTimer > data.delay){
				el.delayTimer = 0;
				el.inDelay = false;
				restartGame();
			}
		}
	}
});