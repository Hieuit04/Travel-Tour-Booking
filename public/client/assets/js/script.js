// Khởi tạo giỏ hàng
let loggedIn = document.body.dataset.loggedIn === "1";

const cartStore = {
  getLocal() {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
      return [];
    }
  },
  setLocal(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  },
  // Gọi API; nếu 401 thì chuyển sang chế độ localStorage
  async callApi(url, method, body) {
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 401) {
      loggedIn = false;
      notyf.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      return null;
    }
    return res.json();
  },
  // Thêm mới hoặc cập nhật một phần item
  async upsert(item) {
    if (loggedIn) {
      const data = await this.callApi('/cart/add', 'POST', item);
      if (data) return data;
    }
    const cart = this.getLocal();
    const existItem = cart.find(i => i.tourId === item.tourId);
    if (existItem) {
      Object.assign(existItem, item);
    } else {
      cart.unshift({ checked: true, ...item });
    }
    this.setLocal(cart);
    return { code: "success", existed: !!existItem };
  },
  async remove(tourId) {
    if (loggedIn) {
      const data = await this.callApi(`/cart/item/${tourId}`, 'DELETE');
      if (data) return data;
    }
    this.setLocal(this.getLocal().filter(i => i.tourId !== tourId));
    return { code: "success" };
  },
  async count() {
    if (loggedIn) {
      const data = await this.callApi('/cart/count', 'GET');
      if (data && data.code === "success") return data.count;
    }
    return this.getLocal().length;
  },
};

// Gộp giỏ hàng localStorage vào DB khi đã đăng nhập (idempotent, chạy mỗi lần tải trang)
const mergeLocalCart = async () => {
  if (!loggedIn) return;
  const local = cartStore.getLocal();
  if (local.length === 0) return;
  const data = await cartStore.callApi('/cart/merge', 'POST', local);
  if (data && data.code === "success") {
    cartStore.setLocal([]);
  }
};
// end Khởi tạo giỏ hàng

// Khởi tạo AOS\
AOS.init();
// Hết khởi tạo AOS

// Button menu
const buttonMenu = document.querySelector('.header .inner-button-menu');

if (buttonMenu) {
  const menu = document.querySelector('.header .inner-menu');
  const menuOverlay = document.querySelector('.header .inner-menu-overlay');
  buttonMenu.addEventListener('click', () => {
    menu.classList.add('show');
    menuOverlay.classList.add('show');
  });
  menuOverlay.addEventListener('click', () => {
    menu.classList.remove('show');
    menuOverlay.classList.remove('show');
  });
  const listLi = document.querySelectorAll('.header .inner-menu>ul>li');
  listLi.forEach((li) => {
    const buttonDown = li.querySelector('i');
    if (buttonDown) {
      buttonDown.addEventListener('click', () => {
        if (li.classList.contains('show')) {
          li.classList.remove('show');
          buttonDown.classList.remove('fa-caret-up');
          buttonDown.classList.add('fa-caret-down');
        } else {
          li.classList.add('show');
          buttonDown.classList.remove('fa-caret-down');
          buttonDown.classList.add('fa-caret-up');
        }
      });
    }
  });
}
// End button menu


// Location
const boxLocationSection1 = document.querySelector('.section-1 .inner-location');
if (boxLocationSection1) {
  const boxInput = boxLocationSection1.querySelector('.inner-input-group ');
  const boxSuggest = boxLocationSection1.querySelector('.inner-suggest');
  const listItem = boxSuggest.querySelectorAll('.inner-item');
  const input = boxInput.querySelector('input');
  boxInput.addEventListener('click', () => {
    boxSuggest.classList.add('show');
  });
  listItem.forEach(item => {
    item.addEventListener('click', () => {
      const title = item.querySelector('.inner-name').innerHTML.trim();
      input.value = title;
      boxSuggest.classList.remove('show');
    });
  });
  document.addEventListener('click', (enent) => {
    if (!event.target.closest(".inner-location")) {
      boxSuggest.classList.remove('show');
    }
  });
}

// End Location

