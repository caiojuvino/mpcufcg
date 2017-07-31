$("form #email").keypress(function (e) {
    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
        $('#password').focus();
        return false;
    } else {
        return true;
    }
});

$(document).ready(function(){
    var email,pass;
    $("#submit").click(function(){
        email=$("#email").val();
        pass=$("#password").val();
        console.log(email);
		/*
        * Perform some validation here.
        */
        $.post("http://localhost:3000/login",{email:email,pass:pass},function(data){        
            if (data==='done') {
                window.location.href="/admin";
            } else {
				alert("Nome de usuário ou senha incorretos!");
			}
        });
    });
});