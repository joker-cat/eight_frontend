// 請代入自己的網址路徑
const api_path = "joooker";
const token = "ijtQ77NlLqaCP2DIJnZj2U1cSX63";
const productWrapDOM = document.querySelector('.productWrap');
const shoppingCartTable = document.querySelector('.shoppingCart-table');
const orderInfoBtn = document.querySelector('.orderInfo-btn');
const productSelectFilter = document.querySelector('.productSelect');
let products = [];
let cart = 0;


// 取得產品列表
function getProductList() {
    return new Promise((res, rej) => {
        axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).
            then(function (response) {
                if (response.status !== 200) return;
                products = response.data.products;
                let strTemplate = '';
                for (const i of response.data.products) {
                    strTemplate += `
                <li class="productCard" data-category=${i.category}>
                    <h4 class="productType">新品</h4>
                    <img src="${i.images}"
                        alt="">
                    <a class="addCardBtn" data-id="${i.id}">加入購物車</a>
                    <h3>Antony 雙人床架／雙人加大${i.title}</h3>
                    <del class="originPrice">NT$${i.origin_price}</del>
                    <p class="nowPrice">NT$${i.price}</p>
                </li>
                `
                }
                productWrapDOM.innerHTML = strTemplate;
                res(true);
            })
            .catch(function (error) {
                console.log(error.response.data)
            })
    })

}

//篩選產品
productSelectFilter.addEventListener('change', (e) => {
    if (e.target.value === "全部") {
        getProductList();
        return;
    }
    const alreadyFilter = products.filter(eve => eve.category === e.target.value);
    let strTemplate = '';
    console.log(alreadyFilter);
    for (const i of alreadyFilter) {
        strTemplate += `
    <li class="productCard" data-category=${i.category}>
        <h4 class="productType">新品</h4>
        <img src="${i.images}"
            alt="">
        <a class="addCardBtn" data-id="${i.id}">加入購物車</a>
        <h3>Antony 雙人床架／雙人加大${i.title}</h3>
        <del class="originPrice">NT$${i.origin_price}</del>
        <p class="nowPrice">NT$${i.price}</p>
    </li>
    `
    }
    productWrapDOM.innerHTML = strTemplate;
    addCart();
})

// 加入購物車
function addCartItem(eventId) {
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
        data: {
            "productId": eventId,
            "quantity": 1
        }
    }).
        then((response) => { if (response.status === 200) getCartList(); })

}

// 綁定加入購物車按鈕
function addCart() {
    const addCardBtnDOM = document.querySelectorAll('.addCardBtn');
    addCardBtnDOM.forEach(btn => btn.addEventListener('click', (e) => addCartItem(e.target.getAttribute("data-id"))));
    return true;
}

// 取得購物車列表
function getCartList() {
    return new Promise((res, rej) => {
        axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
            then(function (response) {
                if (response.status !== 200) return;
                let strTemplate = `
                <tr>
                    <th width="40%">品項</th>
                    <th width="15%">單價</th>
                    <th width="15%">數量</th>
                    <th width="15%">金額</th>
                    <th width="15%"></th>
                </tr>
                `;
                for (const i of response.data.carts) {
                    strTemplate += `
                    <tr>
                        <td>
                            <div class="cardItem-title">
                                <img src="${i.product.images}" alt="">
                                <p>${i.product.title}</p>
                            </div>
                        </td>
                        <td>NT$${i.product.price}</td>
                        <td>1</td>
                        <td>NT$${i.product.price}</td>
                        <td class="discardBtn">
                            <a class="material-icons" onclick=deleteCartItem("${i.id}")>
                                clear
                            </a>
                        </td>
                    </tr>
                `
                }
                strTemplate += ` 
                <tr>
                    <td>
                        <a class="discardAllBtn" onclick=deleteAllCartList()>刪除所有品項</a>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <p>總金額</p>
                    </td>
                    <td>NT$${response.data.finalTotal}</td>
                </tr>
                `
                shoppingCartTable.innerHTML = strTemplate;
                cart = response.data.carts.length;
                res(true);
            })
    })
}

// 刪除購物車內特定產品
function deleteCartItem(cartId) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`).
        then((response) => { if (response.status === 200) getCartList() })
}

// 清除購物車內全部產品
function deleteAllCartList() {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
        then(function (response) { if (response.status === 200) getCartList() })
}

// 送出購買訂單
orderInfoBtn.addEventListener('click', createOrder);
function createOrder(e) {
    e.preventDefault();
    if (cart == 0) return;
    const form = document.querySelector('.orderInfo-form');
    const user = {};
    const formData = new FormData(form);
    for (let pair of formData.entries()) {
        user[pair[0]] = pair[1];
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
        {
            "data": {
                "user": user
            }
        })
        .then(function (response) {
            console.log(response);
            if (response.status === 200) {
                shoppingCartTable.innerHTML = '';
                form.reset();
            }
        })
        .catch(function (error) {
            console.log(error.response.data.message.join(' '));
            alert(error.response.data.message.join(' '));
        })
}

// 初始化
async function init() {
    const get = await getProductList();
    const set = await addCart();
    const getList = await getCartList();
    (get === true && set === true && getList === true) ? console.log('初始化成功') : console.log('初始化失敗');
}

init();