// Quantity
const boxQuantitySection1 = document.querySelector('.section-1 .inner-quantity');
if (boxQuantitySection1) {
  const boxInput = boxQuantitySection1.querySelector('.inner-input-group ');
  const boxListQuantity = boxQuantitySection1.querySelector('.inner-list-quantity');
  boxInput.addEventListener('click', () => {
    boxListQuantity.classList.add('show');
  })
  document.addEventListener('click', (enent) => {
    if (!event.target.closest(".inner-quantity")) {
      boxListQuantity.classList.remove('show');
    }
  })
  const listItem = boxListQuantity.querySelectorAll('.inner-item');
  listItem.forEach(item => {
    const buttonUp = item.querySelector('.inner-up');
    const buttonDown = item.querySelector('.inner-down');
    const input = item.querySelector('input');
    buttonDown.addEventListener('click', () => {
      if (input.value > 0) {
        const currentValue = parseInt(input.value);
        input.value = currentValue - 1;
      }
    })
    buttonUp.addEventListener('click', () => {
      const currentValue = parseInt(input.value);
      input.value = currentValue + 1;
    });
  });

}
// end Quantity

// Clock Expire
const clockExpire = document.querySelector('[clock-expire]');
if (clockExpire) {
  const timeClockExpire = clockExpire.getAttribute('clock-expire');
  const expireTime = new Date(timeClockExpire);
  const clockItemList = document.querySelectorAll('.section-2 .inner-clock-item .inner-number')
  const clockInterval = setInterval(() => {
    const currentTime = new Date();
    const remainingTime = expireTime - currentTime;
    if (remainingTime > 0) {
      const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor(remainingTime / (1000 * 60 * 60) % 24);
      const minutes = Math.floor(remainingTime / (1000 * 60) % 60)
      const seconds = Math.floor((remainingTime / 1000) % 60);
      clockItemList[0].innerHTML = days < 10 ? `0${days}` : days;
      clockItemList[1].innerHTML = hours < 10 ? `0${hours}` : hours;
      clockItemList[2].innerHTML = minutes < 10 ? `0${minutes}` : minutes;
      clockItemList[3].innerHTML = seconds < 10 ? `0${seconds}` : seconds;
    } else {
      clearInterval(clockInterval);
    }
  }, 1000)
}
// End Clock Expire

// Box Filter Section 9
const buttonFilter = document.querySelector('.section-9 .inner-button-filter');
if (buttonFilter) {
  const boxLeft = document.querySelector('.section-9 .inner-left');
  buttonFilter.addEventListener('click', () => {
    boxLeft.classList.toggle('show');
  })
}
// End Box Filter Section 9

// Boxn Tour Info
const boxnTourInfo = document.querySelector('.box-tour-info');
if (boxnTourInfo) {
  const boxTourContent = boxnTourInfo.querySelector('.box-tour-info .inner-content');
  const buttonShowAll = boxnTourInfo.querySelector('.box-tour-info .button-outline')
  buttonShowAll.addEventListener('click', () => {
    if (boxTourContent.classList.contains('show')) {
      boxTourContent.classList.remove('show');
      buttonShowAll.innerHTML = 'Thu gọn';
    }
    else {
      boxTourContent.classList.add('show');
      buttonShowAll.innerHTML = 'Xem tất cả';
    }
  })
  new Viewer(boxTourContent)
}
// End Boxn Tour Info


// Swiper Section2
const swiperSection2 = document.querySelector('.swiperSection2')
if (swiperSection2) {
  new Swiper('.swiperSection2', {
    slidesPerView: 1,
    spaceBetween: 20,
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
      1200: {
        slidesPerView: 3,
      },
    },
    autoplay: {
      delay: 2500,
      disableOnInteraction: true,
    },
  });
}
// End Swiper Section2

// Swiper Section3
const swiperSection3 = document.querySelector('.swiperSection3')
if (swiperSection3) {
  new Swiper('.swiperSection3', {
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      576: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 3,
      },
    },
    autoplay: {
      delay: 2500,
      disableOnInteraction: true,
    },
  });
}
// End Swiper Section3

// Swiper Main Section 10
const swiperMainSection10 = document.querySelector('.swiperMainSection10');
if (swiperMainSection10) {
  const swiperThumbSection10 = new Swiper('.swiperThumbSection10', {
    spaceBetween: 4,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
    breakpoints: {
      576: {
        spaceBetween: 10,
      },
    },
  });
  const swiperMainSection10 = new Swiper('.swiperMainSection10', {
    spaceBetween: 10,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    thumbs: {
      swiper: swiperThumbSection10,
    },
  });
}

// End Swiper Main Section 10

