const validateName=()=>{
    let name = document.getElementById('userName').value;

    if(name==""){
        document.getElementById('errorName').innerHTML="please enter a name ";
        return false;
    }else{
        document.getElementById('errorName').innerHTML="";
        return true;
    }
}

function validateEmail(){
    let emailId=document.getElementById("email").value;
     if(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(emailId)==false){
       document.getElementById("errorEmail").innerHTML="Please enter valid email ";
       return false;
     }else{
       document.getElementById("errorEmail").innerHTML="";
       return true;
     }
   }

   function validatePhone(){
    let number=document.getElementById("phone").value;
     if(/^[0-9]+$/.test(number)==false){
      document.getElementById("errorPhone").innerHTML="please enter a valid number";
      return false
     }
    else if(number.length != 10){
      document.getElementById("errorPhone").innerHTML="please enter 10 digits";
      return false
       }else{
        document.getElementById("errorPhone").innerHTML="";
          return true
       }
  }

  function validatePassword(){
    let password=document.getElementById("password").value;
    if(password.length <6){
      document.getElementById("errorPassword").innerHTML="password must be greater than 6 letters";
      return false
 
    }else{
      document.getElementById("errorPassword").innerHTML="";
      return true;
    }
  }
 

  function confirmPassword(){
    let password2=document.getElementById("password2").value;
    // console.log(password2)
    let password=document.getElementById('password').value;
     if(password2 != password || password2==""){
      document.getElementById("errorPassword2").innerHTML="Password not match";
      return false
       }else{
        document.getElementById("errorPassword2").innerHTML="";
        return true
       }
      }


  
      function validateSignup(){
        if(validateEmail()&&validateName()&&validatePassword()&&validatePhone()&&confirmPassword()){
          return true
        }else{
          return false
        }
      }