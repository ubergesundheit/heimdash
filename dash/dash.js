[].slice.call(document.getElementsByClassName("sparkline")).forEach(function(elem) {
  var s = new Sparkline2(elem);
  s.draw([1,3,5,2,1,6,7]);
});