// Box Image
const boxImageMain = document.querySelector('.box-images .inner-image-main');
if (boxImageMain) {
  new Viewer(boxImageMain)
}
// End Box Image

// Box Tour Schedule 
const boxTourSchedule = document.querySelector('.box-tour-schedule')
if (boxTourSchedule) {
  new Viewer(boxTourSchedule)
}
// End Box Tour Schedule

// Email Form
const emailForm = document.querySelector('#emailForm');
if (emailForm) {
  const validator = new JustValidate('#emailForm');
  validator
    .addField("#email", [
      {
        rule: 'required',
        errorMessage: 'Email không được để trống',
      },
      {
        rule: 'email',
        errorMessage: 'Email không hợp lệ',
      },
    ])
    .onSuccess((event) => {
      const email = event.target.elements.email.value;
      const dataFinal = {
        email: email,
      }
      fetch('/contact/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataFinal),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.code === 'error') {
            notyf.error(data.message);
          }
          if (data.code === 'success') {
            notyf.success(data.message);
          }
        })
    })
}
// End Email Form

// Coupon Form
let appliedCoupon = "";
const couponForm = document.querySelector('#couponForm');
if (couponForm) {
  const validator = new JustValidate('#couponForm');
  validator
    .addField("#coupon", [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mã giảm giá!',
      }
    ])
    .onSuccess((event) => {
      appliedCoupon = event.target.elements.coupon.value.trim();
      drawCart();
    })
}
// End Coupon Form

// Order Form
const orderForm = document.querySelector('#orderForm');
if (orderForm) {
  const validator = new JustValidate('#orderForm');
  validator
    .addField("#fullname", [
      {
        rule: 'required',
        errorMessage: 'Vui lòng điền tên!',
      },
      {
        rule: 'minLength',
        value: 5,
        errorMessage: 'Tên tối thiểu 5 kí tự!',
      },
      {
        rule: 'maxLength',
        value: 50,
        errorMessage: 'Họ và tên không được quá 50 ký tự!',
      },
    ])
    .addField("#phone", [
      {
        rule: 'required',
        errorMessage: 'Vui lòng điền số điện thoại!',
      },
      {
        rule: 'customRegexp',
        value: /^(0|\+?84)[35789]\d{8}$/,
        errorMessage: 'Số điện thoại chưa đúng định dạng Việt Nam!',
      },
    ])
    .onSuccess((event) => {
      const fullName =  event.target.fullname.value
      const phone = event.target.phone.value
      const note = event.target.note.value
      const paymentMethod = event.target.paymentMethod.value

      // Đã đăng nhập: server tự lấy các tour được chọn từ giỏ hàng trong DB
      let cart = [];
      if (!loggedIn) {
        cart = cartStore.getLocal().filter(item => item.checked);
        if (cart.length == 0) {
          notyf.error("Vui lòng chọn ít nhất 1 tour!");
          return;
        }
      }
      const dataFinal = {
        fullName: fullName,
        phone: phone,
        note: note,
        paymentMethod: paymentMethod,
        items: cart,
        coupon: appliedCoupon,
      }
      fetch('/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataFinal),
        })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 'error') {
            if (data.redirect) {
              drawNotyf('error', data.message);
              window.location.href = data.redirect;
              return;
            }
            notyf.error(data.message);
          }
          if (data.code === 'success') {
            // Cập nhật lại gior hàng
            if (!loggedIn) {
              cartStore.setLocal(cartStore.getLocal().filter(item => item.checked == false));
            }
            
            switch (paymentMethod) {
              case "money":
              case "bank":
                drawNotyf('success', data.message);
                window.location.href = `/order/success?orderCode=${data.orderCode}&phone=${phone}`;
                break;
              case "zalopay":
                window.location.href = `/order/payment-zalopay?orderCode=${data.orderCode}&phone=${phone}`;
                break;
              case "vnpay":
                window.location.href = `/order/payment-vnpay?orderCode=${data.orderCode}&phone=${phone}`;
                break;
              default:
                notyf.error("Vui lòng chọn phương thức thanh toán!");
                window.location.href = `/`;
                break;
            }
            
          }
        })
    })

  // Bank info section12
  const bankInfo = orderForm.querySelector('.inner-bank ');
  const paymentMethods = orderForm.querySelectorAll('input[name="paymentMethod"]');
  if (bankInfo && paymentMethods.length > 0) {
    paymentMethods.forEach((input) => {
      input.addEventListener('change', () => {
        if (input.id === 'paymentMethodBank' && input.checked) {
          bankInfo.classList.add('show');
        } else {
          bankInfo.classList.remove('show');
        }
      })
    })
  }
  // End Bank info section12

}
// End Order Form


