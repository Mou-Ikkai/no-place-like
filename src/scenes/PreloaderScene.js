import {Scene} from 'phaser';

class PreloaderScene extends Scene {
  constructor() {
    super('preloader-scene');
  }

  preload() {
    // Called first, used to load assets
    this.load.image('logo', 'assets/images/logo.png');
    this.load.image('title-robo', 'assets/images/title-robo.png');
    this.load.image('new-game-btn', 'assets/images/new-game-btn.png');
    this.load.image('load-game-btn', 'assets/images/load-game-btn.png');
    this.load.image('title-hill1', 'assets/images/title-hill1.png');

    let loadingBar = this.add.graphics({
      fillStyle :{
        color: 0xffffff
      }
    });

    this.load.on('progress', (percent) => {
      loadingBar.fillRect(0, this.game.renderer.height / 2, this.game.renderer.width * percent, 50);
    });
  }

  create() {
    // Called after preload, used to initialize your scene
    this.scene.start('title-scene');
  }

  // update() {
  //   // Called repeatedly every frame
  // }
}

export default PreloaderScene;