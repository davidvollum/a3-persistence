
        const createUser = function(e){
            e.preventDefault()
            const newUsername = document.querySelector("#newUsername").value
            const newPassword1 = document.querySelector('#newPassword1').value
            const newPassword2 = document.querySelector('#newPassword2').value
            console.log(newUsername)
            if(newPassword1 === newPassword2){
                fetch('/makeuser',  {
                    method: 'POST',
                    body: JSON.stringify({newUsername:newUsername, newPassword:newPassword1}),
                    headers: { 'Content-Type': 'application/json' }
                })
                .then( res => res.json()
                .then( res => {
                    if (res.status === true){
                        document.getElementById('createUserStatus').innerHTML = "User " + newUsername + " was created successfully"
                        window.location.replace("/")
                    }
                    else{
                        document.getElementById('createUserStatus').innerHTML = "User " + newUsername + " already exists, please pick a new username"
                    }
                }))
            }
            else{
            document.getElementById('createUserStatus').innerHTML = "Error: passwords dont match"
        }
    }
        
        window.onload = function(){
            const createUserButton = document.querySelector('#createUserButton')
            createUserButton.onclick = createUser
        }