// Box filter
const boxFilter = document.querySelector('.box-filter');
if (boxFilter) {
  const url = new URL(`${window.location.origin}/search`);
  const filterList = [
    "locationFrom",
    "locationTo",
    "departureDate",
    "stockAdult",
    "stockChildren",
    "stockBaby",
    "price"
  ]
  const buttonApply = boxFilter.querySelector('.inner-button');
  buttonApply.addEventListener('click', () => {
    for (const filter of filterList) {
      const input = boxFilter.querySelector(`[name="${filter}"]`);
      if (input) {
        const value = input.value;
        if (value && value !== "0") {
          url.searchParams.set(filter, value);
        } else {
          url.searchParams.delete(filter);
        }
      }
    }
    window.location.href = url.toString();
  })
  // Hiển thị filter đã chọn
  const urlCurrent = new URL(window.location.href);
  filterList.forEach((filter) => {
    const valueCurrent = urlCurrent.searchParams.get(filter);
    if (valueCurrent) {
      boxFilter.querySelector(`[name="${filter}"]`).value = valueCurrent;
    }
  })
  // end Hiển thị filter đã chọn
}
// end Box filter

// Form serch 
const formSearch = document.querySelector('[formSearch]');
if (formSearch) {
  const url = new URL(`${window.location.origin}/search`);
  const filterList = [
    "locationTo",
    "departureDate",
    "stockAdult",
    "stockChildren",
    "stockBaby",
  ]
  formSearch.addEventListener('submit', (e) => {
    e.preventDefault();
    for (const filter of filterList) {
      const input = formSearch.querySelector(`[name="${filter}"]`);
      if (input) {
        const value = input.value;
        if (value && value !== "0") {
          url.searchParams.set(filter, value);
        } else {
          url.searchParams.delete(filter);
        }
      }
    }
    window.location.href = url.toString();
  })
}
// end Form serch

// Hiển thị mini cart
const drawMiniCart = async () => {
  const miniCart = document.querySelector("[miniCart]");
  if (miniCart) {
    const count = await cartStore.count();
    miniCart.innerHTML = count > 0 ? count : "0";
  }
}
// end Hiển thị mini cart

// box tour detail
const boxTourDetail = document.querySelector(".box-tour-detail")
if (boxTourDetail) {
  const listInputQuantity = boxTourDetail.querySelectorAll("[inputQuantity]")
  listInputQuantity.forEach(input => {
    input.addEventListener("input", () => {
      const name = input.name
      let value = parseInt(input.value) || 0
      const min = parseInt(input.min) || 0
      const max = parseInt(input.max)
      if (value < min) {
        value = min;
        input.value = min
        notyf.error(`Số lượng tối thiểu là ${min}`)
      }
      if (value > max) {
        value = max;
        input.value = max
        notyf.error(`Số lượng tối đa là ${max}`)
      }
      boxTourDetail.querySelector(`[stockLabel=${name}]`).innerHTML = value
      let total = 0
      listInputQuantity.forEach(item => {
        total += parseInt(item.value) * parseInt(item.getAttribute("price"))
      })
      boxTourDetail.querySelector("[total]").innerHTML = total.toLocaleString("vi-VN")
    })
  })
  // Thêm vào giỏ hàng
  const buttonAddToCart = boxTourDetail.querySelector("[button-add-cart]")
  buttonAddToCart.addEventListener("click", async () => {
    const tourId = buttonAddToCart.getAttribute("tour-id")
    const locationForm = document.querySelector(`[name="locationForm"]`).value
    const quantityAdult = parseInt(document.querySelector(`[name="stockAdult"]`).value)
    const quantityChildren = parseInt(document.querySelector(`[name="stockChildren"]`).value)
    const quantityBaby = parseInt(document.querySelector(`[name="stockBaby"]`).value)
    if (quantityAdult < 1) {
      notyf.error("Vui lòng chọn ít nhất 1 người lớn");
      return;
    }
    const result = await cartStore.upsert({
      tourId: tourId,
      locationForm: locationForm,
      quantityAdult: quantityAdult,
      quantityChildren: quantityChildren,
      quantityBaby: quantityBaby,
      checked: true
    });
    if (result.code === "error") {
      notyf.error(result.message);
      return;
    }
    notyf.success(result.existed ? "Đã cập nhật giỏ hàng" : "Đã thêm vào giỏ hàng");
    drawMiniCart();
  })
  // Thêm vào giỏ hàng
}
//  end box tour detail


