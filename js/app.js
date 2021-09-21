let uploadFiles = (file) => {
    return new Promise((resolve, reject) => {
        let storageRef = firebase.storage().ref(`myfolder/todayImages/${file.name}`);
        let progress1 = document.getElementById("progress");
        let bar = document.getElementById("bar");
        progress1.style.display = "block"
        let uploading = storageRef.put(file)
        uploading.on('state_changed',
            (snapshot) => {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                bar.style.width = Math.round(progress.toFixed()) + "%";
                bar.innerHTML = Math.round(progress.toFixed()) + "%";
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED:
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING:
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                reject(error)
            },
            () => {
                uploading.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    resolve(downloadURL)
                });
            }
        );
    })
}





let register = async () => {
    let username = document.getElementById("username");
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let profile = document.getElementById("profile");
    let userType = document.getElementById("userType");
    let loader = document.getElementById('loader');
    let loaderText = document.getElementById('loaderText');
    let image = await uploadFiles(profile.files[0]);
    loaderText.style.display = "none";
    loader.style.display = "block"
    firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
        .then((res) => {
            firebase.database().ref(`${userType.value}/${res.user.uid}`).set({
                username: username.value,
                email: email.value,
                password: password.value,
                profile: image,
                userType: userType.value,
            })
                .then(() => {
                    let succesDiv = document.getElementById('succesDiv');
                    succesDiv.innerHTML = "User register succesfully";
                    succesDiv.style.display = 'block'
                    username.value = "";
                    email.value = "";
                    password.value = ""
                    errorDiv.style.display = "none"
                    loaderText.style.display = "block";
                    loader.style.display = "none"
                    setTimeout(() => {
                        window.location = "pages/login.html"
                    }, 1000)
                })
        })
        .catch((err) => {
            let errorDiv = document.getElementById("errorDiv");
            errorDiv.innerHTML = err.message;
            errorDiv.style.display = "block"
            loaderText.style.display = "block";
            loader.style.display = "none"

        })
}


let login = () => {
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let loader = document.getElementById('loader');
    let loaderText = document.getElementById('loaderText');
    loaderText.style.display = "none";
    loader.style.display = "block"
    firebase.auth().signInWithEmailAndPassword(email.value, password.value)
        .then((res) => {
            console.log(res.user.uid)
            firebase.database().ref(`restaurant/${res.user.uid}`).once('value', (data) => {
                let succesDiv = document.getElementById('succesDiv');
                succesDiv.innerHTML = "User login succesfully";
                succesDiv.style.display = 'block'
                email.value = "";
                password.value = ""
                errorDiv.style.display = "none"
                loaderText.style.display = "block";
                loader.style.display = "none"
                if (data.val()) {
                    window.location = "dashboard.html"
                }else{
                    window.location = "home.html"
                }
            })
        })
        .catch((err) => {
            let errorDiv = document.getElementById("errorDiv");
            errorDiv.innerHTML = err.message;
            errorDiv.style.display = "block"
            loaderText.style.display = "block";
            loader.style.display = "none"
        })

}




