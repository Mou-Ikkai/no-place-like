import {GameObjects, Input} from 'phaser';
import {ui} from '../../config';
const {Container} = GameObjects;
const {edgeWidth, nudgeThreshold} = ui;

class MCAfricaFight extends Container {
  setFlipX(flip) {
    this.flipX = flip;
    this.list.forEach((child) => {
      if (!child.isGun) {
        child.setFlipX(flip);
      }
      else {
        child.setFlipY(flip);
      }
    });
  }

  aim(rad) {
    const deg = (rad * 180 / Math.PI);
    const radius = 80;
    let emitterDegOffset = 0;
    const shoulderX = this.x + (this.boltPistol.x / 2);
    const shoulderY = this.y + (this.boltPistol.y / 2);
    let radOffset = 0;

    if (this.flipX) {
      radOffset = this.bulletEmitterOffsetLeft;
      emitterDegOffset = 92;
      this.mcArmLeft.setRotation(-rad - this.mcArmsOffsetLeft);
      this.mcArmRight.setRotation(-rad - this.mcArmsOffsetLeft);
      this.boltPistol.setRotation(-rad - this.boltPistolOffsetLeft);
      this.bulletEmitter.setAngle(-(deg + emitterDegOffset));
    }
    else {
      radOffset = this.bulletEmitterOffsetRight;
      emitterDegOffset = 82;
      this.mcArmLeft.setRotation(-rad - this.mcArmsOffsetRight);
      this.mcArmRight.setRotation(-rad - this.mcArmsOffsetRight);
      this.boltPistol.setRotation(-rad - this.boltPistolOffsetRight);
      this.bulletEmitter.setAngle(-(deg + emitterDegOffset));
    }

    const emitterX = shoulderX + (radius * Math.cos(-(rad + radOffset)));
    const emitterY = shoulderY + (radius * Math.sin(-(rad + radOffset)));
    
    this.bulletEmitter.setPosition(emitterX, emitterY);
  }

