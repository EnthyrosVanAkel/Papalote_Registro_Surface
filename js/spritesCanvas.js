/** @license
 * Sprite Canvas plugin
 *
 * Author: Diego Montesinos
 * Version: 0.0.1
 */
(function (window, document, exportName) {
  'use strict';

  function SpriteCanvas (options) {
    var that = this;
    var multCanvas = false;

    // SpriteSheet
    if (!options.spriteSheet) {
      throw new Error('spriteSheet is required!');
    }

    function onLoadSheet () {

      // Dimensions
      that.width  = options.width;
      that.height = options.height;

      that.nFrames = Math.floor(that.spriteSheet.width / that.width);
      that.frameIndex = 0;

      // Canvas
      if (options.canvas) {
        that.canvas = options.canvas;
        multCanvas = Object.prototype.toString.call(options.canvas) === '[object Array]' ||
                     Object.prototype.toString.call(options.canvas) === '[object NodeList]';
      } else {
        that.canvas = document.createElement('canvas');
      }

      // Size and context
      if (multCanvas) {
        that.context = [];
        for (var i = 0; i < that.canvas.length; i++) {
          that.canvas[i].width  = options.width;
          that.canvas[i].height = options.height;
          that.context.push(that.canvas[i].getContext('2d'));
        }
      } else {
        that.canvas.width  = options.width;
        that.canvas.height = options.height;
        that.context = that.canvas.getContext('2d');
      }
    }

    if (typeof options.spriteSheet === 'string') {
      this.spriteSheet = new Image();
      this.spriteSheet.onload = onLoadSheet;
      this.spriteSheet.src = options.spriteSheet;
    } else {
      this.spriteSheet = options.spriteSheet;
      onLoadSheet();
    }

    // Animation
    var isPlaying = false;
    if (options.fps) {
      this.fps = options.fps;
    } else {
      this.fps = 60;
    }
    var now, then, interval, delta;

    function render () {
      var i = 0;
      if (multCanvas) {
        for (i = 0; i < that.context.length; i++) {
          that.context[i].clearRect(0, 0, that.width, that.height);
        }
      } else {
        that.context.clearRect(0, 0, that.width, that.height);
      }

      var x = that.frameIndex * that.width;
      if (multCanvas) {
        for (i = 0; i < that.context.length; i++) {
          that.context[i].drawImage(that.spriteSheet,
            x, 0,
            that.width, that.height,
            0, 0,
            that.width, that.height
          );
        }
      } else {
        that.context.drawImage(that.spriteSheet,
          x, 0,
          that.width, that.height,
          0, 0,
          that.width, that.height
        );
      }
    }

    function update () {
      if (that.fps < 0) {
        that.frameIndex = that.frameIndex === 0 ? that.nFrames : that.frameIndex - 1;
      } else {
        that.frameIndex = (that.frameIndex + 1) % that.nFrames;
      }

      if (options.afterUpdate) {
        options.afterUpdate.call(that, that.frameIndex);
      }
    }

    function loop () {
      if (isPlaying) {
        requestAnimationFrame(loop);

        now = Date.now();
        delta = now - then;

        // Frame
        if (delta > interval) {
          then = now - (delta % interval);

          // Update and Render
          update();
          render();
        }
      }
    }

    this.play = function () {
      isPlaying = true;

      // Time data
      then = Date.now();
      interval = 1000 / Math.abs(this.fps);

      loop();
    };

    this.stop = function () {
      isPlaying = false;
    };
  }
  // Module export
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return SpriteCanvas;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpriteCanvas;
  } else {
    window[exportName] = SpriteCanvas;
  }
})(window, document, 'SpriteCanvas');