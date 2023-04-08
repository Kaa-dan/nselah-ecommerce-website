function loginEmail(){
    let emailId=document.getElementById("Email").value;
     if(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(emailId)==false){
       document.getElementById("errEmail").innerHTML="Please enter valid email ";
       return false;
     }else{
       document.getElementById("errEmail").innerHTML="";
       return true;
     }

   }

  //  function loginPassword(){
  //   let password=document.getElementById("Passwordss").value;
  //   if(password.length <6){
  //     document.getElementById("errPassword").innerHTML="please enter valid password";
  //     return false
  
  //   }else{
  //     document.getElementById("errPassword").innerHTML="";
  //     return true;
  //   }
  // }



  function loginPassword(){
    let password=document.getElementById("Password").value;
    if(password.length <6){
      document.getElementById("errorPassword").innerHTML="password must be greater than 6 letters";
      return false
 
    }else{
      document.getElementById("errorPassword").innerHTML="";
      return true;
    }
  }


  function login(){
    if(loginEmail()&&loginPassword()){
      return true
    }else{
      return false
    }
  }