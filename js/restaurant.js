let checkAuth = () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            firebase.database().ref(`restaurant/${user.uid}`).once('value', (data) => {
                if (data.val()) {
                } else {
                    window.location = "profile.html"
                }
            })
        } else {
            window.location = "login.html"
        }
    })
}

let uploadFiles = (file) => {
    return new Promise((resolve, reject) => {
        let storageRef = firebase.storage().ref(`myfolder/todayImages/${file.name}`);
        let uploading = storageRef.put(file)
        uploading.on('state_changed',
            (snapshot) => {
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

let addItem = async () => {
    let itemName = document.getElementById("itemName")
    let itemPrice = document.getElementById("itemPrice")
    let itemCategory = document.getElementById("itemCategory")
    let dType = document.getElementById("dType")
    let iImage = document.getElementById("iImage")
    let closeBtn = document.getElementById("closeBtn")
    let uid = await getUID()
    let product = {
        name: itemName.value,
        price: itemPrice.value,
        category: itemCategory.value,
        dType: dType.value,
        image: await uploadFiles(iImage.files[0]),
        uid: uid
    }
    firebase.database().ref(`products/${uid}`).push(product)
        .then(() => {
            closeBtn.click()
        })
}

let getProducts = async () => {
    let uid = await getUID()
    let count = 1;
    let allProducts = document.getElementById('allProducts')
    firebase.database().ref(`products/${uid}`).on('child_added', (data) => {
        allProducts.innerHTML += `
        <tr>
        <th scope="row">${count}</th>
        <td>
            <img class="dish-image" width="50"
                src="${data.val().image}" />
        </td>
        <td>${data.val().name}</td>
        <td>Rs ${data.val().price}</td>
        <td>${data.val().category}</td>
    </tr>
        `
        count++
    })
}




let getOrders = async (status) => {
    console.log(status)
    let uid = await getUID();
    let orderList = document.getElementById('order-list')
    firebase.database().ref(`orders/${uid}`).on('child_added', (data) => {
        firebase.database().ref(`user/${data.val().customerUID}`).once('value', (snapshot) => {
            let orderDetail = { customer: { ...snapshot.val() }, order: { ...data.val() } }
            if (status === orderDetail.order.status) {

                orderList.innerHTML += `
                <tr>
                <th scope="row">1</th>
                <td>${orderDetail.customer.username}</td>
                <td>${orderDetail.customer.email}</td>
                <td><span class="${orderDetail.order.status === 'pending' ? 'pending-status': orderDetail.order.status === "accepted" ? 'status-accepted' : "status-delivered"}">${orderDetail.order.status}</span></td>
                <td>
                <button data-toggle="modal" data-target="#exampleModal"
                class="small-btn">View</button>
                <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog"
                aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Order Details
                </h5>
                <button type="button" class="close" data-dismiss="modal"
                aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="modal-body">
                <table class="table">
                <tr>
                <th scope="col">#</th>
                <th scope="col">Image</th>
                <th scope="col">Name</th>
                <th scope="col">Price</th>
                <th scope="col">Qty</th>
                </tr>
                <tr>
                <td>1</td>
                <td>
                <img class="dish-image" width="50" src="${orderDetail.order.image}" />
                </td>
                <td>${orderDetail.order.name}</td>
                <td>Rs ${orderDetail.order.price}</td>
                <td>1</td>
                </tr>
                </table>
                </div>
                <div class="modal-footer">
                <button type="button" class="mybutton"
                data-dismiss="modal">Close</button>
                <button type="button" class="mybutton">Accecpt Order</button>
                </div>
                </div>
                </div>
                </div>
                </td>
                </tr>
                `
            }
        })
    })
}