  constructor(config) {
    const bodyWidth = 60;
    const bodyHeight = 260;
    const boltPistolOffsetRight = (Math.PI / 2.4);
    const boltPistolOffsetLeft = (Math.PI / 1.85);
    const bulletEmitterOffsetRight = (Math.PI / 2.25);
    const bulletEmitterOffsetLeft = (Math.PI / 1.93);
    const mcArmsOffsetRight = (Math.PI / 1.1);
    const mcArmsOffsetLeft = (Math.PI / 0.95);

    const core = config.scene.add.sprite((bodyWidth / 2), (bodyHeight / 2), 'mc-africa-noarms');
    const mcArmLeft = config.scene.add.image((bodyWidth / 2 - 6), 80, 'mc-africa-gun-arm-left');
    const mcArmRight = config.scene.add.image((bodyWidth / 2 - 6), 80, 'mc-africa-gun-arm-right');
    const boltPistol = config.scene.add.sprite((bodyWidth / 2 - 6), 80, 'bolt-pistol2');

    boltPistol.setScale(0.18);
    boltPistol.setOrigin(-0.8, 0.5);
    boltPistol.isGun = true;
    mcArmLeft.setOrigin(0.5, 0.15);
    mcArmRight.setOrigin(0.5, 0.15);

    super(config.scene, config.x, config.y, [
      mcArmLeft,
      core,
      boltPistol,
      mcArmRight
    ]);

    config.scene.add.container(this);

    // Add self to scene's physics
    config.scene.physics.world.enable(this);
    config.scene.add.existing(this);

    // Config
    this.speed = 200;
    this.jumpHeight = 450;

    // Variables
    this.persistentVelocityX = 0;
    this.pointer1DownY = null;

    // Setup physics properties
    this.body.setBounce(0);
    this.body.setSize(bodyWidth, bodyHeight);
    this.setScale(0.5);

    // Setup variables for use in update()
    this.core = core;
    this.mcArmLeft = mcArmLeft;
    this.mcArmRight = mcArmRight;
    this.boltPistol = boltPistol;
    this.bodyWidth = bodyWidth;
    this.bodyHeight = bodyHeight;
    this.boltPistolOffsetRight = boltPistolOffsetRight;
    this.boltPistolOffsetLeft = boltPistolOffsetLeft;
    this.bulletEmitterOffsetRight = bulletEmitterOffsetRight;
    this.bulletEmitterOffsetLeft = bulletEmitterOffsetLeft;
    this.mcArmsOffsetRight = mcArmsOffsetRight;
    this.mcArmsOffsetLeft = mcArmsOffsetLeft;
    // this.bullets = bullets;
    this.lastPointerTouch = false;
    this.touchRad = (Math.PI / 2);
    this.flipX = false;
    this.maxHP = 5;
    this.hp = this.maxHP;
    this.bulletEmitter = config.bulletEmitter;

    this.shootLock = true; // Init the character with shooting disabled
    // this.hpBar = null;
    // this.hpBarStyle = null;

    // // Add our healthbar to the scene
    // if (config.showHP) {
    //   this.hpBarStyle = config.scene.add.graphics({
    //     fillStyle :{
    //       color: 0xffffff
    //     }
    //   });
    //   const maxHPBar = config.scene.add.graphics({
    //     strokeStyle: {
    //       color: 0xffffff
    //     },
    //     fillStyle: {
    //       color: 'rgba(255, 255, 255, 0.1)'
    //     }
    //   });
    //   this.hpBarStyle.setScrollFactor(0);
    //   maxHPBar.setScrollFactor(0);
    //   maxHPBar.fillRect(25, 25, window.innerWidth - 25, 50);
    //   this.updateHPBar();
    // }

    // Init arrow keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.WSAD = {
      W: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.W),
      S: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.S),
      A: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.A),
      D: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.D)
    };
  }

  // updateHPBar() {
  //   this.hpBar = this.hpBarStyle.fillRect(25, 25, (window.innerWidth - 25) * (this.hp / this.maxHP), 50);
  // }

  update() {
    const touchingGround = this.body.blocked.down;
    const touchingWall = (this.body.blocked.left || this.body.blocked.right);
    const {pointer1, pointer2} = this.scene.input;
    const {mousePointer} = this.scene.input;
    const {left, right, up} = this.cursors;
    const {W, D, A} = this.WSAD;
    const bothPointersDown = (pointer1.isDown && pointer2.isDown);

    if (pointer1.isDown) {
      this.lastPointerTouch = true;
    }
    else if (mousePointer.isDown) {
      this.lastPointerTouch = false;
    }

    if (this.shootLock && touchingGround) {
      this.shootLock = false;
    }

    /* COMPUTER CONTROLS
    ------------------------------------------- */
    if (touchingGround) {
      // Player left-right control logic
      if (left.isDown || A.isDown) {
        this.body.setVelocityX(-this.speed);
      }
      else if (right.isDown || D.isDown) {
        this.body.setVelocityX(this.speed);
      }
      else {
        this.body.setVelocityX(0);
      }

      // Player jump logic
      if (up.isDown || W.isDown) {
        this.body.setVelocityY(-this.jumpHeight);
      }

      // Persist X velocity
      this.persistentVelocityX = this.body.velocity.x;
    }

    /* TOUCH CONTROLS
    ------------------------------------------- */
    if (touchingGround && pointer1.isDown) {
      // Player left-right control logic
      const touchingLeftEdge = (pointer1.position.x <= edgeWidth);
      const touchingRightEdge = (pointer1.position.x >= window.innerWidth - edgeWidth);

      if (touchingLeftEdge) {
        this.body.setVelocityX(-this.speed);
      }
      else if (touchingRightEdge) {
        this.body.setVelocityX(this.speed);
      }
      else {
        this.body.setVelocityX(0);
      }

      // Player jump logic
      const nudgeUp = ((this.pointer1DownY !== null) && (this.pointer1DownY - pointer1.position.y) > nudgeThreshold);

      if (nudgeUp) {
        this.body.setVelocityY(-this.jumpHeight);
      }

      // Persist X velocity
      this.persistentVelocityX = this.body.velocity.x;
    }

    // Aim gun at the mouse
    const spriteCenterX = ((window.innerWidth / 2) + (this.bodyWidth / 4));
    const spriteCenterY = ((window.innerHeight / 2) + (this.bodyHeight / 4));

    // Flip character to face mouse
    if (this.lastPointerTouch) {
      // Aiming
      const dX = (spriteCenterX - pointer1.x);
      const dY = (spriteCenterY - pointer1.y);
      const rad = Math.atan2(dX, dY);
      this.aim(rad);

      // Handle touch point n shoot controls
      if (pointer1.x < spriteCenterX) {
        this.setFlipX(true);
      }
      else {
        this.setFlipX(false);
      }

      if (bothPointersDown && !this.shootLock) {
        this.bulletEmitter.start();
      }
      else {
        this.bulletEmitter.stop();
      }
    }
    else {
      // Handle desktop point n shoot controls
      const dX = (spriteCenterX - mousePointer.x);
      const dY = (spriteCenterY - mousePointer.y);
      const rad = Math.atan2(dX, dY);
      this.aim(rad);

      if (mousePointer.x < spriteCenterX) {
        this.setFlipX(true);
      }
      else {
        this.setFlipX(false);
      }

      // Gun projectile logic (dummy)
      if (mousePointer.isDown && !this.shootLock) {
        this.bulletEmitter.start();
      }
      else {
        this.bulletEmitter.stop();
      }
    }
    
    // Reduce X velocity when sliding along wall
    if (touchingWall) {
      this.persistentVelocityX /= 1.1;
    }

    // Persist MC forward momentum when jumping up (like when you hit a wall)
    if (this.body.velocity.y < 0) {
      this.body.setVelocityX(this.persistentVelocityX);
    }

    /* ANIMATION LOGIC
    ------------------------------------------- */
    if (this.body.velocity.y < 0) {
      this.core.anims.play('up-noarms', true);
    }
    else if (this.body.velocity.y > 0) {
      this.core.anims.play('down-noarms', true);
    }
    else if (this.body.velocity.x !== 0) {
      this.core.anims.play('run-noarms', true);
    }
    else {
      this.core.anims.play('idle-noarms', true);
    }

    this.boltPistol.anims.play('bolt-pistol-idle', true);

    // Update HP bar if it's visible
    // if (this.hpBar !== null) {
    //   this.updateHPBar();
    // }

    // Death conditions
    const fellTooLow = (this.y > 5000);
    const ranOutOfHP = (this.hp <= 0);

    if (fellTooLow || ranOutOfHP) {
      this.scene.scene.restart(); // lol scene.scene
    }

    // Update our reference to the pointer's start Y
    if (pointer1.isDown) {
      this.pointer1DownY = pointer1.position.y;
    }
    else {
      this.pointer1DownY = null;
    }
  }
  
}

export default MCAfricaFight;