// Trang giỏ hàng
const eventInputQuantity = () => {
  const listInputQuantity = document.querySelectorAll("[inputQuantity]");
  listInputQuantity.forEach(input => {
    input.addEventListener("change", async () => {
      const name = input.name
      let value = parseInt(input.value) || 0
      const min = parseInt(input.min) || 0
      const max = parseInt(input.max)

      if (value < min) {
        value = min;
        input.value = min
        notyf.error(`Số lượng tối thiểu là ${min}`)
      }
      if (value > max) {
        value = max;
        input.value = max
        notyf.error(`Số lượng tối đa là ${max}`)
      }
      const tourId = input.getAttribute("tourId")
      await cartStore.upsert({ tourId: tourId, [name]: value });
      drawCart();
    })
  })
}

const eventRemove = () => {
  const listButtonRemove = document.querySelectorAll("[button-remove")
  listButtonRemove.forEach(button => {
    button.addEventListener("click", async () => {
      const tourId = button.getAttribute("tourId")
      await cartStore.remove(tourId);
      drawCart();
      drawMiniCart();
      notyf.success("Đã xoá!");
    })
  })
}

const eventCheck = () => {
  const listInputCheck = document.querySelectorAll("[inputCheck]")
  listInputCheck.forEach(input => {
    input.addEventListener("change", async () => {
      const tourId = input.getAttribute("tourId")
      await cartStore.upsert({ tourId: tourId, checked: input.checked });
      drawCart();
    })
  })
}
const drawCart = () => {
  // Đã đăng nhập: server tự lấy giỏ hàng từ DB, không cần gửi dữ liệu
  const cartItems = loggedIn ? "[]" : JSON.stringify(cartStore.getLocal());
  fetch("/cart/detail", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: cartItems,
  })
    .then(res => res.json())
    .then(data => {
      if (data.code === 'error') {
        if (!loggedIn) {
          cartStore.setLocal([]);
        }
        drawMiniCart();
        notyf.error(data.message);
      }
      if (data.code === 'success') {
        // Cờ đăng nhập ở client lệch với server => đồng bộ lại rồi vẽ lại
        if (data.loggedIn !== loggedIn) {
          loggedIn = data.loggedIn;
          drawCart();
          return;
        }
        let subTotal = 0;
        const htmlArray = data.cartDetail.map(item => {
          const { detail } = item;
          if(item.checked){
            subTotal += parseInt(detail.newPriceAdult) * parseInt(item.quantityAdult);
            subTotal += parseInt(detail.newPriceChildren) * parseInt(item.quantityChildren);
            subTotal += parseInt(detail.newPriceBaby) * parseInt(item.quantityBaby);
          }
          return `
          <div class="inner-tour-item">
            <div class="inner-actions"><span class="inner-remove" button-remove tourId="${item.tourId}"><i class="fa-solid fa-xmark"></i></span>
              <input class="inner-check" inputCheck tourId="${item.tourId}" type="checkbox" ${item.checked ? "checked" : ""}/>
            </div>
            <div class="inner-product"><a class="inner-image" href="/tour/detail/${detail.slug}"><img alt="${detail.tourName}" src="${detail.avatar}" onerror="this.src='https://placehold.co/140x100?text=No+Image'"/></a>
              <div class="inner-content">
                <h3 class="inner-title">
                  <a href="/tour/detail/${detail.slug}">${detail.tourName}</a>
                </h3>
                <div class="inner-desc">
                  <div>Ngày Khởi Hành: <b>${detail.departureDate}</b></div>
                  <div>Khởi Hành Tại: <b>${detail.cityName}</b></div>
                </div>
              </div>
            </div>
            <div class="inner-quantity">
              <div class="inner-label">Số Lượng Hành Khách</div>
              <div class="inner-list">
                <div class="inner-item">
                  <label for="">Người lớn:</label>
                  <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                    <input
                      value="${item.quantityAdult}" 
                      name="quantityAdult"
                      tourId="${item.tourId}" 
                      type="number"
                      min = "1"
                      max = "${detail.stockAdult}"
                      inputQuantity
                    />
                    ${detail.stockAdult < item.quantityAdult ? `<span class="inner-error" style="position:absolute; top: 100%; white-space: nowrap;"> Còn lại ${detail.stockAdult}</span>` : ""}
                  </div>
                  <span>${item.quantityAdult} x<span class="text-main">${detail.newPriceAdult.toLocaleString("vi-VN")}</span></span>
                </div>
                <div class="inner-item">
                  <label for="">Trẻ em:</label>
                  <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                    <input
                      value="${item.quantityChildren}" 
                      name="quantityChildren" 
                      tourId="${item.tourId}"
                      type="number"
                      min = "0"
                      max = "${detail.stockChildren}" 
                      inputQuantity
                    />
                    ${detail.stockChildren < item.quantityChildren ? `<span class="inner-error" style="position:absolute; top: 100%; white-space: nowrap;"> Còn lại ${detail.stockChildren}</span>` : ""}
                  </div>
                  <span>${item.quantityChildren} x<span class="text-main">${detail.newPriceChildren.toLocaleString("vi-VN")}</span></span>
                </div>
                <div class="inner-item">
                  <label for="">Em bé:</label>
                  <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                    <input
                      value="${item.quantityBaby}" 
                      name="quantityBaby"
                      tourId="${item.tourId}"
                      type="number"
                      min = "0"
                      max = "${detail.stockBaby}"
                      inputQuantity
                    />
                    ${detail.stockBaby < item.quantityBaby ? `<span class="inner-error" style="position:absolute; top: 100%; white-space: nowrap;"> Còn lại ${detail.stockBaby}</span>` : ""}
                  </div>
                  <span>${item.quantityBaby} x<span class="text-main">${detail.newPriceBaby.toLocaleString("vi-VN")}</span></span>
                </div>
              </div>
            </div>
          </div>
          `
        })
        const elementCartList = document.querySelector("[cart-list]");
        elementCartList.innerHTML = htmlArray.join('');
        const elementSubTotal = pageCart.querySelector("[sub-total]");
        elementSubTotal.innerHTML = subTotal.toLocaleString("vi-VN");
        const drawDiscount = (discount) => {
          pageCart.querySelector("[discount]").innerHTML = discount.toLocaleString("vi-VN");
          pageCart.querySelector("[total]").innerHTML = (subTotal - discount).toLocaleString("vi-VN");
        };
        drawDiscount(0);
        if (appliedCoupon) {
          fetch("/cart/coupon", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              coupon: appliedCoupon,
              items: data.cartDetail.filter(item => item.checked),
            }),
          })
            .then(res => res.json())
            .then(result => {
              if (result.code === 'error') {
                appliedCoupon = "";
                notyf.error(result.message);
              }
              if (result.code === 'success') drawDiscount(result.discount);
            })
        }
        eventInputQuantity();
        eventRemove();
        eventCheck();
      }
    })
}

