window.onload = function() {
    var intro1Element = document.querySelector('#Sintro1');
    var intro2Element = document.querySelector('#Sintro2');
    var intro3Element = document.querySelector('#Sintro3');
    var ss1 = document.querySelector('#scrollTointro1');
    var ss2 = document.querySelector('#scrollTointro2');
    var ss3 = document.querySelector('#scrollTointro3');
    var imageElement1 = document.getElementById('titTxt-img1');
    var imageElement2 = document.getElementById('titTxt-img2');
    var imageElement3 = document.getElementById('titTxt-img3');
    window.addEventListener('scroll', function() {
      var scrollPosition = window.scrollY;
      if (scrollPosition >= intro1Element.offsetTop && scrollPosition < intro1Element.offsetTop+intro1Element.offsetHeight) {
        ss1.style.color = '#2DCFBC';
        ss2.style.color = 'rgb(100, 100, 100)';
        ss3.style.color = 'rgb(100, 100, 100)';
        imageElement1.src = 'pictures/link2.png';
        imageElement2.src = 'pictures/step1.png';
        imageElement3.src = 'pictures/about1.png';
      }
      else if (scrollPosition >= intro2Element.offsetTop && scrollPosition <  intro2Element.offsetTop+intro2Element.offsetHeight) {
        ss2.style.color = '#2DCFBC';
        ss1.style.color = 'rgb(100, 100, 100)';
        ss3.style.color = 'rgb(100, 100, 100)';
        imageElement1.src = 'pictures/link1.png';
        imageElement2.src = 'pictures/step2.png';
        imageElement3.src = 'pictures/about1.png';
      }
      else if (scrollPosition >= intro3Element.offsetTop) {
        ss3.style.color = '#2DCFBC';
        ss2.style.color = 'rgb(100, 100, 100)';
        ss1.style.color = 'rgb(100, 100, 100)';
        imageElement1.src = 'pictures/link1.png';
        imageElement2.src = 'pictures/step1.png';
        imageElement3.src = 'pictures/about2.png';
      }
    });
  };
  
function scrollOnClick(click_id) {
    switch (click_id) {
        case 's1':
            document.querySelector('#Sintro1').scrollIntoView({behavior: 'smooth'});
            break;
        case 's2':
            document.querySelector('#Sintro2').scrollIntoView({behavior: 'smooth'});
            break;
        case 's3':
            document.querySelector('#Sintro3').scrollIntoView({behavior: 'smooth'});
            break;
    }
}