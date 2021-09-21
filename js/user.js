let logout = () => {
    firebase.auth().signOut()
        .then(() => {
            window.location = "login.html"
        })
}

let getUID = () => {
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                resolve(user.uid)
            }
        })
    })
}

let getUser = async () => {
    let uid = await getUID()
    let username = document.getElementById('username')
    let email = document.getElementById('email')
    firebase.database().ref(`user/${uid}`).once('value', (data) => {
        console.log(data.val())
        username.innerHTML = data.val().username
        email.innerHTML = data.val().email
    })
}



let getRestaurants = () => {
    let resList = document.getElementById('resList')
    firebase.database().ref(`restaurant`).on('child_added', (data) => {
        console.log(data.val())
        resList.innerHTML += `
        <div class="card mb-3">
                        <div class="row no-gutters">
                            <div class="col-md-4">
                                <img width="300"
                                    src="${data.val().profile}"
                                    alt="...">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">${data.val().username}</h5>
                                    <h4 class="card-title">${data.val().email}</h4>
                                    <p class="card-text">This is a wider card with supporting text below as a natural
                                        lead-in to additional content. This content is a little bit longer.</p>
                                    <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
                                   <a class="remove-line" href="dishes.html#${data.key}"> <button class="theme_background my-btn">View Dishes</button></a>
                                </div>
                            </div>
                        </div>
                    </div>   `
    })
}

let getRestaurant = () => {
    let uid = window.location.hash.slice(1);
    let username = document.getElementById('username')
    firebase.database().ref(`restaurant/${uid}`).once('value', (data) => {
        username.innerHTML = data.val().username + " Dishes"
    })
    getDishes()
}

let getDishes = () => {
    let uid = window.location.hash.slice(1);
    let dishesList = document.getElementById("dishesList")
    firebase.database().ref(`products/${uid}`).on('child_added', (data) => {
        console.log(data.val())
        dishesList.innerHTML += `
        <div class="card dish-card" style="width: 18rem;">
                        <img src="${data.val().image}">
                        <div class="card-body">
                           <h3>${data.val().name}</h3>
                           <h6>Rs: ${data.val().price} /-</h6>
                           <button style="width: 100%;" class="mt-20 theme_background my-btn" onclick="ordernow('${data.val().image}','${data.val().name}','${data.val().price}','${data.key}')">Order now</button>
                           <span class="dish-category">${data.val().category}</span>
                        </div>
                    </div>
        `
    })
}

let ordernow = async (image, name, price, key) => {
    let uid = window.location.hash.slice(1);
    let customerUID = await getUID();
    let order = {
        image,
        name,
        price,
        key,
        status: 'pending',
        uid,
        customerUID
    }
    firebase.database().ref(`orders/${uid}`).push(order)
        .then(() => {
            swal("Congratulation!", "Your order has been places succesfuly!", "success");
        })
}