const pageCart = document.querySelector("[page-cart]")

// Khởi tạo: gộp giỏ hàng localStorage vào DB (nếu đã đăng nhập) rồi vẽ lại
mergeLocalCart().then(() => {
  drawMiniCart();
  if (pageCart) {
    drawCart();
  }
});
// end Trang giỏ hàng

// Ph�n trang
const buttonsPagination = document.querySelectorAll('[button-pagination]');
if(buttonsPagination.length > 0) {
  let url = new URL(window.location.href);
  buttonsPagination.forEach(button => {
    button.addEventListener('click', () => {
      const page = button.getAttribute('button-pagination');
      url.searchParams.set('page', page);
      window.location.href = url.href;
    });
  });
}
// End Ph�n trang

// Button delete (dùng chung: thêm thuộc tính button-delete, data-api, tuỳ chọn data-confirm và data-method)
const listBtnDelete = document.querySelectorAll('[button-delete]');
if (listBtnDelete.length > 0) {
  listBtnDelete.forEach((button) => {
    button.addEventListener('click', () => {
      const message = button.getAttribute('data-confirm') || 'Vui lòng xác nhận xóa!';
      if (!confirm(message)) {
        return;
      }
      const dataApi = button.getAttribute('data-api');
      const method = button.getAttribute('data-method') || 'PATCH';
      button.disabled = true;
      fetch(dataApi, {
        method: method,
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') {
            button.disabled = false;
            notyf.error(data.message);
          }
          if (data.code === 'success') {
            drawNotyf(data.code, data.message); // In ra thông báo thành công khi bị load lại trang
            window.location.reload();
          }
        })
        .catch(() => {
          button.disabled = false;
          notyf.error('Có lỗi xảy ra, vui lòng thử lại!');
        });
    });
  });
}
// End button delete


