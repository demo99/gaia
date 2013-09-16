requireApp('wallpaper/js/pick.js');
require('/shared/js/gesture_detector.js');
requireApp('system/test/unit/mock_gesture_detector.js');

suite('wallpaper/pick', function() {

  var fakeWallpapersContainer;
  var realGestureDetector;

  setup(function() {
    realGestureDetector = GestureDetector;
    GestureDetector = MockGestureDetector;

    fakeWallpapersContainer = document.createElement('div');
    fakeWallpapersContainer.id = 'wallpapers';
    document.body.appendChild(fakeWallpapersContainer);
  });

  teardown(function() {
    GestureDetector = realGestureDetector;

    fakeWallpapersContainer.parentNode.removeChild(fakeWallpapersContainer);
  });

  test('generateWallpaperList', function(done) {
    var prefix =
    Wallpaper.wallpapersUrl = '/test/unit/list_test.json';
    Wallpaper.init();
    Wallpaper.generateWallpaperList(function() {
      done(function() {
        var wallpapers = document.getElementById('wallpapers');
        assert.equal(2, wallpapers.children.length);
        assert.equal('url("resources/320x480/test_1.png")',
          wallpapers.children[0].style.backgroundImage);
        assert.equal('url("resources/320x480/test_2.png")',
          wallpapers.children[1].style.backgroundImage);
      });
    });
  });
});
