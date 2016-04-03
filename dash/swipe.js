window.addEventListener('load', function() {
  var _swipestart = {};
  var _swipeend = {};
  var _swipetracking = false;
  var _swipethresholdTime = 500;
  var _swipethresholdDistance = 100;
  var o = document.getElementsByTagName('body')[0];

  var elemToToggle = document.getElementById("toggleFullscreenBtnRow")




  var gestureStart = function(e) {
    if (e.touches.length>1) {
      _swipetracking = false;
      return;
    } else {
      _swipetracking = true;
      /* Hack - would normally use e.timeStamp but it's whack in Fx/Android */
      _swipestart.t = new Date().getTime();
      _swipestart.x = e.targetTouches[0].clientX;
      _swipestart.y = e.targetTouches[0].clientY;
    }
    console.dir(_swipestart);
  };
  var gestureMove = function(e) {
    if (_swipetracking) {
      e.preventDefault();
      _swipeend.x = e.targetTouches[0].clientX;
      _swipeend.y = e.targetTouches[0].clientY;
    }
  }
  var gestureEnd = function(e) {
    _swipetracking = false;
    var now = new Date().getTime();
    var deltaTime = now - _swipestart.t;
    var deltaX = _swipeend.x - _swipestart.x;
    var deltaY = _swipeend.y - _swipestart.y;
    /* work out what the movement was */
    if (deltaTime > _swipethresholdTime) {
      /* gesture too slow */
      return;
    } else {
      if ((deltaX > _swipethresholdDistance)&&(Math.abs(deltaY) < _swipethresholdDistance)) {
        //o.innerHTML = 'swipe right';
        console.log('swipe right');
      } else if ((-deltaX > _swipethresholdDistance)&&(Math.abs(deltaY) < _swipethresholdDistance)) {
        //o.innerHTML = 'swipe left';
        console.log('swipe left');
      } else if ((deltaY > _swipethresholdDistance)&&(Math.abs(deltaX) < _swipethresholdDistance)) {
        //o.innerHTML = 'swipe down';
        elemToToggle.classList.add("visible");
        console.log('swipe down');
      } else if ((-deltaY > _swipethresholdDistance)&&(Math.abs(deltaX) < _swipethresholdDistance)) {
        //o.innerHTML = 'swipe up';
        console.log('swipe up');
        elemToToggle.classList.remove("visible");
      } else {
        //o.innerHTML = '';
      }
    }
  }

  o.addEventListener('touchstart', gestureStart, false);
  o.addEventListener('touchmove', gestureMove, false);
  o.addEventListener('touchend', gestureEnd, false);

}, false);

