
        const login = function( e ){
            e.preventDefault()
            const username = document.querySelector("#username").value
            const password = document.querySelector("#password").value
            console.log(username)
            fetch( '/login', {
              method:'POST',
              body:JSON.stringify({ username:username, password:password }),
              headers: { 'Content-Type': 'application/json' }
            })
            .then( res => {
                console.log(res)
                if(res.ok === false){
                    document.getElementById('status').innerHTML = "Failed to login, incorrect"
                }
                else{
                    res.json().then( res => { 
                        console.log("User: " + res.username)
                        console.log(res.status)
                        window.location.replace("/secure")
                    })
                }
            })
        }
        
        window.onload = function(){
            const loginButton = document.querySelector("#loginButton")
            loginButton.onclick = login
        }
