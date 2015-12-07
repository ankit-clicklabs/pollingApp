(function(j){
  j(document).ready(function(){

    j(document).on('click','.vote.btn.btn-primary.btn-block',function(event){
      var questionID=j(this).parent().data('id');
      var answerId=j(this).data('id');
      var that=this;
      j.ajax({
        method:'POST',
        url:'/votePoll',
        data:{'questionID':questionID,'answerId':answerId},
        success:function(data){
        
          j(that).find('.votes').text(data.ans);
        }
      })
    });
  });
}
(jQuery));
(function($){
  var idleTime = 0;
$(document).ready(function () {
    
    var idleInterval = setInterval(timerIncrement, 60000); // 1 minute


    $(this).mousemove(function (e) {
        idleTime = 0;
    });
    $(this).keypress(function (e) {
        idleTime = 0;
    });
});

function timerIncrement() {
    idleTime = idleTime + 1;
    if (idleTime > 5) { 
        window.location.replace('/logout');
    }
}
}(jQuery));