// ============================================================
// CLIENT MY-ORDERS HANDLERS (FILTER, SEARCH, PAGINATION, CANCEL)
// ============================================================

// 1. Filter
const listOrderFilter = document.querySelectorAll('.section-4 [filter]');
if (listOrderFilter.length > 0) {
  let url = new URL(window.location.href);
  let listName = [];
  listOrderFilter.forEach((filter) => {
    listName.push(filter.name);
    filter.addEventListener('change', () => {
      const name = filter.name;
      const value = filter.value;
      if (value) {
        url.searchParams.set(name, value);
      } else {
        url.searchParams.delete(name);
      }
      url.searchParams.delete('page');
      window.location.href = url.href;
    });
    const valueCurrent = url.searchParams.get(filter.name);
    if (valueCurrent) {
      filter.value = valueCurrent;
    }
  });

  const btnResetFilter = document.querySelector('.section-4 [button-reset-filter]');
  if (btnResetFilter) {
    btnResetFilter.addEventListener('click', () => {
      listName.forEach((name) => {
        url.searchParams.delete(name);
      });
      url.searchParams.delete('page');
      window.location.href = url.href;
    });
  }
}

// 2. Search
const orderSearchForm = document.querySelector('.section-5 .inner-search');
if (orderSearchForm) {
  let url = new URL(window.location.href);
  orderSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = orderSearchForm.querySelector('[input-search]');
    const value = input ? input.value.trim() : '';
    if (value) {
      url.searchParams.set('keyword', value);
    } else {
      url.searchParams.delete('keyword');
    }
    url.searchParams.delete('page');
    window.location.href = url.href;
  });
  const valueCurrent = url.searchParams.get('keyword');
  if (valueCurrent) {
    const input = orderSearchForm.querySelector('[input-search]');
    if (input) input.value = valueCurrent;
  }
}

// 3. Pagination select
const orderPaginationSelect = document.querySelector('.section-7 select[pagination]');
if (orderPaginationSelect) {
  let url = new URL(window.location.href);
  orderPaginationSelect.addEventListener('change', () => {
    const value = orderPaginationSelect.value;
    url.searchParams.set('page', value);
    window.location.href = url.href;
  });
  const valueCurrent = url.searchParams.get('page');
  if (valueCurrent) {
    orderPaginationSelect.value = valueCurrent;
  }
}

// 4. Cancel Order Button (detail page)
const btnCancelOrder = document.querySelector('[button-cancel-order]');
if (btnCancelOrder) {
  btnCancelOrder.addEventListener('click', () => {
    if (!confirm('Bạn có chắc chắn muốn huỷ đơn hàng này không?')) {
      return;
    }
    const api = btnCancelOrder.getAttribute('data-api');
    btnCancelOrder.style.pointerEvents = 'none';
    btnCancelOrder.innerText = 'Đang xử lý huỷ đơn...';

    fetch(api, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.code === 'success') {
          if (typeof drawNotyf === 'function') {
            drawNotyf(data.code, data.message);
          } else if (typeof notyf !== 'undefined') {
            notyf.success(data.message);
          }
          window.location.reload();
        } else {
          if (typeof notyf !== 'undefined') {
            notyf.error(data.message);
          } else {
            alert(data.message);
          }
          btnCancelOrder.style.pointerEvents = 'auto';
          btnCancelOrder.innerText = 'Hủy đơn hàng';
        }
      })
      .catch(() => {
        if (typeof notyf !== 'undefined') {
          notyf.error('Có lỗi xảy ra, vui lòng thử lại!');
        } else {
          alert('Có lỗi xảy ra, vui lòng thử lại!');
        }
        btnCancelOrder.style.pointerEvents = 'auto';
        btnCancelOrder.innerText = 'Hủy đơn hàng';
      });
  });
}
