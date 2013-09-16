var Wallpaper = {
  wallpapersUrl: '/resources/320x480/list.json',

  init: function wallpaper_init() {
    var self = this;
    if (navigator.mozSetMessageHandler) {
      navigator.mozSetMessageHandler('activity', function handler(request) {
        var activityName = request.source.name;
        if (activityName !== 'pick')
          return;
        self.startPick(request);
      });
    }

    this.cancelButton = document.getElementById('cancel');
    this.wallpapers = document.getElementById('wallpapers');
    this.preview = document.getElementById('preview-selected-wallpaper');

    GestureDetector.HOLD_INTERVAL = 300;
    this.gd = new GestureDetector(this.wallpapers, { holdEvents: true });
    this.gd.startDetecting();

    this.generateWallpaperList();
  },

  generateWallpaperList: function wallpaper_generateWallpaperList(cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', this.wallpapersUrl, true);
    xhr.responseType = 'json';
    xhr.send(null);

    var self = this;
    xhr.onload = function successGenerateWallpaperList() {
      self.wallpapers.innerHTML = '';
      xhr.response.forEach(function(wallpaper) {
        var div = document.createElement('div');
        div.classList.add('wallpaper');
        div.style.backgroundImage = 'url(resources/320x480/' + wallpaper + ')';
        self.wallpapers.appendChild(div);
      });
      if (cb) {
        cb();
      }
    };
  },

  startPick: function wallpaper_startPick(request) {
    this.pickActivity = request;

    this.wallpapers.addEventListener('tap', this.pickWallpaper.bind(this));
    this.wallpapers.addEventListener('holdstart', this.showPreview.bind(this));
    this.wallpapers.addEventListener('holdend', this.hidePreview.bind(this));
    this.cancelButton.addEventListener('click', this.cancelPick.bind(this));
  },

  showPreview: function(e) {
    var src = this.getImageSrc(e);
    var img = this.preview.querySelector('img');

    if (src != '') {
      img.src = src;
      this.preview.classList.remove('hide');
    }
  },

  hidePreview: function() {
    this.preview.classList.add('hide');
  },

  getImageSrc: function(e) {
    var backgroundImage = e.target.style.backgroundImage;
    var src = backgroundImage.match(/url\([\"']?([^\s\"']*)[\"']?\)/)[1];
    return src;
  },

  pickWallpaper: function wallpaper_pickWallpaper(e) {
    // Identify the wallpaper
    var src = this.getImageSrc(e);

    // Ignore clicks that are not on one of the images
    if (src == '')
      return;

    if (!this.pickActivity) { return; }

    var img = new Image();
    img.src = src;
    var self = this;
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      canvas.toBlob(function(blob) {
        self.pickActivity.postResult({
          type: 'image/jpeg',
          blob: blob,
          name: src
        }, 'image/jpeg');

        self.endPick();
      }, 'image/jpeg');
    };
  },

  cancelPick: function wallpaper_cancelPick() {
    this.pickActivity.postError('cancelled');
    this.endPick();
  },

  endPick: function wallpaper_endPick() {
    this.pickActivity = null;
    this.gd.stopDetecting();
    this.cancelButton.removeEventListener('click', this.cancelPick);
    this.wallpapers.removeEventListener('tap', this.pickWallpaper);
    this.wallpapers.removeEventListener('holdstart', this.showPreview);
    this.wallpapers.removeEventListener('holdend', this.hidePreview);
  }
};

window.addEventListener('load', function pick() {
  window.removeEventListener('load', pick);
  Wallpaper.init();
});
