$(function(){
	//pixi模块加载
	let Application = PIXI.Application,
		loader = PIXI.loader,
		Container = PIXI.Container,
		resources = PIXI.loader.resources,
		Sprite = PIXI.Sprite,
		Text = PIXI.Text,
    	Graphics = PIXI.Graphics,
    	TextStyle = PIXI.TextStyle;

	//游戏模块加载
	//基础属性
	const winW = window.innerWidth,
		  winH = window.innerHeight,
		  frameNumber = 0.001666666666667;
	let	  bgH,bgW,scaleX,scaleY,showState,
		  setime=0;
	/*
		showState   0 撑满屏幕
					1 不变形宽度撑满屏幕
					2 不变形高度撑满屏幕
	*/

	let	now = new Date(),
		lastTime = new Date();

	//场景
	let sceneLoding,sceneMain,sceneGame1,sceneGame2,sceneGame3,sceneOver,secneEye;

	//场景元素
	//loading
	let loadingScene,loadingWord;
	//main
	let mainBg,mainBg2,mainChar,mainWord;
	//game
	let gameBg,gameBg2,ninja,id,ObstacleNum,ObstacleInfm,bloodWord,eye;
		//button
		let leftButton,rightButton,jumpButton;
	//over
	let overChar,backWord,againWord;
	//游戏元素
	let isStart=false,
		ObstacleMove=false,
		isShakeLeft=true,
		isShake = false,
		ShakeNum = 0,
		ShakeFrequency = 2,
		gameBgArr,
		stage=1,
		GameSpeed=50,
		BGspeed=GameSpeed*stage,
		CharMoveSpeed = GameSpeed*1.5,
		displacementCenterM = {
			"offset":160,
			"number":4
		},
		displacementCenter = [],
		currentPos = 1,
		suspendTime = 500,
		settingTime = 500,
		startTime = 1000,
		PsettingTime = 500,
		ShakeTime = 300,
		bloodNum=1,
		gameOver = false,
		ObstacleTips=[],
		tipsNum=0,
		tipsMove=false,
		tipsCome=false,
		tipsGo=false,
		isFirst=true;
	//定义画布
	let app = new Application({
		width:winW,
		height:winH,
		antialiasing:false,
		transparent:true,
		resolution:1
	})
	document.body.appendChild(app.view);

	//game函数
	game = {
		"loadProgressHandler":function(loader, resource){
			loadingWord.text = Math.floor(loader.progress - 100) + "%";
			loadingWord.position.x = bgW/2-loadingWord.width/2;
			if(loader.progress==200){
				sceneLoding.visible = false;
			}
		},
		"loadOver":function(loader, resource){
			sceneLoding = new Container();
			loadingScene = new Sprite(resources["loading"].texture);
			bgW=loadingScene.width;
			bgH=loadingScene.height;
			sceneLoding.addChild(loadingScene);

			for(var i=0;i<displacementCenterM.number;i++){
				displacementCenter.push((bgW-displacementCenterM.offset*2)/displacementCenterM.number*i+(bgW-displacementCenterM.offset*2)/displacementCenterM.number/2+displacementCenterM.offset);
			}

			let style = new TextStyle({
			  fontFamily: "Arial",
			  fontSize: 36,
			  fill: "white",
			  stroke: '#ff3300',
			  strokeThickness: 4,
			  dropShadow: true,
			  dropShadowColor: "#000000",
			  dropShadowBlur: 4,
			  dropShadowAngle: Math.PI / 6,
			  dropShadowDistance: 6,
			});
			loadingWord = new Text("loading...", style);
			loadingWord.position.y = 928;
			loadingWord.position.x = bgW/2-loadingWord.width/2;
			sceneLoding.addChild(loadingWord);
			app.stage.addChild(sceneLoding);
			game.appScale(1)
			app.ticker.add(delta => game.loop(delta));
		},
		"loop":function(){
			if(isStart){
				if(isShake){
					game.Shake();
				}
				if(gameOver){
					game.spineRate(10)
				}
				game.spineRate(frameNumber*GameSpeed)
				game.animateGameBg();
				if(ObstacleMove){
					game.animationObstacle();
				}
				if(ninja.isMove){
					game.animationChar();
				}
				if(tipsMove){
					game.animationTips();
				}
				// }else{
				// 	app.stage.rotation=0;
				// 	if(isShakeLeft){
				// 		app.stage.y-=3;
				// 	}else{
				// 		app.stage.y-=3;
				// 	}
				// }
			}
			lastTime = new Date();
		},
		"appScale":function(state){
			if(state == 0){

			}else if(state==1){
				if(winW/winH>bgW/bgH){
					scaleX=winW/bgW;
					scaleY=winW/bgW;
					app.stage.scale.x=scaleX;
					app.stage.scale.y=scaleY;
					app.stage.position.y=-(app.stage.height-winH)/2;	
				}else{
					scaleX=winH/bgH;
					scaleY=winH/bgH;
					app.stage.scale.x=scaleX;
					app.stage.scale.y=scaleY;
					app.stage.position.x=-(app.stage.width-winW)/2;
				}
			}
		},
		"render":function(){
			game.renderMain();
			// game.gameInit();
		},
		"renderMain":function(){
			//主菜单
			sceneMain = new Container();
			sceneMain.visible = true;
			mainBg = new PIXI.spine.Spine(resources.mainImg.spineData);
			mainBg.x = bgW/2;
			mainBg.y = bgH;
			mainBg.state.setAnimation(0, 'idel1', true);
			sceneMain.addChild(mainBg);

			mainChar = new PIXI.spine.Spine(resources.spine_ninja1.spineData);
			mainChar.x = bgW/2-100;
			mainChar.y = bgH/2+400;
			mainChar.state.setAnimation(0, 'animation', true);
			sceneMain.addChild(mainChar);

			mainBg2 = new PIXI.spine.Spine(resources.mainImg.spineData);
			mainBg2.x = bgW/2;
			mainBg2.y = bgH;
			mainBg2.state.setAnimation(0, 'idel2', true);
			sceneMain.addChild(mainBg2);

			let style = new TextStyle({
			  fontFamily: "Arial",
			  fontSize: 70,
			  fill: "white",
			  stroke: '#0000',
			  strokeThickness: 4,
			  dropShadow: true,
			  dropShadowColor: "#000000",
			  dropShadowBlur: 4,
			  dropShadowAngle: Math.PI / 6,
			  dropShadowDistance: 6,
			});
			mainWord = new Text("Start", style);
			mainWord.position.y = bgH/2-300;
			mainWord.position.x = bgW/2+150;
			mainWord.interactive = true;
			mainWord.on("pointerdown",function(){
				game.gameInit();
				sceneMain.visible = false;
				sceneGame1.visible = true;
				sceneGame2.visible = true;
				sceneGame3.visible = true;
				isStart = true;
			})
			sceneMain.addChild(mainWord);

			app.stage.addChild(sceneMain);
		},
		"renderGame":function(){
			id = resources["all"].textures;
			sceneGame1 = new Container();
			sceneGame1.visible = false;
			sceneGame2 = new Container();
			sceneGame2.visible = false;
			sceneGame3 = new Container();
			sceneGame3.visible = false;
			game.renderGameBg();
			game.renderButton();
			game.renderChar();
			game.renderBlood();
			game.renderObstacle();
			app.stage.addChild(sceneGame1);
			game.renderEye();
			app.stage.addChild(sceneGame3);
			app.stage.addChild(sceneGame2);
			game.renderOver();
		},
		"renderGameBg":function(){
			//PIXI原生方法图片会失真暂时不考虑
			gameBg = new Sprite(resources["map"].texture);
			gameBg.x = 0;
			gameBg.y = 0;
			sceneGame1.addChild(gameBg);
			gameBg2 = new Sprite(resources["map"].texture);
			gameBg2.x = 0;
			gameBg2.y = -gameBg2.height;
			sceneGame1.addChild(gameBg2);
			gameBg3 = new Sprite(resources["map"].texture);
			gameBg3.x = 0;
			gameBg3.y = -gameBg3.height*2;
			sceneGame1.addChild(gameBg3);
			gameBgArr = [gameBg,gameBg2,gameBg3];
		},
		"animateGameBg":function(){
			if(GameSpeed==1){
				BGspeed=GameSpeed;
			}else{
				BGspeed=GameSpeed*stage;
			}
			let minH = 9999;
			for(let i = gameBgArr.length-1;i>=0;i--){
				if(gameBgArr[i].y<minH){
					minH=gameBgArr[i].y;
				}
			}
			for(let i = gameBgArr.length-1;i>=0;i--){
				if(gameBgArr[i].y>gameBgArr[i].height*1.5){
					gameBgArr[i].y = minH-gameBgArr[0].height;
				}
				gameBgArr[i].y+=BGspeed;
			}
		},
		"renderButton":function(){

			let ButtonY = bgH/2+300;
			leftButton = new Sprite(id["left.png"]);
			leftButton.x = bgW/2-leftButton.width-150;
			leftButton.y = ButtonY;
			sceneGame2.addChild(leftButton);

			rightButton = new Sprite(id["right.png"]);
			rightButton.x = bgW/2+150;
			rightButton.y = ButtonY;
			sceneGame2.addChild(rightButton);

			jumpButton = new Sprite(id["jump.png"]);
			jumpButton.x = bgW/2-jumpButton.width/2;
			jumpButton.y = ButtonY;
			sceneGame2.addChild(jumpButton);
		},
		"renderChar":function(){
			ninja = new PIXI.spine.Spine(resources.spine_ninja.spineData);
		    ninja.skeleton.setToSetupPose();
		    ninja.update(0);
		    ninja.autoUpdate = false;
		    ninja.x = displacementCenter[currentPos];
		    ninja.y = bgH/2 + 200;
		    ninja.data = {
		    	"y":bgH/2 + 200
		    }
		    ninja.state.setAnimation(0,'animation',true);

		    leftButton.interactive = true;
			leftButton.on('pointerdown', function() {
				if(ninja.isMove)return;
		    	currentPos--;
		    	if(currentPos<0){
		    		currentPos=0;
		    		ninja.isMove = null;
		    		return;
		    	}
		    	ninja.isMove = "left";
		        ninja.state.setAnimation(0, 'animation2', false);
		        ninja.state.addAnimation(0, 'animation', true, 0.15);
		    });

		    rightButton.interactive = true;
			rightButton.on('pointerdown', function() {
				if(ninja.isMove)return;
		    	currentPos++;
		    	if(currentPos>=displacementCenter.length){
		    		currentPos=displacementCenter.length-1;
		    		ninja.isMove = null;
		    		return;
		    	}
		    	ninja.isMove = "right";
		        ninja.state.setAnimation(0, 'animation3', false);
		        ninja.state.addAnimation(0, 'animation', true, 0.15);
		    });

		    jumpButton.interactive = true;
		    jumpButton.on('pointerdown', function() {
		    	if(ninja.isMove)return;
		    	ninja.isMove = "jump1";
		        ninja.state.setAnimation(0,"jump1",false);
		        ninja.state.addAnimation(0,'jump2',true,0.3);
		        ninja.state.addAnimation(0,'animation',true,0.4);
		    });

		    sceneGame2.addChild(ninja)
		},
		"animationChar":function(){
			CharMoveSpeed =  GameSpeed*1.5;
			if(ninja.isMove == "left"){
				if(ninja.x >= displacementCenter[currentPos]){
						ninja.x -= CharMoveSpeed;
				}else{
					ninja.x = displacementCenter[currentPos];
					ninja.isMove = null;
				}
			}else if(ninja.isMove == "right"){
				if(ninja.x <= displacementCenter[currentPos]){
						ninja.x += CharMoveSpeed;
				}else{
					ninja.x = displacementCenter[currentPos];
					ninja.isMove = null;
				}
			}else if(ninja.isMove == "jump1"){
				if(ninja.y >= ninja.data.y-50){
						ninja.y -= CharMoveSpeed;
						ninja.scale.x += CharMoveSpeed/1000;
						ninja.scale.y += CharMoveSpeed/1000;
						ninja.scale 
				}else{
					ninja.y = ninja.data.y-50;
					ninja.scale.x = 1.5;
					ninja.scale.y = 1.5;
					ninja.isMove = "jump2";
				}
			}else if(ninja.isMove == "jump2"){
				if(ninja.y <= ninja.data.y){
						ninja.y += CharMoveSpeed/10;
						ninja.scale.x -= CharMoveSpeed/1200;
						ninja.scale.y -= CharMoveSpeed/1200;
						ninja.scale 
				}else{
					ninja.y = ninja.data.y;
					ninja.scale.x = 1;
					ninja.scale.y = 1;
					ninja.isMove = null;
				}
			}
		},
		"renderBlood":function(){
			let style = new TextStyle({
			  fontFamily: "Arial",
			  fontSize: 60,
			  fill: "white",
			  stroke: '#ff3300',
			  strokeThickness: 4,
			  dropShadow: true,
			  dropShadowColor: "#000000",
			  dropShadowBlur: 4,
			  dropShadowAngle: Math.PI / 6,
			  dropShadowDistance: 6,
			});
			bloodWord = new Text(bloodNum, style);
			bloodWord.position.y = (winH/2-300);
			bloodWord.position.x = (winW/2-100);
			sceneGame2.addChild(bloodWord);
		},
		"renderObstacle":function(){
			ObstacleNum = randomInt(2,4);
			ObstacleInfm = [];
			for(let i=0;i<ObstacleNum;i++){
				let ObstacleStateRnd = randomInt(0,100);
				let ObstacleState = 0;
				let ObstacleStateSub = [];
				// let checkpointStateSub = null;
				if(ObstacleStateRnd<0){

				}else if(ObstacleStateRnd>=0&&ObstacleStateRnd<=100){
					ObstacleState = 0;
					let ObstacleStateSubNum = randomInt(1,3);
					while(ObstacleStateSubNum>ObstacleStateSub.length){
						let ObstacleStateSubRnd=randomInt(0,3);
						let isRepeat = false;
						for(let x = 0;x<ObstacleStateSub.length;x++){
							if(ObstacleStateSub[x]==ObstacleStateSubRnd){
								isRepeat = true;
							}
						}
						if(!isRepeat){
							ObstacleStateSub.push(ObstacleStateSubRnd)
						}
					}
				}else{

				}
				ObstacleInfm.push({
					"state":ObstacleState,
					"Sub":ObstacleStateSub,
					"sprite":[]
				})
			}

			for(let i=0;i<ObstacleInfm.length;i++){
				for(let j=0;j<ObstacleInfm[i].Sub.length;j++){
					let muzhuang = new Sprite(id["muzhuang.png"]);
					muzhuang.x = displacementCenter[ObstacleInfm[i].Sub[j]]-muzhuang.width/2;
					// muzhuang.y = -muzhuang.height*3;
					muzhuang.y = bgH/2-muzhuang.height*4;
					muzhuang.alpha = 0;
					sceneGame3.addChild(muzhuang);
					ObstacleInfm[i]["sprite"].push({
						"obj":muzhuang
					})
				}
			}
			// setTimeout(function(){
			// 	ObstacleMove = true;
			// },startTime)
			if(setime>=2){
				stage = 2.5;
			}
			setime++;
			if(isFirst){
				setTimeout(function(){
					secneEye.visible = true;
					tipsMove = true;
					tipsCome =true;
				},2000)
				isFirst=true;
			}else{
				setTimeout(function(){
					secneEye.visible = true;
					tipsMove = true;
					tipsCome =true;
				},startTime)
			}
		},
		"renderEye":function(){
			secneEye = new Container();
			secneEye.visible = false;
			let rectangle = new Graphics();
			rectangle.beginFill(0x000000);
			rectangle.drawRect(0, 0, bgW, bgH);
			rectangle.endFill();
			// rectangle.alpha  = 0.9;
			rectangle.x = 0;
			rectangle.y = 0;
			secneEye.addChild(rectangle);

			eye = new PIXI.spine.Spine(resources.eye.spineData);
			eye.x = bgW/2;
			eye.y = bgH/2;
		    eye.state.setAnimation(0,'animation1',true);
			secneEye.addChild(eye);

			for(let i = 0;i<4;i++){
				ObstacleTips.push(bgH/2-141*i);
			}
			app.stage.addChild(secneEye);
		},
		"animationTips":function(){
			let isOver = false;

			
			if(tipsGo){
				for(let j =0;j<ObstacleInfm[tipsNum].sprite.length;j++){
					ObstacleInfm[tipsNum].sprite[j].obj.y+=10;
					ObstacleInfm[tipsNum].sprite[j].obj.alpha+=0.01;
					if(ObstacleInfm[tipsNum].sprite[j].obj.y>=(bgH/2+ObstacleInfm[tipsNum].sprite[j].obj.height)){
						ObstacleInfm[tipsNum].sprite[j].obj.y = bgH/2+ObstacleInfm[tipsNum].sprite[j].obj.height;
						ObstacleInfm[tipsNum].sprite[j].obj.alpha = 0;
						isOver = true;
					}
				}
				if(isOver){
					tipsNum++;
					if(tipsNum==ObstacleInfm.length){
						tipsNum = 0;
						for(let i=0;i<ObstacleInfm.length;i++){
							for(let j=0;j<ObstacleInfm[i].sprite.length;j++){
								ObstacleInfm[i].sprite[j].obj.y = -ObstacleInfm[i].sprite[j].obj.height*3;
								ObstacleInfm[i].sprite[j].obj.alpha = 1;
							}
						}
						tipsGo=false;
						setTimeout(function(){
							secneEye.visible = false;
							ObstacleMove = true;
							tipsMove = false;
						},startTime)
					}
				}
			}
			if(tipsCome){
				for(let j =0;j<ObstacleInfm[tipsNum].sprite.length;j++){
					ObstacleInfm[tipsNum].sprite[j].obj.y+=10;
					ObstacleInfm[tipsNum].sprite[j].obj.alpha+=0.01;
					if(ObstacleInfm[tipsNum].sprite[j].obj.y>=(bgH/2-ObstacleInfm[tipsNum].sprite[j].obj.height*tipsNum)){
						ObstacleInfm[tipsNum].sprite[j].obj.y = bgH/2-ObstacleInfm[tipsNum].sprite[j].obj.height*tipsNum;
						ObstacleInfm[tipsNum].sprite[j].obj.alpha = 1;
						isOver = true;
					}
				}
				if(isOver){
					tipsNum++;
					if(tipsNum==ObstacleInfm.length){
						tipsNum = 0;
						tipsCome=false;
						tipsGo=true;
					}
				}
			}
		},
		"animationObstacle":function(){
			if(GameSpeed==1){
				BGspeed=GameSpeed;
			}else{
				BGspeed=GameSpeed*stage;
			}
			for(let i = 0;i<1;i++){
				for(let j = ObstacleInfm[i].sprite.length-1;j>=0;j--){
				// for(let j = 0;j<ObstacleInfm[i].sprite.length;j++){
					if((ObstacleInfm[i].sprite[0].obj.y+ObstacleInfm[i].sprite[0].obj.height+ninja.height/2)>=ninja.y&&!ObstacleInfm[i].sprite[0]["isPass"]){
						let isCollision = false;
						for(var x=0;x<ObstacleInfm[i].Sub.length;x++){
							if(ObstacleInfm[i].Sub[x]==currentPos){
								ObstacleInfm[i].sprite[0]["isPass"] = true;
								GameSpeed=10;
								isCollision = true;
								bloodWord.text = --bloodNum;
								isShake=true;
								if(bloodNum==0){
									GameSpeed=0;
									gameOver=true;
		    						setTimeout(function(){
										isShake=false;
										if(!isShakeLeft){
											isShakeLeft=true;
											app.stage.x-=10;
											app.stage.y-=30;
										}
		    							ninja.state.setAnimation(0,'tired',true);
	    								leftButton.interactive = false;
	    								rightButton.interactive = false;
	    								jumpButton.interactive = false;
		    							setTimeout(function(){
		    								isStart = false;
											sceneOver.visible = true;
		    							},1000)
									},ShakeTime)
									return;
								}
								setTimeout(function(){
									isShake=false;
									if(!isShakeLeft){
										isShakeLeft=true;
										app.stage.x-=10;
										app.stage.y-=30;
									}
									// GameSpeed=10;
									// let minH = 9999;
									// for(let x = gameBgArr.length-1;x>=0;x--){
									// 	if(gameBgArr[x].y<minH){
									// 		minH=gameBgArr[x].y;
									// 	}
									// }
									// for(let y = gameBgArr.length-1;y>=0;y--){
									// 	if(gameBgArr[y].y>gameBgArr[y].height*1.5){
									// 		gameBgArr[y].y = minH-gameBgArr[0].height;
									// 	}
									// 	gameBgArr[y].y+=ObstacleInfm[i].sprite[0].obj.height;
									// }
									// for(let z = ObstacleInfm[0].sprite.length-1;z>=0;z--){
									// 	ObstacleInfm[0].sprite[z].obj.y +=ObstacleInfm[i].sprite[0].obj.height;
									// }
								},ShakeTime)
							}
						}
						if(isCollision)continue;
						if(GameSpeed!=1){
							setTimeout(function(){
								GameSpeed=10;
							},suspendTime)
						}
						GameSpeed=1;
						ObstacleInfm[i].sprite[0]["isPass"] = true;
					}
					if(ObstacleInfm[i].sprite[0].obj.y>=bgH+100){
						ObstacleInfm.shift();
						ObstacleMove = false;
						if(ObstacleInfm.length==0){
							setTimeout(function(){
								game.renderObstacle();
							},PsettingTime)
							return;
						}
						setTimeout(function(){
							ObstacleMove = true;
						},settingTime)
						return;
					}
					ObstacleInfm[i].sprite[j].obj.y +=BGspeed;
				}
			}
		},
		"Shake":function(){
			ShakeNum++;
			if(ShakeNum!=ShakeFrequency)return;
			ShakeNum=0;
			if(isShakeLeft){
				isShakeLeft=false;
				app.stage.x+=10;
				app.stage.y+=30;
			}else{
				isShakeLeft=true;
				app.stage.x-=10;
				app.stage.y-=30;
			}
		},
		"renderOver":function(){
			sceneOver = new Container();
			sceneOver.visible = false;

			let rectangle = new Graphics();
			rectangle.beginFill(0x000000);
			rectangle.drawRect(0, 0, bgW, bgH);
			rectangle.endFill();
			rectangle.alpha  = 0.4;
			rectangle.x = 0;
			rectangle.y = 0;
			sceneOver.addChild(rectangle);

			// sceneOver.background = 0x000000
			sceneOver.backgroundColor = 0x000000
			overChar = new PIXI.spine.Spine(resources.spine_ninja2.spineData);
			overChar.x = bgW/2-100;
			overChar.y = bgH/2+200;
			overChar.state.setAnimation(0, 'animation', true);
			sceneOver.addChild(overChar);

			let style = new TextStyle({
			  fontFamily: "Arial",
			  fontSize: 70,
			  fill: "white",
			  stroke: '#0000',
			  strokeThickness: 4,
			  dropShadow: true,
			  dropShadowColor: "#000000",
			  dropShadowBlur: 4,
			  dropShadowAngle: Math.PI / 6,
			  dropShadowDistance: 6,
			});

			backWord = new Text("返回", style);
			backWord.position.y = bgH/2+300;
			backWord.position.x = bgW/2-250;
			backWord.interactive = true;
			backWord.on("pointerdown",function(){
				sceneMain.visible = true;
				sceneGame1.visible = false;
				sceneGame2.visible = false;
				sceneGame3.visible = false;
				secneEye.visible = false;
				sceneOver.visible = false;
				isStart = false;
			})
			sceneOver.addChild(backWord);

			againWord = new Text("重来", style);
			againWord.position.y = bgH/2+300;
			againWord.position.x = bgW/2+100;
			againWord.interactive = true;
			againWord.on("pointerdown",function(){
				sceneOver.visible = false;
				game.gameInit();
				sceneMain.visible = false;
				sceneGame1.visible = true;
				sceneGame2.visible = true;
				sceneGame3.visible = true;
				secneEye.visible = false;
				isStart = true;
			})
			sceneOver.addChild(againWord);

			app.stage.addChild(sceneOver);
		},
		"spineRate":function(n){
			ninja.update(n);
		},
		"gameInit":function(){
			setime = 0;
			sceneGame1 = null;
			sceneGame2 = null;
			sceneGame3 = null;
			sceneOver = null;
			sceneEye = null;
			isStart=false,
			ObstacleMove=false,
			isShakeLeft=true,
			isShake = false,
			ShakeNum = 0,
			ShakeFrequency = 2,
			gameBgArr,
			stage=1.5,
			GameSpeed=10,
			BGspeed=GameSpeed*stage,
			currentPos = 1,
			suspendTime = 500,
			settingTime = 100,
			startTime = 500,
			PsettingTime = 100,
			ShakeTime = 300,
			bloodNum=1,
			gameOver = false,
			ObstacleTips=[],
			tipsNum=0,
			tipsMove=false,
			tipsCome=false,
			tipsGo=false;
			game.renderGame();
		}
	}

	function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


	loader
	.add("loading","examples/images/background.jpg")
	.load(function(){
		game.loadOver();
		loader
		.add("all","examples/images/thePhantomNinja.json")
		.add("map","examples/images/map_Grassland.png")
		.add("spine_ninja","examples/spine/player/ninja/top/skeleton.json")
		.add("spine_ninja1","examples/spine/player/ninja/feature/skeleton.json")
		.add("spine_ninja2","examples/spine/player/ninja/fail/skeleton.json")
		.add("eye","examples/spine/eye/skeleton.json")
		.add("mainImg","examples/spine/background/skeleton.json")
		.on("progress", game.loadProgressHandler)
		.load(game.render)
	})

})